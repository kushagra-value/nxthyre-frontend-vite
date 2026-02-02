import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Building2,
  MapPin,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Filter,
  DollarSign,
  History,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  Clock10,
  Briefcase,
  Star,
  X,
} from "lucide-react";
import { debounce } from "lodash";
import {
  candidateService,
  CandidateListItem,
} from "../services/candidateService";
import { showToast } from "../utils/toast";

interface FiltersSidebarProps {
  filters: {
    keywords: string;
    booleanSearch: boolean;
    boolQuery?: string;
    semanticSearch: boolean;
    selectedCategories: string[];
    minExperience: string;
    maxExperience: string;
    funInCurrentCompany: boolean;
    minTotalExp: string;
    maxTotalExp: string;
    city: string;
    country: string;
    locations: string[];
    noticePeriod: string;
    companies: string;
    industries: string;
    minSalary: string;
    maxSalary: string;
    colleges: string;
    topTierUniversities: boolean;
    computerScienceGraduates: boolean;
    showFemaleCandidates: boolean;
    recentlyPromoted: boolean;
    backgroundVerified: boolean;
    hasCertification: boolean;
    hasResearchPaper: boolean;
    hasLinkedIn: boolean;
    hasBehance: boolean;
    hasTwitter: boolean;
    hasPortfolio: boolean;
    jobId: string;
    application_type: string;
    is_prevetted: boolean;
    is_active: boolean;
    sort_by: string;
  };
  defaultBoolQuery: string; // Now sourced from localStorage based on jobId
  onApplyFilters: (filters: any) => void;
  setCandidates: (candidates: CandidateListItem[]) => void;
  candidates: CandidateListItem[];
  activeTab: string;
  isSearchMode: boolean;
}

// interface FilterMenuProps {
//   filters: FiltersSidebarProps["filters"];
//   updateTempFilters: (key: string, value: any) => void;
// }

// const FilterMenu: React.FC<FilterMenuProps> = ({
//   filters,
//   updateTempFilters,
// }) => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="relative flex items-center justify-end px-2 pb-1">
//       <button onClick={toggleMenu}>
//         <CircleEllipsis className="h-5 w-5 text-gray-500" />
//       </button>
//       {isMenuOpen && (
//         <div
//           ref={dropdownRef}
//           className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-in-out z-10"
//           style={{
//             opacity: isMenuOpen ? 1 : 0,
//             transform: `translateY(${isMenuOpen ? 0 : -10}px)`,
//           }}
//         >
//           <div className="py-1">
//             {/* <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700">
//               <span>Semantic Search</span>
//               <button
//                 onClick={() =>
//                   updateTempFilters("semanticSearch", !filters.semanticSearch)
//                 }
//                 className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
//                   filters.semanticSearch ? "bg-blue-500" : "bg-gray-300"
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
//                     filters.semanticSearch ? "translate-x-4" : "translate-x-1"
//                   }`}
//                 />
//               </button>
//             </div> */}
//             {/* <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700">
//               <span>Boolean Search</span>
//               <button
//                 onClick={() =>
//                   updateTempFilters("booleanSearch", !filters.booleanSearch)
//                 }
//                 className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
//                   filters.booleanSearch ? "bg-blue-500" : "bg-gray-300"
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
//                     filters.booleanSearch ? "translate-x-4" : "translate-x-1"
//                   }`}
//                 />
//               </button>
//             </div> */}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

const BooleanSearchComponent: React.FC<{
  boolQuery: string;
  onChange: (query: string) => void;
  onClose: () => void;
}> = ({ boolQuery, onChange, onClose }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [boolQuery]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={boolQuery}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your boolean search query here..."
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none min-h-[80px]"
        rows={1}
      />
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
        title="Close Boolean Search"
      >
        <X className="w-3 h-3 text-gray-600" />
      </button>
    </div>
  );
};

