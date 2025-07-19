import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Briefcase,
  Building2,
  Clock10,
  MapPin,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Filter,
  DollarSign,
  Star,
  History,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
} from "lucide-react";
import { debounce } from "lodash";
import { candidateService, CandidateListItem } from "../services/candidateService";

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
    selectedSkills: string[];
    skillLevel: string;
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
  };
  onFiltersChange: (filters: any) => void;
  setCandidates: (candidates: CandidateListItem[]) => void;
  candidates: CandidateListItem[];
  activeTab: string;
}

const JobTitlesSlider: React.FC = () => {
  const jobTitles = ["Software Engineer", "Product Manager", "Data Scientist", "Designer"];
  const repeatedJobTitles = [...jobTitles, ...jobTitles, ...jobTitles, ...jobTitles];
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sliderRef.current) {
      const totalWidth = sliderRef.current.scrollWidth;
      const visibleWidth = sliderRef.current.clientWidth;
      const initialScroll = totalWidth / 2 - visibleWidth / 2;
      sliderRef.current.scrollTo({ left: initialScroll, behavior: "instant" });
    }
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -sliderRef.current.clientWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: sliderRef.current.clientWidth, behavior: "smooth" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
          <History className="w-4 h-4 mr-2 text-gray-800" />
          Recent Searched Job Titles
        </h3>
      </div>
      <div className="flex items-center">
        <button onClick={scrollLeft} className="p-1">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div
          ref={sliderRef}
          className="slider-container overflow-x-scroll w-96"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="slider flex gap-1">
            {repeatedJobTitles.map((title, index) => (
              <button
                key={index}
                className="w-28 px-2 py-1 bg-white text-xs text-gray-600 rounded border hover:bg-gray-50 whitespace-nowrap text-center"
              >
                {title}
              </button>
            ))}
          </div>
        </div>
        <button onClick={scrollRight} className="p-1">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

