import React, { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Filter,
  ChevronDown,
  MapPin,
  Bookmark,
  Star,
  Link,
  File,
  Github,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  Search,
  Share,
} from "lucide-react";
import {
  candidateService,
  CandidateListItem,
  PipelineResponse,
  BulkPipelineResponse,
  PipelineStage,
  ExportCandidateResponse,
} from "../services/candidateService";
import { showToast } from "../utils/toast";


interface CandidatesMainProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCandidate: CandidateListItem | null;
  setSelectedCandidate: (candidate: CandidateListItem | null) => void;
  searchTerm: string;
  candidates: CandidateListItem[];
  totalCount: number;
  jobId: string;
  onPipelinesClick?: () => void;
  deductCredits: () => Promise<void>;
  onCandidatesUpdate: (
    candidates: CandidateListItem[],
    totalCount: number
  ) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onSearchChange: (query: string) => void; // Added for search integration
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  loadingCandidates: boolean;

}

const CandidatesMain: React.FC<CandidatesMainProps> = ({
  activeTab,
  setActiveTab,
  selectedCandidate,
  setSelectedCandidate,
  searchTerm,
  candidates,
  totalCount,
  jobId,
  onPipelinesClick,
  deductCredits,
  onCandidatesUpdate,
  currentPage,
  setCurrentPage,
  onSearchChange,
  sortBy,
  setSortBy,
  loadingCandidates,
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const candidatesPerPage = 20;
  const maxVisiblePages = 5;

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Local state for search input
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const tabs = [
    {
      id: "outbound",
      label: "Outbound",
      count: activeTab === "outbound" ? totalCount : 0,
    },
    {
      id: "active",
      label: "Active",
      count: activeTab === "active" ? totalCount : 0,
    },
    {
      id: "inbound",
      label: "Inbound",
      count: activeTab === "inbound" ? totalCount : 0,
    },
    {
      id: "prevetted",
      label: "Prevetted",
      count: activeTab === "prevetted" ? totalCount : 0,
    },
  ];

  const sortOptions = [
    { value: '', label: 'Relevance' },
    { value: 'experience_asc', label: 'Experience(Asc)' },
    { value: 'experience_desc', label: 'Experience(Desc)' },
    { value: 'notice_period_asc', label: 'Notice Period(Asc)' },
    { value: 'notice_period_desc', label: 'Notice Period(Desc)' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setTotalPages(Math.ceil(totalCount / candidatesPerPage) || 1);
    if (currentPage > Math.ceil(totalCount / candidatesPerPage)) {
      setCurrentPage(1);
    }
  }, [totalCount, currentPage, setCurrentPage]);

  const handleCandidateSelect = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const currentPageCandidates = candidates
        .map((candidate) => candidate.id);
      setSelectedCandidates(currentPageCandidates);
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleBulkAddToPipeline = async () => {
    if (selectedCandidates.length === 0) {
      showToast.error("Please select at least one candidate");
      return;
    }

    try {
      const response: BulkPipelineResponse =
        await candidateService.bulkAddToPipeline(
          parseInt(jobId),
          selectedCandidates
        );
      showToast.success(response.message);
      setSelectedCandidates([]);
      setSelectAll(false);
    } catch (error: any) {
      showToast.error(error.message || "Failed to add candidates to pipeline");
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      setSelectAll(false);
      setSelectedCandidates([]);
    }
  };

  const handleCandidateClick = async (candidate: CandidateListItem) => {
    setSelectedCandidate(candidate);
    await deductCredits();
  };

  const handleSaveToPipeline = async (
    candidateId: string,
    stageId?: number
  ) => {
    try {
      const response: PipelineResponse = await candidateService.saveToPipeline(
        parseInt(jobId),
        candidateId,
        stageId
      );
      const stageName = stageId
        ? pipelineStages.find((stage) => stage.id === stageId)?.name
        : "default stage";
      showToast.success(
        `Candidate successfully added to pipeline${
          stageId ? ` (${stageName})` : ""
        }`
      );
      setShowDropdown(null);
    } catch (error: any) {
      console.error("Save to Pipeline Error:", error.message);
      console.error("Error code", error.response?.status);
      console.error("Error code", error.response?.data?.non_field_errors[0]);
      if (
      error.response?.status === 400 &&
      error.response?.data?.non_field_errors?.some((err: string) =>
        err.includes("unique set")
      )
      ) {
        // const candidate = candidates.find((c) => c.id === candidateId);
        // const candidateName = candidate?.full_name || "Candidate";
        showToast.info(`Candidate is already added to the pipeline`);
      } else {
        showToast.error(error.message);
      }
    }
  };

  const handleDropdownToggle = async (
    candidateId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (showDropdown === candidateId) {
      setShowDropdown(null);
      return;
    }

    try {
      const stages = await candidateService.getPipelineStages(parseInt(jobId));
      setPipelineStages(stages.slice(0, 5));
      setShowDropdown(candidateId);
    } catch (error: any) {
      showToast.error(error.message || "Failed to fetch pipeline stages");
    }
  };

  const handleSortSelect = (sortValue: string) => {
    setSortBy(sortValue);
    setShowSortDropdown(false);
  };

  const downloadFile = (data: string | Blob, fileName: string, type: "csv" | "xlsx") => {
  const blob = typeof data === "string"
    ? new Blob([data], {
        type: type === "csv"
          ? "text/csv"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    : data;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const handleExportCandidates = async (format: "csv" | "xlsx") => {
  if (selectedCandidates.length === 0) {
    showToast.error("Please select at least one candidate");
    return;
  }

  setExportLoading(true);
  try {
    const response: ExportCandidateResponse =
      await candidateService.exportCandidates(selectedCandidates);

    // Log the response to inspect its structure
    console.log("API Response:", response);

    if (typeof response !== "string") {
      throw new Error("Invalid response format: Expected a CSV string");
    }

    if (!response.trim()) {
      throw new Error("No candidate data returned for export");
    }

    if (format === "csv") {
      // Use the response directly for CSV
      downloadFile(response, `candidates_export_${Date.now()}.csv`, "csv");
    } else {
      // Simple CSV parsing
      const lines = response.split("\n").filter((line) => line.trim());
      const worksheetData = lines.map((line) =>
        line.split(",").map((value) => value.replace(/^"|"$/g, "").replace(/""/g, '"'))
      );

      if (worksheetData.length < 2) {
        throw new Error("No candidate data returned for export");
      }

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadFile(blob, `candidates_export_${Date.now()}.xlsx`, "xlsx");
    }

    showToast.success(
      `Candidates exported successfully as ${format.toUpperCase()}`
    );
    setShowExportDialog(false);
    setSelectedCandidates([]);
    setSelectAll(false);
  } catch (error: any) {
    console.error("Export Error:", error);
    showToast.error(error.message || "Failed to export candidates");
  } finally {
    setExportLoading(false);
  }
};

  const getAvatarColor = (name: string) => "bg-blue-500";

  const getStarCount = (skill: string) => {
    const sum = skill
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (sum % 5) + 1;
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      const halfWindow = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(2, currentPage - halfWindow);
      let endPage = Math.min(totalPages - 1, currentPage + halfWindow);

      if (endPage - startPage + 1 < maxVisiblePages) {
        if (currentPage <= halfWindow + 1) {
          endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
        } else {
          startPage = Math.max(2, endPage - maxVisiblePages + 1);
        }
      }

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    candidate: CandidateListItem
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCandidateClick(candidate);
    }
  };

  const startIndex = (currentPage - 1) * candidatesPerPage;
  const endIndex = Math.min(startIndex + candidatesPerPage, candidates.length);
  const [hoveredCandidateId, setHoveredCandidateId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl  h-fit">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          <div className="flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 text-sm lg:text-base font-[400] rounded-t-lg transition-all duration-200 whitespace-nowrap border-b-2 focus-visible:border-b-2 focus-visible:border-blue-600 ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 border-transparent hover:text-gray-700"
                }`}
                aria-label={`Switch to ${tab.label} tab`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-50 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 lg:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-200 border-gray-200 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 "
                aria-label="Select all candidates"
              />
              <span className="ml-2 text-xs text-gray-400 lg:text-base font-[400]">Select all on this page</span>
            </label>
            <div className="flex space-x-3">
            <button
              className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              onClick={handleBulkAddToPipeline}
              aria-label="Add selected candidates to pipeline"
            >
              Add To Pipeline
            </button>
            <button
              className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              onClick={() => setShowExportDialog(true)}
              aria-label="Export selected candidates"
            >
              Export Candidates
            </button>
          
          <div className="relative flex space-x-2">
            <button
                className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                aria-label="Sort candidates"
              >
                Sort By - <span className="text-gray-400 font-[400] ml-1 mr-1">{sortOptions.find(opt => opt.value === sortBy)?.label || 'Relevance'}</span>
                <ChevronDown className="w-4 h-4 mt-1" />
              </button>
              {showSortDropdown && (
                <div
                  ref={sortDropdownRef}
                  className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                >
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        onClick={() => handleSortSelect(option.value)}
                        aria-label={`Sort candidates by ${option.label}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>
          </div>
        </div>
      </div>

      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900">
              Export {selectedCandidates.length} Candidate
              {selectedCandidates.length !== 1 ? "s" : ""}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Please choose the export format for the selected candidates.
            </p>
            <div className="mt-4 flex justify-start space-x-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={() => handleExportCandidates("csv")}
                disabled={exportLoading}
                area-label="Export candidates as CSV"
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  "Export as CSV"
                )}
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={() => handleExportCandidates("xlsx")}
                disabled={exportLoading}
                area-label="Export candidates as Excel"
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  "Export as Excel"
                )}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={() => setShowExportDialog(false)}
                disabled={exportLoading}
                area-label="Cancel export dialog"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingCandidates ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-400 text-xs lg:text-base font-[400]">Loading candidates...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-xs lg:text-base font-[400]">No candidates found.</p>
        </div>
      ) : (
      <>
      <div className="space-y-4 border-b-1 border-[#E2E2E2] overflow-y-auto max-h-[calc(100vh-0px)] hide-scrollbar p-4">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className={`pt-5 hover:bg-blue-50 transition-colors cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
              selectedCandidate?.id === candidate.id
                ? "bg-blue-50 border-l-4 border-blue-500"
                : "border border-gray-200"
            }`}
            onClick={() => handleCandidateClick(candidate)}
            onKeyDown={(e) => handleKeyDown(e, candidate)}
            tabIndex={0}
            role="button"
            aria-label={`Select candidate ${candidate.full_name}`}
          >
            <div className="flex px-4 items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedCandidates.includes(candidate.id)}
                onChange={() => handleCandidateSelect(candidate.id)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${candidate.full_name}`}
              />
              <div className="border-b border-[#A8A8A8] flex items-center space-x-3 pb-5 w-full">
              <div
                className={`w-14 h-14 ${getAvatarColor(
                  candidate.full_name
                )} rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-base font-[600] `}
              >
                {candidate.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2 pr-4">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-xs lg:text-base font-[400] text-gray-900">
                      {candidate.full_name}
                    </h3>
                    {candidate.is_background_verified && (
                      <div className="relative flex space-x-1"
                        onMouseEnter={() => setHoveredCandidateId(candidate.id)}
                        onMouseLeave={() => setHoveredCandidateId(null)}>
                        <span className="mt-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="256"
                            height="256"
                            viewBox="0 0 256 256"
                            xmlSpace="preserve"
                          >
                            <g
                              transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
                              style={{
                                stroke: "none",
                                strokeWidth: 0,
                                strokeDasharray: "none",
                                strokeLinecap: "butt",
                                strokeLinejoin: "miter",
                                strokeMiterlimit: 10,
                                fill: "none",
                                fillRule: "nonzero",
                                opacity: 1,
                              }}
                            >
                              <polygon
                                points="45,6.18 57.06,0 64.41,11.38 77.94,12.06 78.62,25.59 90,32.94 83.82,45 90,57.06 78.62,64.41 77.94,77.94 64.41,78.62 57.06,90 45,83.82 32.94,90 25.59,78.62 12.06,77.94 11.38,64.41 0,57.06 6.18,45 0,32.94 11.38,25.59 12.06,12.06 25.59,11.38 32.94,0"
                                style={{
                                  stroke: "none",
                                  strokeWidth: 1,
                                  strokeDasharray: "none",
                                  strokeLinecap: "butt",
                                  strokeLinejoin: "miter",
                                  strokeMiterlimit: 10,
                                  fill: "rgb(0,150,241)",
                                  fillRule: "nonzero",
                                  opacity: 1,
                                }}
                                transform="matrix(1 0 0 1 0 0)"
                              />
                              <polygon
                                points="40.16,58.47 26.24,45.08 29.7,41.48 40.15,51.52 61.22,31.08 64.7,34.67"
                                style={{
                                  stroke: "none",
                                  strokeWidth: 1,
                                  strokeDasharray: "none",
                                  strokeLinecap: "butt",
                                  strokeLinejoin: "miter",
                                  strokeMiterlimit: 10,
                                  fill: "rgb(255,255,255)",
                                  fillRule: "nonzero",
                                  opacity: 1,
                                }}
                                transform="matrix(1 0 0 1 0 0)"
                              />
                            </g>
                          </svg>
                        </span>
                        {hoveredCandidateId === candidate.id && (
                            <div
                              className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-700 z-10"
                              role="tooltip"
                              aria-hidden={hoveredCandidateId !== candidate.id}
                            >
                              Verified via last employer's confirmation
                            </div>
                          )}
                      </div>
                    )}        
                  </div>
                  <div className="flex space-x-1">
                    <p className="flex items-center gap-2 text-xs lg:text-base font-[400] text-[#4B5563] mt-1">
                      <MapPin className=" w-4 h-4" />
                      {candidate.location?.split(",")[0]}
                    </p>
                  </div>
                  
                </div>
                <div className="flex space-x-2">
                  <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[24ch] truncate">
                    {candidate.experience_summary?.title}
                  </p>
                  <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1">
                    |
                  </p> 
                  <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[24ch] truncate">
                    {candidate.education_summary?.title}
                  </p>
                </div>
              </div>
              </div>
            </div>
              <div className="pt-5 pl-12 flex space-x-12 gap-2 text-xs lg:text-base font-[400px] ml-1">
                {candidate.experience_years && 
                (
                  <div className="flex flex-col">
                    <p className="text-[#A8A8A8] mr-[5px]">Experience</p>
                    <p className="text-[#4B5563]">
                      {candidate.experience_years}
                    </p>
                </div>
                )}
                {/* need to update the current Company Data */}
                {candidate.experience_years && 
                (
                  <div className="flex flex-col">
                    <p className="text-[#A8A8A8] mr-[5px]">Current Company</p>
                    <p className="text-[#4B5563]">
                      {candidate.experience_years}
                    </p>
                </div>
                )}
                {candidate.notice_period_summary && 
                (
                  <div className="flex flex-col">
                    <p className="text-[#A8A8A8] mr-[5px]">Notice Period</p>
                    <p className="text-[#4B5563]">
                      {candidate.notice_period_summary}
                    </p>
                </div>
                )}
                {/* need to update the code for Current Salary */}
                {true && 
                (
                  <div className="flex flex-col">
                  <p className="text-[#A8A8A8] mr-[5px]">Current Salary</p>
                  <p className="text-[#4B5563]">
                    9LPA
                  </p>
                </div>
                )}
 
              </div>
              <div className="p-3 pl-12 mt-5 bg-[#F5F9FB] flex items-center justify-between space-x-2 flex-wrap gap-2 rounded-lg">
                <div className="flex items-center space-x-1">
                    {candidate.social_links?.github && (
                      <button
                        className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        onClick={() =>
                          window.open(candidate.social_links?.github, "_blank")
                        }
                        aria-label={`View ${candidate.full_name}'s GitHub profile`}
                      >
                        <Github className="w-4 h-4" />
                      </button>
                    )}
                    {candidate.social_links?.linkedin && (
                      <button
                        className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        onClick={() =>
                          window.open(
                            candidate.social_links?.linkedin,
                            "_blank"
                          )
                        }
                        aria-label={`View ${candidate.full_name}'s LinkedIn profile`}
                      >
                        <Linkedin className="w-4 h-4" />
                      </button>
                    )}
                    {candidate.social_links?.resume && (
                      <button
                        className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        onClick={() =>
                          window.open(candidate.social_links?.resume, "_blank")
                        }
                        aria-label={`View ${candidate.full_name}'s resume`}
                      >
                        <File className="w-4 h-4" />
                      </button>
                    )}
                    {candidate.social_links?.portfolio && (
                      <button
                        className="p-2 text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        onClick={() =>
                          window.open(
                            candidate.social_links?.portfolio,
                            "_blank"
                          )
                        }
                        aria-label={`View ${candidate.full_name}'s portfolio`}
                      >
                        <Link className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                <div className="rounded-md flex space-x-1 border border-blue-400 hover:border-blue-600 transition-colors">
                  <button
                    className="pl-3 pr-2 py-1.5 text-blue-600 text-sm font-medium flex items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveToPipeline(candidate.id,1926);
                    }}
                    aria-label={`Save ${candidate.full_name} to pipeline`}
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-[#0F47F2] mt-2"
                    >
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                    </svg>
                    Save to Pipeline
                  </button>
                  <div className="w-px bg-blue-500 my-1"></div>
                  <div className="relative">
                    <button
                      className=" pl-1.5 pr-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                      onClick={(e) => handleDropdownToggle(candidate.id, e)}
                      aria-label={`Add ${candidate.full_name} to pipeline stages`}
                    >
                      <ChevronDown className="w-4 h-4 ml-1 mt-[2px] text-blue-600" />
                    </button>
                    {showDropdown === candidate.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute mt-2 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                      >
                        <div className="py-1">
                          {pipelineStages.map((stage) => (
                            <button
                              key={stage.id}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveToPipeline(candidate.id, stage.id);
                              }}
                              aria-label={`Add ${candidate.full_name} to ${stage.name} stage`}
                            >
                              {stage.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </div>
        ))}
      </div>
      </>
      )}
      {totalPages > 1 ? (
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400 text-xs lg:text-base font-[400]">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, totalCount) + startIndex} of {totalCount}{" "}
              candidates
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                area-label={`Go to previous page`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  className={`px-3 py-1 text-sm rounded-lg transition-colors focus-visible:ring focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : typeof page === "number"
                      ? "text-gray-600 hover:bg-gray-100"
                      : "text-gray-600 cursor-default"
                  }`}
                  disabled={typeof page !== "number"}
                  area-label={`Go to page ${page}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring focus-visible:ring-2 focus-visible:ring-blue-500"
                area-label={`Go to next page`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400 text-xs lg:text-base font-[400]">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, totalCount) + startIndex} of {totalCount}{" "}
              candidates
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof page === "number" && handlePageChange(page)
                  }
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : typeof page === "number"
                      ? "text-gray-600 hover:bg-gray-100"
                      : "text-gray-600 cursor-default"
                  }`}
                  disabled={typeof page !== "number"}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesMain;