type SectionKey =
  | "keywords"
  | "experience"
  | "totalExp"
  | "location"
  | "companies"
  | "salary"
  | "notice"
  | "colleges"
  | "spotlight"
  | "moreFilters";

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  filters,
  defaultBoolQuery,
  onApplyFilters,
  setCandidates,
  candidates,
  activeTab,
  isSearchMode,
}) => {
  const [expandedSections, setExpandedSections] = useState<
    Record<SectionKey, boolean>
  >({
    keywords: true,
    experience: false,
    totalExp: true,
    location: true,
    companies: false,
    salary: false,
    notice: false,
    colleges: false,
    spotlight: false,
    moreFilters: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationManuallyEdited, setIsLocationManuallyEdited] =
    useState(false);

  const keywordTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [tempFilters, setTempFilters] = useState({
    ...filters,
    keywords: Array.isArray(filters.keywords)
      ? filters.keywords.join(", ")
      : "",
    boolQuery: filters.boolQuery || "",
  });

  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [currentCountry, setCurrentCountry] = useState<string>("");
  const [currentCity, setCurrentCity] = useState<string>("");

  useEffect(() => {
    if (JSON.stringify(filters) !== JSON.stringify(tempFilters)) {
      setTempFilters({
        ...filters,
        keywords: Array.isArray(filters.keywords)
          ? filters.keywords.join(", ")
          : filters.keywords || "",
        boolQuery: filters.boolQuery || "",
      });
    }
  }, [filters]);

  useEffect(() => {
    if (!tempFilters.booleanSearch && keywordTextareaRef.current) {
      keywordTextareaRef.current.style.height = "auto";
      keywordTextareaRef.current.style.height = `${keywordTextareaRef.current.scrollHeight}px`;
    }
  }, [tempFilters.keywords, tempFilters.booleanSearch]);

  const fetchCountrySuggestions = useCallback(
    debounce(async (query: string) => {
      console.log("[Country] Fetch triggered with query:", query);

      if (query.length < 2) {
        setCountrySuggestions([]);
        return;
      }

      setIsLoadingCountries(true);
      try {
        const suggestions = await candidateService.getCountrySuggestions(query);
        console.log("[Country] Raw API response:", suggestions);

        const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
        setCountrySuggestions(safeSuggestions);
        console.log("[Country] Final suggestions set:", safeSuggestions);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountrySuggestions([]);
      } finally {
        setIsLoadingCountries(false);
      }
    }, 300),
    [], // ← No dependencies, just like keywords
  );

  const fetchCitySuggestions = useCallback(
    debounce(async (query: string) => {
      console.log("[City] Fetch triggered with query:", query);

      if (query.length < 2) {
        setCitySuggestions([]);
        return;
      }

      setIsLoadingCities(true);
      try {
        const suggestions = await candidateService.getCitySuggestions(query);
        console.log("[City] Raw API response:", suggestions);

        const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
        setCitySuggestions(safeSuggestions);
        console.log("[City] Final suggestions set:", safeSuggestions);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCitySuggestions([]);
      } finally {
        setIsLoadingCities(false);
      }
    }, 300),
    [], // ← No dependencies
  );

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateTempFilters = (key: string, value: any) => {
    let newFilters = { ...tempFilters, [key]: value };

    if (key === "booleanSearch") {
      if (value === true) {
        newFilters.keywords = "";
        if (!newFilters.boolQuery && defaultBoolQuery) {
          newFilters.boolQuery = defaultBoolQuery;
        }
      } else {
        newFilters.boolQuery = "";
      }
    }

    if (key === "booleanSearch" && value === true) {
      const storedQuery = localStorage.getItem(`bool_query_${filters.jobId}`);
      if (storedQuery && !newFilters.boolQuery) {
        newFilters.boolQuery = storedQuery;
      } else if (defaultBoolQuery && !newFilters.boolQuery) {
        newFilters.boolQuery = defaultBoolQuery;
      }
    }

    if (key === "country") {
      if (value !== tempFilters.country) {
        newFilters.locations = []; // Clear selected city when country changes
      }
      setIsLocationManuallyEdited(false);
    }

    // Enforce single city: if user somehow tries to set locations as multiple, keep only the latest
    if (key === "locations" && Array.isArray(value)) {
      if (value.length > 1) {
        newFilters.locations = [value[value.length - 1]]; // Keep only the most recent
      }
    }

    setTempFilters(newFilters);
  };

  const addLocation = (location: string) => {
    const trimmed = location.trim();
    if (trimmed) {
      const lower = trimmed.toLowerCase();
      if (tempFilters.locations.some((loc) => loc.toLowerCase() === lower)) {
        showToast.error("This location is already added.");
        return;
      }
      updateTempFilters("locations", [...tempFilters.locations, trimmed]);
      setCurrentLocation(""); // Clear input
    }
  };

  // Handle close boolean search
  const handleCloseBooleanSearch = () => {
    updateTempFilters("booleanSearch", false);
  };

  // Handle bool query change
  const handleBoolQueryChange = (query: string) => {
    updateTempFilters("boolQuery", query);
  };

  const isFilterSelected = () => {
    // Always allow applying filters based on tab selection (jobId, application_type, is_prevetted, is_active, sort_by)
    // Check other filters only for validation when they are provided
    return true; // Since tab selection is enough, we return true to allow filter application
  };

  const validateFilters = () => {
    const isValidNumber = (value: string) => /^\d+$/.test(value);

    if (
      (tempFilters.minTotalExp && !isValidNumber(tempFilters.minTotalExp)) ||
      (tempFilters.maxTotalExp && !isValidNumber(tempFilters.maxTotalExp)) ||
      (tempFilters.minExperience &&
        !isValidNumber(tempFilters.minExperience)) ||
      (tempFilters.minSalary && !isValidNumber(tempFilters.minSalary)) ||
      (tempFilters.maxSalary && !isValidNumber(tempFilters.maxSalary))
    ) {
      showToast.error(
        "Invalid input in experience or salary fields. Please enter numbers only.",
      );
      return false;
    }

    if (
      tempFilters.minTotalExp &&
      tempFilters.maxTotalExp &&
      Number(tempFilters.minTotalExp) > Number(tempFilters.maxTotalExp)
    ) {
      showToast.error(
        "Minimum total experience cannot be greater than maximum.",
      );
      return false;
    }

    if (
      tempFilters.minSalary &&
      tempFilters.maxSalary &&
      Number(tempFilters.minSalary) > Number(tempFilters.maxSalary)
    ) {
      showToast.error("Minimum salary cannot be greater than maximum.");
      return false;
    }

    // Add similar checks for other ranges if needed

    return true;
  };

  const resetFilters = () => {
    setIsLocationManuallyEdited(false);
    const resetTemp = {
      keywords: "",
      booleanSearch: false,
      boolQuery: "",
      semanticSearch: false,
      selectedCategories: [],
      minExperience: "",
      maxExperience: "",
      funInCurrentCompany: false,
      minTotalExp: "",
      maxTotalExp: "",
      city: "",
      country: "",
      locations: [],
      noticePeriod: "",
      companies: "",
      industries: "",
      minSalary: "",
      maxSalary: "",
      colleges: "",
      topTierUniversities: false,
      computerScienceGraduates: false,
      showFemaleCandidates: false,
      recentlyPromoted: false,
      backgroundVerified: false,
      hasCertification: false,
      hasResearchPaper: false,
      hasLinkedIn: false,
      hasBehance: false,
      hasTwitter: false,
      hasPortfolio: false,
      jobId: filters.jobId,
      application_type: activeTab,
      is_prevetted: activeTab === "prevetted",
      is_active: activeTab === "active",
      sort_by: "",
    };
    setTempFilters(resetTemp);
    setCandidates([]);
    onApplyFilters(resetTemp);
  };

  const applyFilters = async () => {
    if (!validateFilters()) {
      return;
    }

    setIsLoading(true);
    try {
      await onApplyFilters(tempFilters);
    } catch (error) {
      showToast.error("Failed to apply filters. Please try again.");
      console.error("Error applying filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const noticePeriodOptions = [
    "Immediate",
    "15 days",
    "30 days",
    "45 days",
    "60 days",
    "90 days",
  ];

  return (
    <div className="bg-white rounded-xl p-3 lg:p-4 flex flex-col max-h-[calc(100vh - 60px)] overflow-y-auto relative hide-scrollbar">
      <div className="pb-20">
        {/* Keywords / Boolean Search */}
        <div className="border-b border-gray-200 mb-4 pb-4 px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm lg:text-base font-[400] text-gray-700 flex items-center">
              <Search className="w-4 h-4 mr-2 text-gray-500" />
              {tempFilters.booleanSearch ? "Boolean Search" : "Keywords"}
            </h3>
            <div className="flex gap-2 cursor-pointer">
              {/* <FilterMenu
                filters={tempFilters}
                updateTempFilters={updateTempFilters}
              /> */}
              <div className="flex items-center gap-2 pl-4 py-2 text-sm text-gray-700">
                <span
                  className={`${tempFilters.booleanSearch ? "hidden" : "flex"}`}
                >
                  Boolean Search
                </span>
                <button
                  onClick={() =>
                    updateTempFilters(
                      "booleanSearch",
                      !tempFilters.booleanSearch,
                    )
                  }
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                    tempFilters.booleanSearch ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                      tempFilters.booleanSearch
                        ? "translate-x-4"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div
                className="cursor-pointer"
                onClick={() => toggleSection("keywords")}
              >
                {expandedSections.keywords ? (
                  <ChevronUp className="w-4 h-4 mt-2 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 mt-2 text-gray-500" />
                )}
              </div>
            </div>
          </div>
          {expandedSections.keywords && (
            <div className="space-y-2">
              {tempFilters.booleanSearch ? (
                <BooleanSearchComponent
                  boolQuery={tempFilters.boolQuery || ""}
                  onChange={handleBoolQueryChange}
                  onClose={handleCloseBooleanSearch}
                />
              ) : (
                <>
                  <div className="relative">
                    <textarea
                      ref={keywordTextareaRef}
                      value={tempFilters.keywords || ""}
                      onChange={(e) =>
                        updateTempFilters("keywords", e.target.value)
                      }
                      placeholder='Enter keywords separated by commas, e.g. "python*, react, css, llm*" (* marks compulsory/must-have terms)'
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none min-h-[80px] overflow-hidden"
                      rows={1}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="max-h-[calc(100vh-60px)] overflow-y-auto hide-scrollbar">
          {/* Total Experience */}
          <div
            className={`bg-[#F5F9FB] rounded-t-lg  p-4 ${
              expandedSections.totalExp
                ? "mb-4 rounded-lg"
                : "border-b border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between cursor-pointer ${
                expandedSections.totalExp ? "mb-2" : ""
              }`}
              onClick={() => toggleSection("totalExp")}
            >
              <h3 className="text-sm lg:text-base font-[400] text-gray-700 flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                Total Experience
              </h3>
              {expandedSections.totalExp ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            {expandedSections.totalExp && (
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="0 Years"
                      value={tempFilters.minTotalExp}
                      onChange={(e) =>
                        updateTempFilters("minTotalExp", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 bg-white"
                      pattern="\d*"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /[^0-9]/g,
                          "",
                        );
                      }}
                    />
                    <label className="text-xs text-gray-500 mt-1 block">
                      Minimum Exp
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="5 Years"
                      value={tempFilters.maxTotalExp}
                      onChange={(e) =>
                        updateTempFilters("maxTotalExp", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 bg-white"
                      pattern="\d*"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /[^0-9]/g,
                          "",
                        );
                      }}
                    />
                    <label className="text-xs text-gray-500 mt-1 block">
                      Maximum Exp
                    </label>
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="5 Years"
                    value={tempFilters.minExperience}
                    onChange={(e) =>
                      updateTempFilters("minExperience", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 bg-white"
                    pattern="\d*"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(
                        /[^0-9]/g,
                        "",
                      );
                    }}
                  />
                  <label className="text-xs text-gray-500 mt-1 block">
                    Experience in current company
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div
            className={`bg-[#F5F9FB]  p-4 ${
              expandedSections.location
                ? "my-4 rounded-lg"
                : "border-b border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between cursor-pointer ${
                expandedSections.location ? "mb-2" : ""
              }`}
              onClick={() => toggleSection("location")}
            >
              <h3 className="text-sm lg:text-base font-[400] text-gray-700 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                Location
              </h3>
              {expandedSections.location ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            {expandedSections.location && (
              <>
                <div className="flex justify-between items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search country..."
                      className="w-full flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                      value={currentCountry} // ← Use separate state
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log("[Country Input] User typed:", value);
                        setCurrentCountry(value); // ← Update separate state
                        fetchCountrySuggestions(value); // ← Pass value directly

                        // Clear city when country changes
                        if (tempFilters.locations.length > 0) {
                          updateTempFilters("locations", []);
                          setCurrentCity("");
                        }
                      }}
                    />
                    {currentCountry.length >= 2 &&
                      (isLoadingCountries || countrySuggestions.length > 0) && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                          {isLoadingCountries ? (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                              Loading countries...
                            </div>
                          ) : (
                            countrySuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  setCurrentCountry(suggestion); // ← Update input state
                                  updateTempFilters("country", suggestion); // ← Update filter
                                  setCountrySuggestions([]);
                                }}
                                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                              >
                                {suggestion}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    <label className="text-xs text-gray-500 mt-1 block">
                      Country
                    </label>
                  </div>

                  {/* City Searchable Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={
                        tempFilters.country
                          ? "Search city..."
                          : "Select country first"
                      }
                      className="w-full flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                      value={currentCity} // ← Use separate state
                      onChange={(e) => {
                        if (!tempFilters.country) return;
                        const value = e.target.value;
                        console.log("[City Input] User typed:", value);
                        setCurrentCity(value); // ← Update separate state
                        fetchCitySuggestions(value); // ← Pass value directly
                      }}
                      disabled={!tempFilters.country}
                    />
                    {tempFilters.country &&
                      currentCity.length >= 2 &&
                      (isLoadingCities || citySuggestions.length > 0) && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                          {isLoadingCities ? (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                              Loading cities...
                            </div>
                          ) : (
                            citySuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  setCurrentCity(suggestion); // ← Update input state
                                  updateTempFilters("locations", [suggestion]); // ← Update filter
                                  setCitySuggestions([]);
                                }}
                                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                              >
                                {suggestion}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    <label className="text-xs text-gray-500 mt-1 block">
                      City
                    </label>
                  </div>

                  {/* Display selected location tag */}
                </div>
                {tempFilters.locations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center bg-white rounded-full px-3 py-1.5 text-xs text-gray-700 border border-gray-200">
                      <X
                        className="w-3 h-3 text-gray-400 mr-1 cursor-pointer hover:text-gray-600"
                        onClick={() => updateTempFilters("locations", [])}
                      />
                      <span>{tempFilters.locations[0]}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Companies/Industries */}
          <div
            className={`bg-[#F5F9FB]  p-4 ${
              expandedSections.companies
                ? "my-4 rounded-lg"
                : "border-b border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between cursor-pointer ${
                expandedSections.companies ? "mb-2" : ""
              } `}
              onClick={() => toggleSection("companies")}
            >
              <h3 className="text-sm lg:text-base font-[400] text-gray-700 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                Companies/Industries
              </h3>
              {expandedSections.companies ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            {expandedSections.companies && (
              <div className="space-y-0">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Companies
                  </label>
                  <input
                    type="text"
                    placeholder="Search Companies"
                    value={tempFilters.companies}
                    onChange={(e) =>
                      updateTempFilters("companies", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <span className="flex justify-center text-gray-400">or</span>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Industries
                  </label>
                  <input
                    type="text"
                    placeholder="Search Industries"
                    value={tempFilters.industries}
                    onChange={(e) =>
                      updateTempFilters("industries", e.target.value)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Salary Range */}
          <div
            className={`bg-[#F5F9FB] p-4  ${
              expandedSections.salary
                ? "my-4 rounded-lg"
                : "border-b border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between cursor-pointer ${
                expandedSections.salary ? "mb-2" : ""
              } `}
              onClick={() => toggleSection("salary")}
            >
              <h3 className="text-sm lg:text-base font-[400] text-gray-700 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                Salary range
              </h3>
              {expandedSections.salary ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            {expandedSections.salary && (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <select
                    value={tempFilters.minSalary}
                    onChange={(e) =>
                      updateTempFilters("minSalary", e.target.value)
                    }
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  >
                    <option value="">Select Min Salary</option>
                    <option value="500000">5 LPA</option>
                    <option value="1000000">10 LPA</option>
                    <option value="1500000">15 LPA</option>
                    <option value="2000000">20 LPA</option>
                    <option value="2500000">25 LPA</option>
                    <option value="3000000">30 LPA</option>
                    <option value="3500000">35 LPA</option>
                    <option value="4000000">40 LPA</option>
                    <option value="4500000">45 LPA</option>
                    <option value="5000000">50 LPA</option>
                    <option value="5500000">55 LPA</option>
                    <option value="6000000">60 LPA</option>
                    <option value="6500000">65 LPA</option>
                    <option value="7000000">70 LPA</option>
                    <option value="7500000">75 LPA</option>
                    <option value="8000000">80 LPA</option>
                    <option value="8500000">85 LPA</option>
                    <option value="9000000">90 LPA</option>
                    <option value="9500000">95 LPA</option>
                    <option value="10000000">100 LPA</option>
                  </select>
                  <select
                    value={tempFilters.maxSalary}
                    onChange={(e) =>
                      updateTempFilters("maxSalary", e.target.value)
                    }
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-500"
                  >
                    <option value="">Select Max Salary</option>
                    <option value="1000000">10 LPA</option>
                    <option value="2000000">20 LPA</option>
                    <option value="3000000">30 LPA</option>
                    <option value="4000000">40 LPA</option>
                    <option value="5000000">50 LPA</option>
                    <option value="6000000">60 LPA</option>
                    <option value="7000000">70 LPA</option>
                    <option value="8000000">80 LPA</option>
                    <option value="9000000">90 LPA</option>
                    <option value="10000000">100 LPA</option>
                    <option value="11000000">110 LPA</option>
                    <option value="12000000">120 LPA</option>
                    <option value="13000000">130 LPA</option>
                    <option value="14000000">140 LPA</option>
                    <option value="15000000">150 LPA</option>
                    <option value="16000000">160 LPA</option>
                    <option value="17000000">170 LPA</option>
                    <option value="18000000">180 LPA</option>
                    <option value="19000000">190 LPA</option>
                    <option value="20000000">200 LPA</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Notice Period */}
          <div
            className={`bg-[#F5F9FB] p-4 ${
              expandedSections.notice
                ? "my-4 rounded-lg"
                : "border-b border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between cursor-pointer ${
                expandedSections.notice ? "mb-2" : ""
              } `}
              onClick={() => toggleSection("notice")}
            >
              <h3 className="text-sm lg:text-base font-[400] text-gray-700 flex items-center">
                <Clock10 className="w-4 h-4 mr-2 text-gray-500" />
                Notice period
              </h3>
              {expandedSections.notice ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            {expandedSections.notice && (
              <div>
                <select
                  value={tempFilters.noticePeriod}
                  onChange={(e) =>
                    updateTempFilters("noticePeriod", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-500"
                >
                  <option value="">Select Notice Period</option>
                  {noticePeriodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Colleges */}
          <div
            className={`bg-[#F5F9FB] p-4 ${
              expandedSections.colleges
                ? "my-4  rounded-lg"
                : "border-b border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between cursor-pointer ${
                expandedSections.colleges ? "mb-2" : ""
              } `}
              onClick={() => toggleSection("colleges")}
            >
              <h3 className="text-sm lg:text-base font-[400] text-gray-700 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-gray-500" />
                College Education
              </h3>
              {expandedSections.colleges ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            {expandedSections.colleges && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search Colleges"
                  value={tempFilters.colleges}
                  onChange={(e) =>
                    updateTempFilters("colleges", e.target.value)
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tempFilters.topTierUniversities}
                    onChange={(e) =>
                      updateTempFilters("topTierUniversities", e.target.checked)
                    }
                    className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">
                    Top tier Universities only
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tempFilters.computerScienceGraduates}
                    onChange={(e) =>
                      updateTempFilters(
                        "computerScienceGraduates",
                        e.target.checked,
                      )
                    }
                    className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">
                    Show computer science graduates only
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Spotlight */}
          <div
            className={`bg-[#F5F9FB] p-4 ${
              expandedSections.spotlight
                ? "my-4 rounded-lg"
                : "border-b border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between cursor-pointer ${
                expandedSections.spotlight ? "mb-2" : ""
              } `}
              onClick={() => toggleSection("spotlight")}
            >
              <h3 className="text-sm lg:text-base font-[400] text-gray-700 flex items-center">
                <Star className="w-4 h-4 mr-2 text-gray-500" />
                Spotlight
              </h3>
              {expandedSections.spotlight ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            {expandedSections.spotlight && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tempFilters.showFemaleCandidates}
                    onChange={(e) =>
                      updateTempFilters(
                        "showFemaleCandidates",
                        e.target.checked,
                      )
                    }
                    className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">
                    Show Female Candidates Only
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tempFilters.recentlyPromoted}
                    onChange={(e) =>
                      updateTempFilters("recentlyPromoted", e.target.checked)
                    }
                    className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">
                    Show Candidate that got promoted recently
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tempFilters.backgroundVerified}
                    onChange={(e) =>
                      updateTempFilters("backgroundVerified", e.target.checked)
                    }
                    className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">
                    Is Background Verified
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* More Filters */}
          <div
            className={`bg-[#F5F9FB] rounded-b-lg p-4 mb-4 ${
              expandedSections.moreFilters ? "my-4 rounded-lg" : ""
            }`}
          >
            <div
              className={`flex items-center justify-between cursor-pointer ${
                expandedSections.moreFilters ? "mb-2" : ""
              } `}
              onClick={() => toggleSection("moreFilters")}
            >
              <h3 className="text-sm lg:text-base font-[400] text-gray-700 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                More Filters
              </h3>
              {expandedSections.moreFilters ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            {expandedSections.moreFilters && (
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tempFilters.hasCertification}
                    onChange={(e) =>
                      updateTempFilters("hasCertification", e.target.checked)
                    }
                    className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">
                    Has Certification
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tempFilters.hasResearchPaper}
                    onChange={(e) =>
                      updateTempFilters("hasResearchPaper", e.target.checked)
                    }
                    className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">
                    Must have Research Paper
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tempFilters.hasTwitter}
                    onChange={(e) =>
                      updateTempFilters("hasTwitter", e.target.checked)
                    }
                    className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">
                    Must have Twitter
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tempFilters.hasPortfolio}
                    onChange={(e) =>
                      updateTempFilters("hasPortfolio", e.target.checked)
                    }
                    className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs text-gray-700">
                    Must have Portfolio website
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 flex gap-2 border-t border-gray-200 pt-4 bg-white z-10">
        {/* Apply Filters */}
        <div className="w-full rounded-lg">
          <button
            onClick={applyFilters}
            disabled={isSearchMode}
            className={`w-full p-2 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center ${
              isSearchMode
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </button>
        </div>

        {/* Clear Filters */}
        <div className="w-full rounded-lg">
          <div className="">
            <button
              onClick={resetFilters}
              disabled={isSearchMode}
              className={`w-full p-2 text-sm rounded-lg transition-colors flex items-center justify-center ${
                isSearchMode
                  ? "border border-gray-400 text-gray-400 cursor-not-allowed"
                  : "border border-blue-600 text-blue-600 hover:bg-blue-700 hover:text-white"
              }`}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;
