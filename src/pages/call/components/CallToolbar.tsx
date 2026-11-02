import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronDown,
  SlidersHorizontal,
  Loader2,
  Search,
  FileText,
  Kanban,
  X,
} from "lucide-react";
import { MyWorkspace } from "../../../services/organizationService";
import { Job } from "../../../services/jobPostService";
import { CompanyLogo } from "./CompanyLogo";

interface CallToolbarProps {
  companies: MyWorkspace[];
  jobs: Job[];
  selectedCompanyId: number | null;
  selectedJobId: number | null;
  onSelectCompany: (companyId: number) => void;
  onSelectJob: (jobId: number) => void;
  onFetchCandidates: () => void;
  onUploadCandidates: () => void;
  onOpenJobDetails: () => void;
  onOpenFilters: () => void;
  onOpenKanban?: () => void;
  activeFilterCount: number;
  isLoadingCandidates: boolean;
  isLoadingJobs?: boolean;
  selectedScoreRange?: string | null;
  onSelectScoreRange?: (range: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}



export const CallToolbar: React.FC<CallToolbarProps> = ({
  companies,
  jobs,
  selectedCompanyId,
  selectedJobId,
  onSelectCompany,
  onSelectJob,
  onFetchCandidates,
  onUploadCandidates,
  onOpenJobDetails,
  onOpenFilters,
  onOpenKanban,
  activeFilterCount,
  isLoadingCandidates,
  isLoadingJobs,
  selectedScoreRange,
  onSelectScoreRange,
  searchQuery = "",
  onSearchChange,
}) => {
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const companySearchInputRef = useRef<HTMLInputElement>(null);

  const [isScoreDropdownOpen, setIsScoreDropdownOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(Boolean(searchQuery));
  const scoreDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const filteredCompanies = useMemo(() => {
    if (!companySearchQuery.trim()) return companies;
    return companies.filter((c) =>
      c.name.toLowerCase().includes(companySearchQuery.trim().toLowerCase())
    );
  }, [companies, companySearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCompanyDropdownOpen(false);
      }
      if (
        scoreDropdownRef.current &&
        !scoreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsScoreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleSearch = () => {
    setIsSearchExpanded((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (onSearchChange && searchQuery) {
        onSearchChange("");
      }
      return next;
    });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 font-sans">
      {/* ── Left Controls: Selectors & Main Actions ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Company Dropdown with Search & Logo */}
        <div className="relative" ref={companyDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsCompanyDropdownOpen((prev) => {
                const next = !prev;
                if (next) {
                  setTimeout(() => companySearchInputRef.current?.focus(), 50);
                } else {
                  setCompanySearchQuery("");
                }
                return next;
              });
            }}
            className="h-10 flex items-center justify-between gap-2 px-3 bg-white border border-[#D1D5DB] hover:border-gray-400 rounded-xl text-xs font-normal text-[#374151] transition cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-[150px] max-w-[220px]"
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              {selectedCompany ? (
                <>
                  <CompanyLogo name={selectedCompany.name} sizeClassName="w-5 h-5" />
                  <span className="truncate text-xs font-medium text-[#111827]">
                    {selectedCompany.name}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400 font-normal">Select Company</span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isCompanyDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* Searchable Dropdown Menu */}
          {isCompanyDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Search Bar at top */}
              <div className="p-2 border-b border-gray-100 bg-white">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={companySearchInputRef}
                    type="text"
                    placeholder="Search company..."
                    value={companySearchQuery}
                    onChange={(e) => setCompanySearchQuery(e.target.value)}
                    className="w-full h-8 pl-8 pr-7 bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#0F47F2] rounded-lg text-xs outline-none text-[#374151] transition placeholder:text-gray-400"
                  />
                  {companySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCompanySearchQuery("")}
                      className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Company Options List */}
              <div className="max-h-[450px] overflow-y-auto custom-scrollbar p-1">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((c) => {
                    const isSelected = c.id === selectedCompanyId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectCompany(c.id);
                          setIsCompanyDropdownOpen(false);
                          setCompanySearchQuery("");
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition cursor-pointer ${isSelected
                            ? "bg-[#EEF2FF] text-[#0F47F2] font-semibold"
                            : "text-[#374151] hover:bg-gray-50"
                          }`}
                      >
                        <CompanyLogo name={c.name} sizeClassName="w-6 h-6" />
                        <span className="truncate flex-1">{c.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400">
                    No companies found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Job Dropdown */}
        <div className="relative min-w-[260px] sm:min-w-[340px] max-w-[460px] flex-1">
          {isLoadingJobs ? (
            <div className="w-full h-10 flex items-center justify-between bg-gray-50 border border-[#D1D5DB] rounded-xl px-4 text-xs font-normal text-gray-500 shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-[#0F47F2] animate-spin shrink-0" />
                <span className="text-gray-500 font-medium">Loading jobs...</span>
              </div>
            </div>
          ) : (
            <>
              <select
                value={selectedJobId || ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val) onSelectJob(val);
                }}
                disabled={!selectedCompanyId}
                className={`w-full h-10 appearance-none bg-white border border-[#D1D5DB] rounded-xl px-4 pr-9 text-xs font-normal text-[#374151] focus:outline-none focus:border-[#0F47F2] transition cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                  !selectedCompanyId
                    ? "opacity-60 cursor-not-allowed bg-gray-50"
                    : "hover:border-gray-400"
                }`}
              >
                <option value="" disabled={Boolean(selectedJobId)}>
                  {selectedCompanyId
                    ? jobs.length > 0
                      ? "Select Job"
                      : "No active jobs"
                    : "Select Job"}
                </option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </>
          )}
        </div>

        {/* Search Candidates Button (Blue Solid) */}
        <button
          onClick={onFetchCandidates}
          disabled={!selectedJobId || isLoadingCandidates}
          className={`h-10 flex items-center justify-center gap-2 py-2 px-4 bg-[#0F47F2] text-white rounded-xl text-xs font-regular transition shadow-xs ${!selectedJobId || isLoadingCandidates
            ? "opacity-60 cursor-not-allowed"
            : "hover:bg-[#0c39c2] cursor-pointer"
            }`}
        >
          {isLoadingCandidates ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <span>Search Candidates</span>
          )}
        </button>

        {/* Upload Candidates Button (Outline Blue) */}
        <button
          onClick={onUploadCandidates}
          disabled={!selectedJobId}
          className={`h-10 flex items-center gap-2 px-4 border border-[#0F47F2] bg-white text-[#0F47F2] rounded-xl text-xs font-medium transition shadow-xs ${!selectedJobId
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-blue-50/50 cursor-pointer"
            }`}
        >
          <svg
            className="w-4 h-4 text-[#0F47F2]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 9.00195C19.175 9.01406 20.3529 9.11051 21.1213 9.8789C22 10.7576 22 12.1718 22 15.0002V16.0002C22 18.8286 22 20.2429 21.1213 21.1215C20.2426 22.0002 18.8284 22.0002 16 22.0002H8C5.17157 22.0002 3.75736 22.0002 2.87868 21.1215C2 20.2429 2 18.8286 2 16.0002L2 15.0002C2 12.1718 2 10.7576 2.87868 9.87889C3.64706 9.11051 4.82497 9.01406 7 9.00195"
              opacity="0.5"
            />
            <path
              d="M12 15L12 2M9 5.5L12 2L15 5.5"
              strokeLinejoin="round"
            />
          </svg>
          <span>Upload Candidates</span>
        </button>
      </div>

      {/* ── Right Controls: Search, Filters & Score ── */}
      <div className="flex items-center gap-2.5 self-end lg:self-auto">
        {/* Search Input (Expands smoothly on click or stays open if searching) */}
        {isSearchExpanded ? (
          <div className="relative flex items-center animate-in fade-in zoom-in-95 duration-150">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search candidate, role, location..."
              className="h-10 w-52 sm:w-64 pl-9 pr-8 text-xs bg-white border border-[#4B5563] rounded-xl focus:outline-none shadow-xs text-gray-800 placeholder-gray-400"
            />
            <Search className="w-4 h-4 text-[#4B5563] absolute left-3 pointer-events-none" />
            <button
              type="button"
              onClick={handleToggleSearch}
              className="absolute right-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Close search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleToggleSearch}
            title="Search candidates"
            className="w-10 h-10 flex items-center justify-center bg-white border border-[#4B5563] rounded-xl text-gray-500 hover:text-gray-800 hover:border-gray-400 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Kanban Board Navigation Button (matching screenshot) */}
        {/* <button
          onClick={onOpenKanban}
          disabled={!selectedJobId}
          title="Open Kanban Board"
          className={`w-10 h-10 flex items-center justify-center bg-white border border-[#4B5563] rounded-xl text-gray-500 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${!selectedJobId
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:text-gray-800 hover:border-gray-400"
            }`}
        >
          <Kanban className="w-4 h-4" />
        </button> */}

        {/* View Job Details Button (Document Icon from screenshot) */}
        <button
          onClick={onOpenJobDetails}
          disabled={!selectedJobId}
          title="View Job Details"
          className={`w-10 h-10 flex items-center justify-center bg-white border border-[#4B5563] rounded-xl text-gray-500 transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${!selectedJobId
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:text-gray-800 hover:border-gray-400"
            }`}
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Filters Button (Sliders Icon matching screenshot) */}
        <button
          onClick={onOpenFilters}
          className={`h-10 flex items-center gap-2 px-4 bg-white border rounded-xl text-xs font-medium transition shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer ${activeFilterCount > 0
            ? "border-[#0F47F2] text-[#0F47F2] bg-blue-50/30"
            : "border-[#4B5563] text-gray-700 hover:border-gray-400"
            }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#0F47F2] text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>


      </div>
    </div>
  );
};

export default CallToolbar;

