import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Briefcase, Building2, Clock10, MapPin, GraduationCap, ChevronDown, ChevronUp, Filter, DollarSign, Award, Users, Star, History, ChevronLeft, ChevronRight, CircleEllipsis } from 'lucide-react';
import { debounce } from 'lodash';
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
  };
  onFiltersChange: (filters: any) => void;
  setCandidates: (candidates: CandidateListItem[]) => void;
}

const JobTitlesSlider: React.FC = () => {
  const jobTitles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'Designer'];
  const repeatedJobTitles = [...jobTitles, ...jobTitles, ...jobTitles, ...jobTitles];
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sliderRef.current) {
      const totalWidth = sliderRef.current.scrollWidth;
      const visibleWidth = sliderRef.current.clientWidth;
      const initialScroll = (totalWidth / 2) - (visibleWidth / 2);
      sliderRef.current.scrollTo({ left: initialScroll, behavior: 'instant' });
    }
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -sliderRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: sliderRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
          <History className="w-4 h-4 mr-2 text-gray-800" />
          Recent searched Job Titles
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
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
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
  filters: FiltersSidebarProps['filters'];
  updateFilters: (key: string, value: any) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ filters, updateFilters }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleClickOutside = (event:any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
          style={{ opacity: isMenuOpen ? 1 : 0, transform: `translateY(${isMenuOpen ? 0 : -10}px)` }}
        >
          <div className="py-1">
            <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700">
              <span>Semantic Search</span>
              <button
                onClick={() => updateFilters('semanticSearch', !filters.semanticSearch)}
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  filters.semanticSearch ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                    filters.semanticSearch ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-700">
              <span>Boolean</span>
              <button
                onClick={() => updateFilters('booleanSearch', !filters.booleanSearch)}
                className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                  filters.booleanSearch ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                  filters.booleanSearch ? 'translate-x-4' : 'translate-x-1'
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
  | 'keywords'
  | 'experience'
  | 'totalExp'
  | 'location'
  | 'companies'
  | 'salary'
  | 'skills'
  | 'notice'
  | 'colleges'
  | 'spotlight'
  | 'moreFilters';

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({ filters, onFiltersChange, setCandidates }) => {
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
    moreFilters: false
  });

  const [jobTitles, setJobTitles] = useState<string[]>([]);
  

  // Debounced filter function
  const debouncedFetchCandidates = useCallback(
    debounce(async (filterParams: any) => {
      try {
        const { results } = await candidateService.searchCandidates(filterParams);
        setCandidates(results);
      } catch (error) {
        console.error("Error fetching filtered candidates:", error);
      }
    }, 300),
    [setCandidates]
  );

  // Apply filters when they change
  useEffect(() => {
    const filterParams: any = {
      page: 1,
      page_size: 10
    };
    if (filters.keywords) filterParams.q = filters.keywords;
    if (filters.minTotalExp) filterParams.experience_min = filters.minTotalExp;
    if (filters.maxTotalExp) filterParams.experience_max = filters.maxTotalExp;
    if (filters.minExperience) filterParams.exp_in_current_company_min = filters.minExperience;
    if (filters.topTierUniversities) filterParams.is_top_tier_college = filters.topTierUniversities;
    if (filters.hasCertification) filterParams.has_certification = filters.hasCertification;
    if (filters.city || filters.country) filterParams.location = `${filters.city}${filters.city && filters.country ? ", " : ""}${filters.country}`;
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
  }, [filters, debouncedFetchCandidates]);

  const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const jobCategories = [
    { name: 'Engineering Manager', count: 234 },
    { name: 'Machine Learning', count: 187 },
    { name: 'Product Manager', count: 156 },
    { name: 'Designer', count: 89 },
    { name: 'Sales', count: 145 },
    { name: 'Operations', count: 78 },
    { name: 'iOS', count: 92 },
    { name: 'Android', count: 67 }
  ];

  const availableSkills = [
    'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'Swift', 'Kotlin',
    'Data Analysis', 'SQL', 'MongoDB', 'Machine Learning', 'iOS', 'Android',
    'UI/UX Design', 'Product Strategy', 'Sales', 'Operations', 'Leadership'
  ];

  const updateFilters = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.selectedCategories.includes(category)
      ? filters.selectedCategories.filter(c => c !== category)
      : [...filters.selectedCategories, category];
    updateFilters('selectedCategories', newCategories);
  };

  const toggleSkill = (skill: string) => {
    const newSkills = filters.selectedSkills.includes(skill)
      ? filters.selectedSkills.filter(s => s !== skill)
      : [...filters.selectedSkills, skill];
    updateFilters('selectedSkills', newSkills);
  };

  const clearAllFilters = () => {
    onFiltersChange({
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
      selectedSkills: [],
      skillLevel: "",
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
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4 space-y-4 h-fit">
      {/* Keywords Section */}
      <div>
        <div 
          className="flex items-center justify-between mb-3"
        >
          <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
            <Search className="w-4 h-4 mr-2 text-gray-800" />
            Keywords
          </h3>
          <div className="flex gap-2 cursor-pointer">
            <FilterMenu filters={filters} updateFilters={updateFilters} />
            <div className="cursor-pointer" onClick={() => toggleSection('keywords')}>
              {expandedSections.keywords ? 
                <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                <ChevronDown className="w-4 h-4 text-gray-500" />
              }
            </div>
          </div>
        </div>

        {expandedSections.keywords && (
          <div className="space-y-2">            
            <div className="relative">
              <input
                type="text"
                placeholder="For Ex: Gen AI Specialist, and Gen AI engineer"
                value={filters.keywords}
                onChange={(e) => updateFilters('keywords', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <JobTitlesSlider />
          </div>
        )}
      </div>

      {/* Total Experience */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleSection('totalExp')}
        >
          <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-gray-800" />
            Total Experience
          </h3>
          {expandedSections.totalExp ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
            <ChevronDown className="w-4 h-4 text-gray-500" />
          }
        </div>

        {expandedSections.totalExp && (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input 
                type="number" 
                placeholder="Min Exp (in years)" 
                value={filters.minTotalExp}
                onChange={(e) => updateFilters('minTotalExp', e.target.value)}
                className="w-1/3 flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
              <input 
                type="number" 
                placeholder="Max Exp (in years)" 
                value={filters.maxTotalExp}
                onChange={(e) => updateFilters('maxTotalExp', e.target.value)}
                className="w-1/3 flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
        )}

        <div className="mt-2">
          <input 
            type="number" 
            placeholder="Years of Exp in Current Company" 
            value={filters.minExperience}
            onChange={(e) => updateFilters('minExperience', e.target.value)}
            className="w-full flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleSection('location')}
        >
          <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-800" />
            Location
          </h3>
          {expandedSections.location ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
            <ChevronDown className="w-4 h-4 text-gray-500" />
          }
        </div>

        {expandedSections.location && (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <select 
                value={filters.city}
                onChange={(e) => updateFilters('city', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">City</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
              <select 
                value={filters.country}
                onChange={(e) => updateFilters('country', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              value={filters.location}
              onChange={(e) => updateFilters('location', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        )}
      </div>

      {/* Companies/Industries */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleSection('companies')}
        >
          <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
            <Building2 className="w-4 h-4 mr-2 text-gray-800" />
            Companies/Industries
          </h3>
          {expandedSections.companies ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
            <ChevronDown className="w-4 h-4 text-gray-500" />
          }
        </div>

        {expandedSections.companies && (
          <div className="space-y-0">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Companies</label>
              <input 
                type="text" 
                placeholder="Search Companies" 
                value={filters.companies}
                onChange={(e) => updateFilters('companies', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <span className="flex justify-center text-gray-400">or</span>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Industries</label>
              <input 
                type="text" 
                placeholder="Search Industries" 
                value={filters.industries}
                onChange={(e) => updateFilters('industries', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
        )}
      </div>

      {/* Salary Range */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleSection('salary')}
        >
          <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-gray-800" />
            Salary range
          </h3>
          {expandedSections.salary ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
            <ChevronDown className="w-4 h-4 text-gray-500" />
          }
        </div>

        {expandedSections.salary && (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <select 
                value={filters.minSalary}
                onChange={(e) => updateFilters('minSalary', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">5lpa</option>
                <option value="5">5 LPA</option>
                <option value="10">10 LPA</option>
                <option value="15">15 LPA</option>
                <option value="20">20 LPA</option>
              </select>
              <select 
                value={filters.maxSalary}
                onChange={(e) => updateFilters('maxSalary', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">10lpa</option>
                <option value="10">10 LPA</option>
                <option value="20">20 LPA</option>
                <option value="30">30 LPA</option>
                <option value="50">50 LPA</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Notice Period */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleSection('notice')}
        >
          <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
            <Clock10 className="w-4 h-4 mr-2 text-gray-800" />
            Notice period
          </h3>
          {expandedSections.notice ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
            <ChevronDown className="w-4 h-4 text-gray-500" />
          }
        </div>

        {expandedSections.notice && (
          <div>
            <select 
              value={filters.noticePeriod}
              onChange={(e) => updateFilters('noticePeriod', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">1 month</option>
              <option value="15 days">15 days</option>
              <option value="30 days">30 days</option>
              <option value="45 days">45 days</option>
              <option value="60 days">60 days</option>
              <option value="90 days">90 days</option>
              <option value="Immediate">Immediate</option>
            </select>
          </div>
        )}
      </div>

      {/* Colleges */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleSection('colleges')}
        >
          <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
            <GraduationCap className="w-4 h-4 mr-2 text-gray-800" />
            Colleges
          </h3>
          {expandedSections.colleges ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
            <ChevronDown className="w-4 h-4 text-gray-500" />
          }
        </div>

        {expandedSections.colleges && (
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="Search Colleges" 
              value={filters.colleges}
              onChange={(e) => updateFilters('colleges', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.topTierUniversities}
                onChange={(e) => updateFilters('topTierUniversities', e.target.checked)}
                className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Top tier Universities only</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.computerScienceGraduates}
                onChange={(e) => updateFilters('computerScienceGraduates', e.target.checked)}
                className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Show computer science graduates only</span>
            </label>
          </div>
        )}
      </div>

      {/* Spotlight */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleSection('spotlight')}
        >
          <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
            <Star className="w-4 h-4 mr-2 text-gray-800" />
            Spotlight
          </h3>
          {expandedSections.spotlight ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
            <ChevronDown className="w-4 h-4 text-gray-500" />
          }
        </div>

        {expandedSections.spotlight && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.showFemaleCandidates}
                onChange={(e) => updateFilters('showFemaleCandidates', e.target.checked)}
                className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Show Female Candidates Only</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.recentlyPromoted}
                onChange={(e) => updateFilters('recentlyPromoted', e.target.checked)}
                className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Show Candidate that got promoted recently</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.backgroundVerified}
                onChange={(e) => updateFilters('backgroundVerified', e.target.checked)}
                className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Is Background Verified</span>
            </label>
          </div>
        )}
      </div>

      {/* More Filters */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => toggleSection('moreFilters')}
        >
          <h3 className="text-sm lg:text-base font-semibold text-gray-800 flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-800" />
            More Filters
          </h3>
          {expandedSections.moreFilters ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
            <ChevronDown className="w-4 h-4 text-gray-500" />
          }
        </div>

        {expandedSections.moreFilters && (
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.hasCertification}
                onChange={(e) => updateFilters('hasCertification', e.target.checked)}
                className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Has Certification</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.hasResearchPaper}
                onChange={(e) => updateFilters('hasResearchPaper', e.target.checked)}
                className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Must have Research Paper</span>
            </label>
            
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.hasBehance}
                onChange={(e) => updateFilters('hasBehance', e.target.checked)}
                className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Must have Behance</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.hasTwitter}
                onChange={(e) => updateFilters('hasTwitter', e.target.checked)}
                className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Must have Twitter</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={filters.hasPortfolio}
                onChange={(e) => updateFilters('hasPortfolio', e.target.checked)}
                className="w-3 h-3 text-blue-500 border-gray-300 rounded focus:ring-blue-500" 
              />
              <span className="ml-2 text-xs text-gray-700">Must have Portfolio website</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex gap-16 border-t border-gray-200">
        {/* Apply Filters */}
        <div className="mt-2 border border-blue-400 rounded-lg">
          <button 
            onClick={() => debouncedFetchCandidates(filters)}
            className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </button>
        </div>
        
        {/* Clear Filters */}
        <div className="mt-2 border border-blue-400 rounded-lg">
          <button 
            onClick={clearAllFilters}
            className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear all filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;