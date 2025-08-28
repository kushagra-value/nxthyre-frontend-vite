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
    semanticSearch: boolean;
    selectedCategories: string[];
    minExperience: string;
    maxExperience: string;
    funInCurrentCompany: boolean;
    minTotalExp: string;
    maxTotalExp: string;
    city: string;
    country: string;
    location: string;
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
  onApplyFilters: (filters: any) => void;
  setCandidates: (candidates: CandidateListItem[]) => void;
  candidates: CandidateListItem[];
  activeTab: string;
  isSearchMode: boolean;
}

interface FilterMenuProps {
  filters: FiltersSidebarProps["filters"];
  updateTempFilters: (key: string, value: any) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  filters,
  updateTempFilters,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-end px-2 pb-1">
      <button onClick={toggleMenu}>
        <CircleEllipsis className="h-5 w-5 text-gray-500" />
      </button>
      {isMenuOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-in-out z-10"
          style={{
            opacity: isMenuOpen ? 1 : 0,
            transform: `translateY(${isMenuOpen ? 0 : -10}px)`,
          }}
        >
          <div className="py-1">
            <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700">
              <span>Semantic Search</span>
              <button
                onClick={() =>
                  updateTempFilters("semanticSearch", !filters.semanticSearch)
                }
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  filters.semanticSearch ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                    filters.semanticSearch ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700">
              <span>Boolean Search</span>
              <button
                onClick={() =>
                  updateTempFilters("booleanSearch", !filters.booleanSearch)
                }
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  filters.booleanSearch ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                    filters.booleanSearch ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<
    { id: number; query: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [tempFilters, setTempFilters] = useState(filters);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);


  // Fetch keyword suggestions
  const fetchKeywordSuggestions = useCallback(
    debounce(async (query: string) => {
      const lastKeyword = query.split(",").pop()?.trim() || "";
      if (lastKeyword.length >= 2) {
        try {
          const suggestions = await candidateService.getKeywordSuggestions(
            lastKeyword
          );
          const currentKeywords = tempFilters.keywords
            .split(",")
            .map((k) => k.trim().toLowerCase())
            .filter((k) => k);
          // Filter out suggestions that already exist in currentKeywords
          const filteredSuggestions = suggestions.filter(
            (suggestion) => !currentKeywords.includes(suggestion.toLowerCase())
          );
          setKeywordSuggestions(filteredSuggestions);
          setShowSuggestions(filteredSuggestions.length > 0);
        } catch (error) {
          console.error("Error fetching keyword suggestions:", error);
          setKeywordSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setKeywordSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    [tempFilters.keywords]
  );

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateTempFilters = (key: string, value: any) => {
    let newFilters = { ...tempFilters, [key]: value };

    // Handle location and city/country
    if (key === "city" || key === "country" || key === "location") {
      setIsLocationManuallyEdited(key === "location");
      const newCity = key === "city" ? value : tempFilters.city;
      const newCountry = key === "country" ? value : tempFilters.country;
      const newLocation = key === "location" ? value : tempFilters.location;

      // Construct locations array
      const locations = [];
      if (newCity) {
        locations.push(newCity); // City from dropdown as first element
      }
      if (newLocation) {
        const manualLocations = newLocation
          .split(",")
          .map((loc: string) => loc.trim())
          .filter((loc: string) => loc && loc !== newCity); // Avoid duplicating city
        locations.push(...manualLocations);
      }

      newFilters = {
        ...newFilters,
        city: newCity,
        country: newCountry,
        location: newLocation,
        locations, // Add locations array to filters for use in API call
      };
    }

    // Validate experience inputs
    if (["minTotalExp", "maxTotalExp", "minExperience"].includes(key)) {
      const isValidNumber = (val: string) => /^\d*$/.test(val);
      if (!isValidNumber(value)) {
        return; // Ignore invalid input
      }
    }

    if (
      key === "minTotalExp" &&
      newFilters.maxTotalExp &&
      Number(value) > Number(newFilters.maxTotalExp)
    ) {
      showToast.error("Min experience cannot be greater than max experience");
      return;
    }
    if (
      key === "maxTotalExp" &&
      newFilters.minTotalExp &&
      Number(value) < Number(newFilters.minTotalExp)
    ) {
      showToast.error("Max experience cannot be less than min experience");
      return;
    }
    if (
      key === "minSalary" &&
      newFilters.maxSalary &&
      Number(value) > Number(newFilters.maxSalary)
    ) {
      showToast.error("Min salary cannot be greater than max salary");
      return;
    }
    if (
      key === "maxSalary" &&
      newFilters.minSalary &&
      Number(value) < Number(newFilters.minSalary)
    ) {
      showToast.error("Max salary cannot be less than min salary");
      return;
    }

    setTempFilters(newFilters);
    if (key === "keywords") {
      fetchKeywordSuggestions(value);
    }
  };

  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9\s,]/g, ""); // Allow only alphanumeric, commas and spaces
    updateTempFilters("keywords", value);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    const currentKeywords = tempFilters.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k);

    // Prevent adding duplicate suggestion
    if (currentKeywords.includes(suggestion.toLowerCase())) {
      showToast.error("This keyword is already added.");
      return;
    }

    const keywordsArray = tempFilters.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);
    keywordsArray.pop();
    keywordsArray.push(suggestion);
    const newKeywords = keywordsArray.join(", ");
    updateTempFilters("keywords", newKeywords);
    setShowSuggestions(false);
  };