interface FilterMenuProps {
  filters: FiltersSidebarProps["filters"];
  updateFilters: (key: string, value: any) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ filters, updateFilters }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        <CircleEllipsis className="h-5 w-5 text-gray-600" />
      </button>
      {isMenuOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-in-out z-10"
        >
          <div className="py-1">
            <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700">
              <span>Semantic Search</span>
              <button
                onClick={() => updateFilters("semanticSearch", !filters.semanticSearch)}
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
                onClick={() => updateFilters("booleanSearch", !filters.booleanSearch)}
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
  | "skills"
  | "notice"
  | "colleges"
  | "spotlight"
  | "moreFilters";

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  filters,
  onFiltersChange,
  setCandidates,
  candidates,
  activeTab,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    keywords: true,
    experience: false,
    totalExp: true,
    location: true,
    companies: false,
    salary: false,
    skills: false,
    notice: false,
    colleges: false,
    spotlight: false,
    moreFilters: false,
  });

  const [jobTitles, setJobTitles] = useState<string[]>([]);

  // Debounced fetch candidates
  const debouncedFetchCandidates = useCallback(
    debounce(async (filterParams: any) => {
      try {
        const response = await candidateService.searchCandidates({
          ...filterParams,
          page: 1, // Reset to page 1 on filter change
          page_size: 20,
        });
        setCandidates(response.results);
        if (response.results.length > 0) {
          // Update selected candidate in parent component if needed
          onFiltersChange({ ...filters, selectedCandidate: response.results[0] });
          console.error("Error fetching filtered candidates:", filters);
        }
      } catch (error) {
        console.error("Error fetching filtered candidates:", error);
        setCandidates([]);
      }
    }, 500),
    [setCandidates, onFiltersChange, filters]
  );

  // Update filters when activeTab changes
  useEffect(() => {
    onFiltersChange({
      ...filters,
      application_type: activeTab,
      is_prevetted: activeTab === "prevetted",
      is_active: activeTab === "active",
    });
  }, [activeTab, onFiltersChange]);

  // Fetch candidates when filters change
  useEffect(() => {
    if (filters.jobId) {
      const filterParams: any = {
        job_id: filters.jobId,
        application_type: filters.application_type,
      };
      if (filters.keywords) filterParams.q = filters.keywords;
      if (filters.minTotalExp) filterParams.experience_min = filters.minTotalExp;
      if (filters.maxTotalExp) filterParams.experience_max = filters.maxTotalExp;
      if (filters.minExperience) filterParams.exp_in_current_company_min = filters.minExperience;
      if (filters.topTierUniversities) filterParams.is_top_tier_college = filters.topTierUniversities;
      if (filters.hasCertification) filterParams.has_certification = filters.hasCertification;
      if (filters.city || filters.country)
        filterParams.location = `${filters.city}${filters.city && filters.country ? ", " : ""}${filters.country}`;
      if (filters.location) filterParams.location = filters.location;
      if (filters.selectedSkills.length > 0) filterParams.skills = filters.selectedSkills.join(",");
      if (filters.companies) filterParams.companies = filters.companies.split(",").map((c: string) => c.trim());
      if (filters.industries) filterParams.industries = filters.industries.split(",").map((i: string) => i.trim());
      if (filters.minSalary) filterParams.salary_min = filters.minSalary;
      if (filters.maxSalary) filterParams.salary_max = filters.maxSalary;
      if (filters.colleges) filterParams.colleges = filters.colleges.split(",").map((c: string) => c.trim());
      if (filters.showFemaleCandidates) filterParams.is_female_only = true;
      if (filters.recentlyPromoted) filterParams.is_recently_promoted = true;
      if (filters.backgroundVerified) filterParams.is_background_verified = true;
      if (filters.hasLinkedIn) filterParams.has_linkedin = true;
      if (filters.hasTwitter) filterParams.has_twitter = true;
      if (filters.hasPortfolio) filterParams.has_portfolio = true;
      if (filters.computerScienceGraduates) filterParams.is_cs_graduate = true;
      if (filters.hasResearchPaper) filterParams.has_research_paper = true;
      if (filters.hasBehance) filterParams.has_behance = true;
      if (filters.is_prevetted) filterParams.is_prevetted = true;
      if (filters.is_active) filterParams.is_active = true;
      if (filters.noticePeriod) {
        const days = {
          "15 days": 15,
          "30 days": 30,
          "45 days": 45,
          "60 days": 60,
          "90 days": 90,
          Immediate: 0,
        }[filters.noticePeriod];
        if (days !== undefined) filterParams.notice_period_max_days = days;
      }

      debouncedFetchCandidates(filterParams);
    }
  }, [filters, debouncedFetchCandidates]);

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFilters = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const jobCategories = [
    { name: "Engineering Manager", count: 120 },
    { name: "Software Engineer", count: 85 },
    { name: "Product Manager", count: 45 },
    { name: "Data Scientist", count: 30 },
  ];

  const noticePeriodOptions = ["Immediate", "15 days", "30 days", "45 days", "60 days", "90 days"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-gray-800" />
          Filters
        </h2>
        <FilterMenu filters={filters} updateFilters={updateFilters} />
      </div>

      {/* Keywords */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("keywords")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          Keywords
          {expandedSections.keywords ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.keywords && (
          <div className="mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by keywords"
                value={filters.keywords}
                onChange={(e) => updateFilters("keywords", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Total Experience */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("totalExp")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          Total Experience
          {expandedSections.totalExp ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.totalExp && (
          <div className="mt-2 flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minTotalExp}
              onChange={(e) => updateFilters("minTotalExp", e.target.value)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxTotalExp}
              onChange={(e) => updateFilters("maxTotalExp", e.target.value)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        )}
      </div>

      {/* Location */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("location")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          Location
          {expandedSections.location ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.location && (
          <div className="mt-2">
            <div className="relative mb-2">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => updateFilters("city", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Country"
                value={filters.country}
                onChange={(e) => updateFilters("country", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("skills")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          Skills
          {expandedSections.skills ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.skills && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Add skills (comma-separated)"
              value={filters.selectedSkills.join(", ")}
              onChange={(e) => updateFilters("selectedSkills", e.target.value.split(",").map((s) => s.trim()))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        )}
      </div>

      {/* Notice Period */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("notice")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          Notice Period
          {expandedSections.notice ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.notice && (
          <div className="mt-2">
            <select
              value={filters.noticePeriod}
              onChange={(e) => updateFilters("noticePeriod", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
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

      {/* Companies */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("companies")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          Companies
          {expandedSections.companies ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.companies && (
          <div className="mt-2">
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Add companies (comma-separated)"
                value={filters.companies}
                onChange={(e) => updateFilters("companies", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Salary */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("salary")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          Salary
          {expandedSections.salary ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.salary && (
          <div className="mt-2 flex space-x-2">
            <div className="relative w-1/2">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Min"
                value={filters.minSalary}
                onChange={(e) => updateFilters("minSalary", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="relative w-1/2">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxSalary}
                onChange={(e) => updateFilters("maxSalary", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Colleges */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("colleges")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          Colleges
          {expandedSections.colleges ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.colleges && (
          <div className="mt-2">
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Add colleges (comma-separated)"
                value={filters.colleges}
                onChange={(e) => updateFilters("colleges", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={filters.topTierUniversities}
                onChange={(e) => updateFilters("topTierUniversities", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Top Tier Universities</span>
            </label>
            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={filters.computerScienceGraduates}
                onChange={(e) => updateFilters("computerScienceGraduates", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Computer Science Graduates</span>
            </label>
          </div>
        )}
      </div>

      {/* Spotlight */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("spotlight")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          Spotlight
          {expandedSections.spotlight ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.spotlight && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showFemaleCandidates}
                onChange={(e) => updateFilters("showFemaleCandidates", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Female Candidates Only</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.recentlyPromoted}
                onChange={(e) => updateFilters("recentlyPromoted", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Recently Promoted</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.backgroundVerified}
                onChange={(e) => updateFilters("backgroundVerified", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Background Verified</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasCertification}
                onChange={(e) => updateFilters("hasCertification", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Has Certifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasResearchPaper}
                onChange={(e) => updateFilters("hasResearchPaper", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Has Research Papers</span>
            </label>
          </div>
        )}
      </div>

      {/* More Filters */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("moreFilters")}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
        >
          More Filters
          {expandedSections.moreFilters ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedSections.moreFilters && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasLinkedIn}
                onChange={(e) => updateFilters("hasLinkedIn", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Has LinkedIn Profile</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasBehance}
                onChange={(e) => updateFilters("hasBehance", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Has Behance Profile</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasTwitter}
                onChange={(e) => updateFilters("hasTwitter", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Has Twitter Profile</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasPortfolio}
                onChange={(e) => updateFilters("hasPortfolio", e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Has Portfolio</span>
            </label>
          </div>
        )}
      </div>

      {/* Job Titles Slider */}
      <JobTitlesSlider />
    </div>
  );
};

export default FiltersSidebar;