  const handleSelectRecentSearch = (query: string) => {
    updateTempFilters("keywords", query);
    setShowSuggestions(false);
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFilters();
    }
  };

  const removeLocationTag = (locationToRemove: string) => {
    const updatedLocations = tempFilters.locations.filter(
      (loc) => loc !== locationToRemove
    );
    const updatedLocationString = updatedLocations.join(", ");

    updateTempFilters("locations", updatedLocations);
    updateTempFilters("location", updatedLocationString);
  };

  const resetFilters = () => {
    setIsLocationManuallyEdited(false);
    setKeywordSuggestions([]);
    setShowSuggestions(false);
    setTempFilters({
      keywords: "",
      booleanSearch: false,
      semanticSearch: false,
      selectedCategories: [],
      minExperience: "",
      maxExperience: "",
      funInCurrentCompany: false,
      minTotalExp: "",
      maxTotalExp: "",
      city: "",
      country: "",
      location: "",
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
    });
    setCandidates([]);
    setShowSuggestions(false);
  };

  const applyFilters = async () => {
    try {
      // Apply the filters by calling the parent component's callback
      await onApplyFilters(tempFilters);

      // Refetch recent searches to update the JobTitlesSlider
      const searches = await candidateService.getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      console.error(
        "Error applying filters or fetching recent searches:",
        error
      );
      showToast.error("Failed to apply filters or update recent searches");
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
    <div className="bg-white rounded-xl p-3 lg:p-4 h-fit">
      {/* Keywords */}
      <div className="border-b border-gray-200 mb-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm lg:text-base font-[400] text-gray-700 flex items-center">
            <Search className="w-4 h-4 mr-2 text-gray-500" />
            Keywords
          </h3>
          <div className="flex gap-2 cursor-pointer">
            <FilterMenu
              filters={tempFilters}
              updateTempFilters={updateTempFilters}
            />
            <div
              className="cursor-pointer"
              onClick={() => toggleSection("keywords")}
            >
              {expandedSections.keywords ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>
        </div>
        {expandedSections.keywords && (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Seperated by comma, For Ex: Gen AI Specialist, Gen AI engineer"
                value={tempFilters.keywords}
                onChange={handleKeywordInputChange}
                onKeyDown={handleKeywordKeyDown}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {showSuggestions && keywordSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
                >
                  {keywordSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                        ""
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
                        ""
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
                      ""
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
            <div className="space-y-2">
              <div className="flex space-x-2">
                <select
                  value={tempFilters.city}
                  onChange={(e) => updateTempFilters("city", e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                >
                  <option value="">City</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
                <select
                  value={tempFilters.country}
                  onChange={(e) => updateTempFilters("country", e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-400"
                >
                  <option value="">Country</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Enter Location like Ahmedabad"
                value={tempFilters.location}
                onChange={(e) => updateTempFilters("location", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {tempFilters.locations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tempFilters.locations.map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white rounded-full px-3 py-1.5 text-xs text-gray-700 border border-gray-200"
                    >
                      <X
                        className="w-3 h-3 text-gray-400 mr-1 cursor-pointer hover:text-gray-600"
                        onClick={() => removeLocationTag(location)}
                      />
                      <span>{location}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                  <option value="5000000">50 LPA</option>
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
              Colleges
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
                onChange={(e) => updateTempFilters("colleges", e.target.value)}
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
                      e.target.checked
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
                    updateTempFilters("showFemaleCandidates", e.target.checked)
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

      <div className="flex gap-2 border-t border-gray-200 pt-4">
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
