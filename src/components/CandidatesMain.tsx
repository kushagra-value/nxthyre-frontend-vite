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
  ArrowDownNarrowWide,
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
import { AnalysisResult } from "../services/candidateService";

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
  sourcingCounts: {
    inbound: number;
    outbound: number;
    active: number;
    prevetted: number;
  };
  activeCategoryTotalCount: number;
  currentAnalysis?: AnalysisResult | null;
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
  sourcingCounts,
  activeCategoryTotalCount,
  currentAnalysis,
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
  const candidatesPerPage = 8;
  const maxVisiblePages = 5;

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Local state for search input
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const [showRevealDialog, setShowRevealDialog] = useState(false);
  const [pendingReveal, setPendingReveal] = useState<{
    candidateId: string;
    onSuccess: (prem: any) => void;
  } | null>(null);
  const [revealLoading, setRevealLoading] = useState(false);

  const tabs = [
    {
      id: "outbound",
      label: "Outbound",
      count:
        activeTab === "outbound"
          ? sourcingCounts.outbound
          : sourcingCounts.outbound,
    },
    {
      id: "active",
      label: "Active",
      count:
        activeTab === "active" ? sourcingCounts.active : sourcingCounts.active,
    },
    {
      id: "inbound",
      label: "Inbound",
      count:
        activeTab === "inbound"
          ? sourcingCounts.inbound
          : sourcingCounts.inbound,
    },
    {
      id: "prevetted",
      label: "Prevetted",
      count:
        activeTab === "prevetted"
          ? sourcingCounts.prevetted
          : sourcingCounts.prevetted,
    },
  ];

  const sortOptions = [
    { value: "", label: "Relevance" },
    { value: "experience_asc", label: "Experience(Asc)" },
    { value: "experience_desc", label: "Experience(Desc)" },
    { value: "notice_period_asc", label: "Notice Period(Asc)" },
    { value: "notice_period_desc", label: "Notice Period(Desc)" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
      const currentPageCandidates = candidates.map((candidate) => candidate.id);
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
      const updatedCandidates = candidates.filter(
        (c) => !selectedCandidates.includes(c.id)
      );
      onCandidatesUpdate(
        updatedCandidates,
        totalCount - selectedCandidates.length
      );
      if (selectedCandidates.includes(selectedCandidate?.id || "")) {
        setSelectedCandidate(updatedCandidates[0] || null);
      }
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

  const handleReveal = async (candidateId: string) => {
    try {
      const premResponse = await candidateService.revealPremiumData(
        candidateId
      );
      const updated = candidates.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              premium_data_unlocked: true,
              premium_data: premResponse.premium_data,
            }
          : c
      );
      onCandidatesUpdate(updated, totalCount);
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(updated.find((c) => c.id === candidateId) || null);
      }
      return premResponse;
    } catch (e) {
      showToast.error("Failed to reveal premium data");
      throw e;
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
        stageId,
        candidateId === selectedCandidate?.id
          ? currentAnalysis ?? undefined
          : undefined
      );

      if (stageId) {
        const targetStage = pipelineStages.find(
          (stage) => stage.id === stageId
        );
        if (targetStage?.slug === "coding-contest") {
          await candidateService.scheduleCodingAssessmentEmail(
            candidateId,
            parseInt(jobId)
          );
        }
      }

      const stageName = stageId
        ? pipelineStages.find((stage) => stage.id === stageId)?.name
        : "default stage";
      showToast.success(
        `Candidate successfully added to pipeline${
          stageId ? ` (${stageName})` : ""
        }`
      );
      const updatedCandidates = candidates.filter((c) => c.id !== candidateId);
      onCandidatesUpdate(updatedCandidates, totalCount - 1);
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(updatedCandidates[0] || null);
      }
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

  useEffect(() => {
    if (jobId) {
      candidateService
        .getPipelineStages(parseInt(jobId))
        .then((stages) => {
          setPipelineStages(stages);
        })
        .catch((error) => {
          showToast.error(error.message || "Failed to fetch pipeline stages");
        });
    }
  }, [jobId]);

  const handleDropdownToggle = (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDropdown === candidateId) {
      setShowDropdown(null);
      return;
    }
    setShowDropdown(candidateId);
  };

  const handleSortSelect = (sortValue: string) => {
    setSortBy(sortValue);
    setShowSortDropdown(false);
  };

  const downloadFile = (
    data: string | Blob,
    fileName: string,
    type: "csv" | "xlsx"
  ) => {
    const blob =
      typeof data === "string"
        ? new Blob([data], {
            type:
              type === "csv"
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
          line
            .split(",")
            .map((value) => value.replace(/^"|"$/g, "").replace(/""/g, '"'))
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

  const handleConfirmReveal = async () => {
    if (!pendingReveal) return;
    setRevealLoading(true);
    try {
      const prem = await handleReveal(pendingReveal.candidateId);
      await deductCredits();
      pendingReveal.onSuccess(prem);
    } catch (e) {
      // Error already handled in handleReveal
    } finally {
      setShowRevealDialog(false);
      setPendingReveal(null);
      setRevealLoading(false);
    }
  };

  const startIndex = (currentPage - 1) * candidatesPerPage;
  const endIndex = Math.min(startIndex + candidatesPerPage, candidates.length);
  const [hoveredCandidateId, setHoveredCandidateId] = useState<string | null>(
    null
  );

  const desiredInboundSlugs = [
    "coding-contest",
    "ai-interview",
    "shortlisted",
    "archives",
  ] as const;

  const inboundStages = pipelineStages
    .filter((stage) => desiredInboundSlugs.includes(stage.slug as any))
    .sort(
      (a, b) =>
        desiredInboundSlugs.indexOf(a.slug as any) -
        desiredInboundSlugs.indexOf(b.slug as any)
    );

  const getStagesToShow = (isInbound: boolean) =>
    isInbound ? inboundStages : pipelineStages.slice(0, 5);

  const getStageDisplayName = (stage: PipelineStage): string => {
    switch (stage.slug) {
      case "coding-contest":
        return "Coding Round";
      case "archives":
        return "Archived";
      default:
        return stage.name;
    }
  };

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
                    {activeTab === tab.id && loadingCandidates
                      ? "..."
                      : tab.count}
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
            <span className="ml-2 text-xs text-gray-400 lg:text-base font-[400]">
              Select all on this page
            </span>
          </label>
          <div className="flex space-x-3">
            {selectedCandidates.length > 0 && (
              <button
                className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={handleBulkAddToPipeline}
                aria-label="Add selected candidates to pipeline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="mr-1"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                </svg>
                Add To Pipeline
              </button>
            )}

            <button
              className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center space-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              onClick={() => setShowExportDialog(true)}
              aria-label="Export selected candidates"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-400 text-xs lg:text-base font-[400] mr-1"
              >
                <path
                  d="M7.84594 1.5587C7.75713 1.46158 7.63163 1.40625 7.5 1.40625C7.36838 1.40625 7.24288 1.46158 7.15407 1.5587L4.65405 4.29307C4.47937 4.48414 4.49264 4.78064 4.6837 4.95533C4.87477 5.13001 5.17127 5.11674 5.34595 4.92568L7.03125 3.08237V10C7.03125 10.2589 7.24113 10.4688 7.5 10.4688C7.75888 10.4688 7.96875 10.2589 7.96875 10V3.08237L9.65407 4.92568C9.82875 5.11674 10.1253 5.13001 10.3163 4.95533C10.5074 4.78064 10.5206 4.48414 10.3459 4.29307L7.84594 1.5587Z"
                  fill="#818283"
                />
                <path
                  d="M2.34375 9.375C2.34375 9.11612 2.13389 8.90625 1.875 8.90625C1.61612 8.90625 1.40625 9.11612 1.40625 9.375V9.40931C1.40624 10.2641 1.40623 10.953 1.47908 11.4949C1.55471 12.0574 1.71652 12.5311 2.09272 12.9072C2.46892 13.2835 2.94259 13.4453 3.50516 13.5209C4.04701 13.5937 4.73596 13.5937 5.59071 13.5937H9.40931C10.2641 13.5937 10.953 13.5937 11.4949 13.5209C12.0574 13.4453 12.5311 13.2835 12.9073 12.9072C13.2835 12.5311 13.4453 12.0574 13.5209 11.4949C13.5937 10.953 13.5938 10.2641 13.5938 9.40931V9.375C13.5938 9.11612 13.3839 8.90625 13.125 8.90625C12.8661 8.90625 12.6562 9.11612 12.6562 9.375C12.6562 10.2721 12.6553 10.8978 12.5918 11.3699C12.5301 11.8286 12.4174 12.0714 12.2444 12.2444C12.0714 12.4174 11.8286 12.5301 11.3699 12.5918C10.8978 12.6552 10.2721 12.6562 9.375 12.6562H5.625C4.72787 12.6562 4.10217 12.6552 3.63008 12.5918C3.17147 12.5301 2.92861 12.4174 2.75563 12.2444C2.58266 12.0714 2.46988 11.8286 2.40822 11.3699C2.34474 10.8978 2.34375 10.2721 2.34375 9.375Z"
                  fill="#818283"
                />
              </svg>
              Export
            </button>

            <div className="relative flex space-x-2">
              <button
                className="px-1.5 py-1.5 bg-white text-gray-400 text-xs lg:text-base font-[400] rounded-lg border border-gray-300 hover:border-gray-400 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                aria-label="Sort candidates"
              >
                <ArrowDownNarrowWide className="w-4 h-4 rotate-180" />
                <span className="text-gray-400 font-[400] ml-1 mr-1">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label ||
                    "Relevance"}
                </span>
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

      {showRevealDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900">
              Reveal Premium Data
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Your credits will be deducted. Confirm?
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={() => {
                  setShowRevealDialog(false);
                  setPendingReveal(null);
                }}
                disabled={revealLoading}
                aria-label="Cancel reveal"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                onClick={handleConfirmReveal}
                disabled={revealLoading}
                aria-label="Confirm reveal"
              >
                {revealLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Revealing...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingCandidates ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-400 text-xs lg:text-base font-[400]">
            Loading candidates...
          </p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          {activeTab === "inbound" && totalCount < activeCategoryTotalCount && (
            <div className="m-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-yellow-700 text-sm">
                There might be fewer candidates in the Inbound tab due to
                applied filters. You can click on the "Clear All Filters" button
                in the sidebar to view all candidates.
              </p>
            </div>
          )}
          <p className="text-gray-400 text-xs lg:text-base font-[400]">
            No candidates found.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 border-b-1 border-[#E2E2E2] overflow-y-auto max-h-[calc(100vh-0px)] hide-scrollbar p-4">
            {activeTab === "inbound" &&
              totalCount < activeCategoryTotalCount && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <p className="text-yellow-700 text-sm">
                    There might be fewer candidates in the Inbound tab due to
                    applied filters. You can click on the "Clear All Filters"
                    button in the sidebar to view all candidates.
                  </p>
                </div>
              )}
            {candidates.map((candidate) => {
              // Extract college name from education_summary.title
              let collegeName = candidate?.education_summary?.title
                ? candidate.education_summary.title.split("-")[0].trim()
                : "";

              // Convert to Title Case (each word's first letter capitalized)
              const toTitleCase = (str: any) =>
                str
                  .toLowerCase()
                  .split(" ")
                  .map(
                    (word: any) => word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ");

              collegeName = toTitleCase(collegeName);

              return (
                <div
                  key={candidate.id}
                  className={`relative pt-5 hover:bg-blue-50 transition-colors cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500  ${
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
                  {candidate.premium_data_unlocked && (
                    <button
                      className="absolute top-0 left-0 z-10 "
                      title="Information revealed"
                    >
                      <svg
                        width="21"
                        height="18"
                        viewBox="0 0 21 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className=""
                      >
                        <path
                          d="M0.5 17.5L0.5 4.5C0.5 2.29086 2.29086 0.5 4.5 0.5L20.5 0.5L10.5 9L0.5 17.5Z"
                          fill="#3B82F6"
                        />
                      </svg>
                    </button>
                  )}
                  <div className="flex px-4 items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => handleCandidateSelect(candidate.id)}
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${candidate.full_name}`}
                    />
                    <div className="border-b border-[#E2E2E2] flex items-center space-x-3 pb-5 w-full">
                      <div
                        className={`w-14 h-14 ${getAvatarColor(
                          candidate.full_name
                        )} rounded-full flex items-center justify-center text-white text-xs lg:text-base font-[600] `}
                      >
                        {candidate?.profile_picture_url ? (
                          <img
                            src={candidate.profile_picture_url}
                            alt={candidate.full_name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          candidate.avatar
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2 pr-4">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h3 className="text-xs lg:text-base font-[600] text-gray-900">
                              {candidate.full_name}
                            </h3>

                            {candidate.is_background_verified && (
                              <div
                                className="relative flex space-x-1"
                                onMouseEnter={() =>
                                  setHoveredCandidateId(candidate.id)
                                }
                                onMouseLeave={() => setHoveredCandidateId(null)}
                              >
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
                                    aria-hidden={
                                      hoveredCandidateId !== candidate.id
                                    }
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
                        <div className="flex items-center space-x-2">
                          <div className="relative group">
                            <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[48ch] truncate">
                              {candidate.headline}
                              {collegeName && (
                                <span>
                                  {" "}
                                  {"from"} {collegeName}
                                </span>
                              )}
                            </p>
                            {candidate?.headline && (
                              <div className="absolute hidden group-hover:block bg-blue-500 text-white text-xs font-[400] rounded-md px-2 py-0.5 -bottom-5 -left-2 w-max max-w-xs z-10">
                                {candidate.headline}{" "}
                                {collegeName && (
                                  <span>
                                    {" "}
                                    {"from"} {collegeName}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {/* {candidate.experience_summary?.title && (
                          <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1">
                            |
                          </p>
                        )}
                        <div className="relative group">
                          <p className="text-xs lg:text-base font-[400] text-[#0F47F2] mt-1 max-w-[24ch] truncate">
                            {candidate.education_summary?.title}
                          </p>
                          {candidate.education_summary?.title && (
                            <div className="absolute hidden group-hover:block bg-blue-500 text-white text-xs font-[400] rounded-md px-2 py-0.5 -bottom-5 -left-2 w-max max-w-xs z-10">
                              {candidate.education_summary?.title}
                            </div>
                          )}
                        </div> */}
                        </div>

                        {activeTab === "active" && candidate.last_active_at && (
                          <div className="flex items-center space-x-1 text-xs mt-1 font-[400] text-gray-700">
                            {(() => {
                              const lastActiveDate: Date = new Date(
                                candidate.last_active_at as string
                              );
                              const today: Date = new Date();

                              // Compare only date part (ignore time)
                              const diffTime: number =
                                today.setHours(0, 0, 0, 0) -
                                lastActiveDate.setHours(0, 0, 0, 0);
                              const diffDays: number = Math.floor(
                                diffTime / (1000 * 60 * 60 * 24)
                              );

                              if (diffDays === 0) {
                                return "Active today";
                              } else if (diffDays > 0) {
                                return `Active ${diffDays} day${
                                  diffDays > 1 ? "s" : ""
                                } ago`;
                              } else {
                                return "N/A"; // fallback if backend sends future dates
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-5 pl-12 flex space-x-12 gap-2 text-xs lg:text-base font-[400px] ml-1">
                    {candidate?.experience_years && (
                      <div className="flex flex-col">
                        <p className="text-[#A8A8A8] mr-[5px]">Experience</p>
                        <p className="text-[#4B5563]">
                          {candidate.experience_years}
                        </p>
                      </div>
                    )}
                    {/* need to update the current Company Data */}
                    {candidate?.experience_summary?.duration_years && (
                      <div className="flex flex-col">
                        <p className="text-[#A8A8A8] mr-[5px]">
                          Current Company
                        </p>
                        <p className="text-[#4B5563]">
                          {candidate?.experience_summary?.duration_years} years
                        </p>
                      </div>
                    )}
                    {candidate.notice_period_summary && (
                      <div className="flex flex-col">
                        <p className="text-[#A8A8A8] mr-[5px]">Notice Period</p>
                        <p className="text-[#4B5563]">
                          {candidate.notice_period_summary
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </p>
                      </div>
                    )}
                    {/* need to update the code for Current Salary */}
                    {candidate.current_salary_lpa && (
                      <div className="flex flex-col">
                        <p className="text-[#A8A8A8] mr-[5px]">
                          Current Salary
                        </p>
                        <p className="text-[#4B5563]">
                          {candidate.current_salary_lpa}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 pl-12 mt-5 bg-[#F5F9FB] flex items-center justify-between space-x-2 flex-wrap gap-2 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {candidate.premium_data_availability
                        ?.pinterest_username &&
                        (() => {
                          const url = candidate.premium_data_unlocked
                            ? candidate.premium_data?.pinterest_username
                            : null;
                          return (
                            <button
                              className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (url) {
                                  window.open(url, "_blank");
                                } else {
                                  setPendingReveal({
                                    candidateId: candidate.id,
                                    onSuccess: (prem) => {
                                      const finalUrl =
                                        prem.premium_data.pinterest_username;
                                      if (finalUrl)
                                        window.open(finalUrl, "_blank");
                                    },
                                  });
                                  setShowRevealDialog(true);
                                }
                              }}
                              aria-label={`View ${candidate.full_name}'s pinterest`}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M11.8512 0C5.27881 0 0 5.32158 0 11.9502C0 16.8702 2.88841 20.9873 7.07161 22.8955C7.07161 20.6545 7.05599 20.9433 8.76359 13.6564C7.82519 11.7627 8.55481 8.63613 10.656 8.63613C13.572 8.63613 11.5908 12.9594 11.2536 14.6607C10.9548 15.9664 11.9508 16.9711 13.146 16.9711C15.4368 16.9711 16.9296 14.0583 16.9296 10.6447C16.9296 8.03344 15.138 6.12539 12.0504 6.12539C6.56041 6.12539 5.16841 12.2395 7.07161 14.1586C7.55041 14.8834 7.07161 14.9173 7.07161 15.866C6.73921 16.8691 4.0836 15.411 4.0836 11.649C4.0836 8.23428 6.8724 4.21816 12.5484 4.21816C17.0292 4.21816 20.0172 7.53151 20.0172 11.0467C20.0172 15.7659 17.4276 19.1807 13.644 19.1807C12.3492 19.1807 11.154 18.4771 10.7556 17.6736C10.032 20.4882 9.88559 21.9151 8.76359 23.4979C9.85919 23.7991 10.9548 24 12.15 24C18.7224 24 24 18.6784 24 12.051C23.7024 5.32193 18.4236 0 11.8512 0Z"
                                  fill="#4B5563"
                                />
                              </svg>
                            </button>
                          );
                        })()}
                      {candidate.premium_data_availability?.github_username &&
                        (() => {
                          const url = candidate.premium_data_unlocked
                            ? candidate.premium_data?.github_url
                            : null;

                          return (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (url) {
                                  window.open(url, "_blank");
                                } else {
                                  setPendingReveal({
                                    candidateId: candidate.id,
                                    onSuccess: (prem) => {
                                      const finalUrl =
                                        prem.premium_data.github_url;
                                      if (finalUrl)
                                        window.open(finalUrl, "_blank");
                                    },
                                  });
                                  setShowRevealDialog(true);
                                }
                              }}
                              className="text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full"
                              aria-label={`View ${candidate.full_name}'s Github profile`}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clip-path="url(#clip0_3112_1059)">
                                  <path
                                    d="M15.0039 11.8779C14.6007 11.8076 14.1789 11.8169 13.7664 11.8404C12.8289 11.8919 11.8914 11.981 10.9539 11.8966C10.5086 11.8544 10.0586 11.8123 9.60856 11.8216C8.79293 11.8357 8.10856 12.1029 7.70543 12.881C7.50387 13.2654 7.45699 13.6779 7.47106 14.1044C7.50387 15.3044 8.02418 15.9888 9.16793 16.331C10.0867 16.6029 11.0289 16.6404 11.9757 16.6216C12.3273 16.6216 12.6789 16.6404 13.0304 16.6169C13.757 16.5748 14.4695 16.4669 15.1586 16.2138C15.8711 15.9513 16.2976 15.4498 16.4523 14.7232C16.5132 14.4419 16.5414 14.1466 16.5367 13.8607C16.5273 12.8904 15.8711 12.0232 15.0039 11.8779ZM10.3914 15.0513C10.0867 15.3841 9.64606 15.3888 9.33199 15.0654C9.10231 14.831 8.97106 14.4701 8.97106 14.0201C8.98043 13.7154 9.06949 13.3826 9.33199 13.1154C9.64606 12.7919 10.0867 12.7966 10.3914 13.1248C10.8507 13.6216 10.8507 14.5544 10.3914 15.0513ZM14.6523 15.0748C14.3664 15.3701 13.9539 15.3794 13.6492 15.1076C13.1242 14.6294 13.1242 13.5654 13.6492 13.0826C13.9492 12.806 14.3617 12.8154 14.6523 13.1107C14.9195 13.3826 15.0086 13.7248 15.0226 14.0904C15.0086 14.4607 14.9148 14.7982 14.6523 15.0748Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M12 0C5.37188 0 0 5.37188 0 12C0 18.6281 5.37188 24 12 24C18.6281 24 24 18.6281 24 12C24 5.37188 18.6281 0 12 0ZM18.15 13.05C18.0844 13.5844 17.9719 14.1328 17.7797 14.6344C17.2172 16.0734 16.0922 16.8656 14.6016 17.1047C13.7484 17.2406 12.8719 17.2453 11.925 17.3156C11.0766 17.2406 10.1438 17.2313 9.23906 17.0719C7.48594 16.7625 6.29531 15.5344 5.94844 13.7766C5.77031 12.8812 5.71875 11.9813 5.99531 11.0906C6.14062 10.6313 6.37969 10.2234 6.68906 9.85313C6.73125 9.80625 6.76875 9.73594 6.76406 9.675C6.7125 8.86875 6.80625 8.07187 7.04531 7.30312C7.24219 6.66094 7.09688 6.69844 7.80938 6.88594C8.66719 7.11094 9.41719 7.575 10.1531 8.05781C10.2375 8.11406 10.3687 8.1375 10.4719 8.11875C11.5125 7.95938 12.5484 7.95 13.5891 8.13281C13.6641 8.14688 13.7625 8.11875 13.8328 8.07656C14.4656 7.66406 15.1172 7.29375 15.8297 7.03594C16.0875 6.94219 16.3594 6.88125 16.6219 6.80156C16.7391 6.76875 16.7906 6.81094 16.8328 6.92344C17.1516 7.81406 17.2828 8.72812 17.2359 9.67031C17.2313 9.72187 17.2594 9.79219 17.2922 9.83437C18.0938 10.7625 18.2953 11.8687 18.15 13.05Z"
                                    fill="#4B5563"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_3112_1059">
                                    <rect width="24" height="24" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </button>
                          );
                        })()}
                      {candidate.premium_data_availability?.linkedin_url &&
                        (() => {
                          const url = candidate.premium_data_unlocked
                            ? candidate.premium_data?.linkedin_url
                            : null;
                          return (
                            <button
                              className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (url) {
                                  window.open(url, "_blank");
                                } else {
                                  setPendingReveal({
                                    candidateId: candidate.id,
                                    onSuccess: (prem) => {
                                      const finalUrl =
                                        prem.premium_data.linkedin_url;
                                      if (finalUrl)
                                        window.open(finalUrl, "_blank");
                                    },
                                  });
                                  setShowRevealDialog(true);
                                }
                              }}
                              aria-label={`View ${candidate.full_name}'s LinkedIn profile`}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clip-path="url(#clip0_3112_1074)">
                                  <path
                                    d="M12 0C5.37188 0 0 5.37188 0 12C0 18.6281 5.37188 24 12 24C18.6281 24 24 18.6281 24 12C24 5.37188 18.6281 0 12 0ZM8.64375 17.0203H6.30469V9.53437H8.64375V17.0203ZM7.41094 8.59687H7.39219C6.54375 8.59687 5.99531 8.025 5.99531 7.29844C5.99531 6.55781 6.5625 6 7.425 6C8.2875 6 8.81719 6.55781 8.83594 7.29844C8.84062 8.02031 8.29219 8.59687 7.41094 8.59687ZM18 17.0203H15.3469V13.1484C15.3469 12.1359 14.9344 11.4422 14.0203 11.4422C13.3219 11.4422 12.9328 11.9109 12.7547 12.3609C12.6891 12.5203 12.6984 12.7453 12.6984 12.975V17.0203H10.0688C10.0688 17.0203 10.1016 10.1578 10.0688 9.53437H12.6984V10.7109C12.8531 10.1953 13.6922 9.46406 15.0328 9.46406C16.6969 9.46406 18 10.5422 18 12.8578V17.0203Z"
                                    fill="#4B5563"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_3112_1074">
                                    <rect width="24" height="24" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </button>
                          );
                        })()}
                      {candidate.premium_data_availability?.behance_username &&
                        (() => {
                          const url = candidate.premium_data_unlocked
                            ? candidate.premium_data?.behance_username
                            : null;
                          return (
                            <button
                              className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (url) {
                                  window.open(url, "_blank");
                                } else {
                                  setPendingReveal({
                                    candidateId: candidate.id,
                                    onSuccess: (prem) => {
                                      const finalUrl =
                                        prem.premium_data.behance_username;
                                      if (finalUrl)
                                        window.open(finalUrl, "_blank");
                                    },
                                  });
                                  setShowRevealDialog(true);
                                }
                              }}
                              aria-label={`View ${candidate.full_name}'s behance`}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clip-path="url(#clip0_3112_1068)">
                                  <path
                                    d="M16.1305 11.4594C15.9008 11.2625 15.6148 11.1641 15.2773 11.1641C14.9117 11.1641 14.6258 11.2672 14.4195 11.4781C14.218 11.6891 14.0914 11.9703 14.0352 12.3266H16.5055C16.4867 11.9469 16.3555 11.6609 16.1305 11.4594Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M10.0453 12.4703C9.86719 12.3906 9.62344 12.3484 9.30469 12.3438H7.47656V14.3219H9.28125C9.60469 14.3219 9.85313 14.2797 10.0312 14.1906C10.3594 14.0266 10.5187 13.7219 10.5187 13.2672C10.5187 12.8828 10.3594 12.6156 10.0453 12.4703Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M12 0C5.37188 0 0 5.37188 0 12C0 18.6281 5.37188 24 12 24C18.6281 24 24 18.6281 24 12C24 5.37188 18.6281 0 12 0ZM13.6688 8.54531H16.8469V9.46875H13.6688V8.54531ZM11.7516 14.5594C11.6109 14.7891 11.4375 14.9859 11.2266 15.1406C10.9922 15.3234 10.7109 15.4453 10.3875 15.5156C10.0641 15.5813 9.71719 15.6141 9.3375 15.6141H6V8.19844H9.58594C10.4906 8.2125 11.1328 8.475 11.5078 8.99063C11.7328 9.30469 11.8453 9.68437 11.8453 10.125C11.8453 10.575 11.7328 10.9406 11.5031 11.2172C11.3766 11.3719 11.1844 11.5125 10.9359 11.6391C11.3156 11.7797 11.6016 11.9953 11.7938 12.2953C11.9859 12.5953 12.0844 12.9563 12.0844 13.3828C12.0844 13.8141 11.9719 14.2078 11.7516 14.5594ZM18 13.275H14.0062C14.0297 13.8234 14.2172 14.2125 14.5781 14.4328C14.7984 14.5687 15.0609 14.6391 15.3703 14.6391C15.6937 14.6391 15.9609 14.5547 16.1672 14.3859C16.2797 14.2969 16.3781 14.1703 16.4625 14.0062H17.925C17.8875 14.3297 17.7094 14.6625 17.3953 15C16.9031 15.5344 16.2188 15.8016 15.3328 15.8016C14.6016 15.8016 13.9594 15.5766 13.4016 15.1266C12.8438 14.6766 12.5625 13.9453 12.5625 12.9328C12.5625 11.9812 12.8156 11.2547 13.3172 10.7484C13.8234 10.2422 14.475 9.98906 15.2766 9.98906C15.7547 9.98906 16.1859 10.0734 16.5656 10.2469C16.95 10.4156 17.2641 10.6875 17.5125 11.0578C17.7375 11.3812 17.8828 11.7609 17.9484 12.1922C17.9906 12.4406 18.0047 12.8016 18 13.275Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M10.068 10.9375C10.2695 10.8156 10.368 10.5953 10.368 10.2859C10.368 9.93906 10.2367 9.71406 9.96953 9.60156C9.73984 9.52656 9.44922 9.48438 9.09297 9.48438H7.48047V11.1203H9.28047C9.60391 11.125 9.86172 11.0641 10.068 10.9375Z"
                                    fill="#4B5563"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_3112_1068">
                                    <rect width="24" height="24" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </button>
                          );
                        })()}
                      {candidate.premium_data_availability
                        ?.instagram_username &&
                        (() => {
                          const url = candidate.premium_data_unlocked
                            ? candidate.premium_data?.instagram_username
                            : null;
                          return (
                            <button
                              className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (url) {
                                  window.open(url, "_blank");
                                } else {
                                  setPendingReveal({
                                    candidateId: candidate.id,
                                    onSuccess: (prem) => {
                                      const finalUrl =
                                        prem.premium_data.instagram_username;
                                      if (finalUrl)
                                        window.open(finalUrl, "_blank");
                                    },
                                  });
                                  setShowRevealDialog(true);
                                }
                              }}
                              aria-label={`View ${candidate.full_name}'s instagram`}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clip-path="url(#clip0_3112_1076)">
                                  <path
                                    d="M12.813 0.0234375C18.9023 0.0234375 23.8845 5.00561 23.8845 11.0949V12.8247C23.8845 18.9141 18.9023 23.8962 12.813 23.8962H11.0832C4.99389 23.8962 0.0117188 18.9141 0.0117188 12.8247V11.0949C0.0117188 5.00561 4.99389 0.0234375 11.0832 0.0234375H12.813ZM12.1658 6.02364L12.0117 6.02344C10.729 6.02344 9.44636 6.06583 9.44636 6.06583C7.57288 6.06583 6.05412 7.5846 6.05412 9.45807C6.05412 9.45807 6.01518 10.5595 6.01193 11.7417L6.01172 11.8962C6.01172 13.2199 6.05412 14.5888 6.05412 14.5888C6.05412 16.4623 7.57288 17.981 9.44636 17.981C9.44636 17.981 10.6456 18.0234 11.8845 18.0234C13.2082 18.0234 14.6195 17.981 14.6195 17.981C16.493 17.981 17.9693 16.5047 17.9693 14.6312C17.9693 14.6312 18.0117 13.2777 18.0117 11.9811L18.0109 11.6768C18.0052 10.5134 17.9693 9.41565 17.9693 9.41565C17.9693 7.54217 16.493 6.06583 14.6195 6.06583C14.6195 6.06583 13.3983 6.02676 12.1658 6.02364ZM12.0117 7.10341C13.0635 7.10341 14.4121 7.13819 14.4121 7.13819C15.9484 7.13819 16.8969 8.08672 16.8969 9.62298C16.8969 9.62298 16.9317 10.9486 16.9317 11.9886C16.9317 13.0519 16.8969 14.4238 16.8969 14.4238C16.8969 15.9601 15.9484 16.9086 14.4121 16.9086C14.4121 16.9086 13.2195 16.9378 12.1847 16.9427L11.9074 16.9434C10.8915 16.9434 9.65369 16.9086 9.65369 16.9086C8.11745 16.9086 7.1265 15.9176 7.1265 14.3814C7.1265 14.3814 7.09172 13.0045 7.09172 11.9191C7.09172 10.9032 7.1265 9.62298 7.1265 9.62298C7.1265 8.08672 8.11748 7.13819 9.65369 7.13819C9.65369 7.13819 10.9599 7.10341 12.0117 7.10341ZM12.0117 8.94987C10.3142 8.94987 8.93816 10.3259 8.93816 12.0234C8.93816 13.7209 10.3142 15.0969 12.0117 15.0969C13.7092 15.0969 15.0852 13.7209 15.0852 12.0234C15.0852 10.3259 13.7092 8.94987 12.0117 8.94987ZM12.0117 10.0234C13.1163 10.0234 14.0117 10.9188 14.0117 12.0234C14.0117 13.128 13.1163 14.0234 12.0117 14.0234C10.9071 14.0234 10.0117 13.128 10.0117 12.0234C10.0117 10.9188 10.9071 10.0234 12.0117 10.0234ZM15.2323 8.09695C14.8222 8.09695 14.4896 8.4311 14.4896 8.84327C14.4896 9.25545 14.8222 9.58957 15.2323 9.58957C15.6424 9.58957 15.9749 9.25545 15.9749 8.84327C15.9749 8.43107 15.6424 8.09695 15.2323 8.09695Z"
                                    fill="#4B5563"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_3112_1076">
                                    <rect width="24" height="24" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </button>
                          );
                        })()}
                      {candidate.premium_data_availability?.twitter_username &&
                        (() => {
                          const url = candidate.premium_data_unlocked
                            ? candidate.premium_data?.twitter_url
                            : null;
                          return (
                            <button
                              className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (url) {
                                  window.open(url, "_blank");
                                } else {
                                  setPendingReveal({
                                    candidateId: candidate.id,
                                    onSuccess: (prem) => {
                                      const finalUrl =
                                        prem.premium_data.twitter_url;
                                      if (finalUrl)
                                        window.open(finalUrl, "_blank");
                                    },
                                  });
                                  setShowRevealDialog(true);
                                }
                              }}
                              aria-label={`View ${candidate.full_name}'s twitter`}
                            >
                              <svg
                                width="26"
                                height="26"
                                viewBox="0 0 26 26"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M13 25C19.6274 25 25 19.6274 25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25Z"
                                  fill="#4B5563"
                                  stroke="white"
                                  stroke-miterlimit="10"
                                />
                                <path
                                  d="M7.11853 7.47656L11.6695 13.5543L7.08984 18.4958H8.12062L12.1302 14.1693L15.3697 18.4958H18.8772L14.0701 12.0763L18.3328 7.47656H17.302L13.6096 11.461L10.626 7.47656H7.11853ZM8.63432 8.23485H10.2457L17.3612 17.7375H15.7498L8.63432 8.23485Z"
                                  fill="white"
                                />
                              </svg>
                            </button>
                          );
                        })()}
                      {candidate.premium_data_availability?.dribble_username &&
                        (() => {
                          const url = candidate.premium_data_unlocked
                            ? candidate.premium_data?.dribble_username
                            : null;
                          return (
                            <button
                              className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (url) {
                                  window.open(url, "_blank");
                                } else {
                                  setPendingReveal({
                                    candidateId: candidate.id,
                                    onSuccess: (prem) => {
                                      const finalUrl =
                                        prem.premium_data.dribble_username;
                                      if (finalUrl)
                                        window.open(finalUrl, "_blank");
                                    },
                                  });
                                  setShowRevealDialog(true);
                                }
                              }}
                              aria-label={`View ${candidate.full_name}'s dribble`}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clip-path="url(#clip0_3112_1084)">
                                  <path
                                    d="M11.7141 10.3203C10.8281 8.74531 9.88125 7.46094 9.81094 7.36719C8.38125 8.04219 7.31719 9.35937 6.98438 10.9437C7.12031 10.9484 9.25781 10.9766 11.7141 10.3203Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M12.3547 12.0344C12.4203 12.0109 12.4906 11.9922 12.5563 11.9734C12.4297 11.6828 12.2891 11.3875 12.1391 11.1016C9.5 11.8891 6.96875 11.8328 6.87969 11.8328C6.87969 11.8844 6.875 11.9406 6.875 11.9922C6.875 13.3094 7.37188 14.5094 8.1875 15.4188V15.4141C8.1875 15.4141 9.58906 12.9297 12.3547 12.0344Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M8.80859 16.0094C8.78516 15.9906 8.76172 15.9719 8.73828 15.9531C8.76641 15.9719 8.78984 15.9953 8.80859 16.0094Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M10.7727 7.02344C10.768 7.02344 10.7633 7.02813 10.7539 7.02813C10.768 7.02813 10.7727 7.02813 10.7727 7.02344C10.7727 7.02813 10.7727 7.02813 10.7727 7.02344Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M15.3828 8.15469C14.4781 7.35781 13.2969 6.875 11.9984 6.875C11.5813 6.875 11.1781 6.92656 10.7891 7.02031C10.8641 7.12344 11.8297 8.39844 12.7063 10.0109C14.6375 9.28437 15.3688 8.17344 15.3828 8.15469Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M12.8711 12.8422C9.83359 13.9016 8.84922 16.0438 8.84922 16.0438C8.84922 16.0438 8.84453 16.0391 8.83984 16.0344C9.71172 16.7187 10.8086 17.1266 11.9992 17.1266C12.707 17.1266 13.3867 16.9812 14.0008 16.7188C13.9258 16.2687 13.6258 14.7031 12.9086 12.8281C12.8945 12.8328 12.8805 12.8375 12.8711 12.8422Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M12 0C5.37188 0 0 5.37188 0 12C0 18.6281 5.37188 24 12 24C18.6281 24 24 18.6281 24 12C24 5.37188 18.6281 0 12 0ZM17.8781 13.2094C17.7984 13.5937 17.6812 13.9734 17.5266 14.3344C17.3766 14.6906 17.1891 15.0328 16.9734 15.3563C16.7578 15.675 16.5141 15.9703 16.2422 16.2422C15.9703 16.5141 15.6703 16.7578 15.3563 16.9734C15.0375 17.1891 14.6906 17.3766 14.3391 17.5266C13.9781 17.6813 13.5984 17.7984 13.2094 17.8781C12.8156 17.9578 12.4078 18 12 18C11.5922 18 11.1844 17.9578 10.7906 17.8781C10.4062 17.7984 10.0266 17.6813 9.66562 17.5266C9.30937 17.3766 8.96719 17.1891 8.64844 16.9734C8.32969 16.7578 8.03438 16.5141 7.7625 16.2422C7.49063 15.9703 7.24687 15.6703 7.03125 15.3563C6.81563 15.0375 6.62812 14.6906 6.47812 14.3344C6.32344 13.9734 6.20625 13.5937 6.12656 13.2094C6.04688 12.8156 6.00469 12.4078 6.00469 12C6.00469 11.5922 6.04688 11.1844 6.12656 10.7906C6.20625 10.4063 6.32344 10.0266 6.47812 9.66094C6.62812 9.30469 6.81563 8.9625 7.03125 8.64375C7.24687 8.325 7.49063 8.02969 7.7625 7.75781C8.03438 7.48594 8.33438 7.2375 8.64844 7.02656C8.96719 6.81094 9.31406 6.62344 9.66562 6.47344C10.0266 6.31875 10.4062 6.20156 10.7906 6.12188C11.1844 6.04219 11.5922 6 12 6C12.4078 6 12.8109 6.04219 13.2094 6.12188C13.5937 6.20156 13.9734 6.31875 14.3391 6.47344C14.6953 6.62344 15.0375 6.81094 15.3563 7.02656C15.675 7.24219 15.9703 7.48594 16.2422 7.75781C16.5141 8.02969 16.7578 8.32969 16.9734 8.64375C17.1891 8.9625 17.3766 9.30469 17.5266 9.66094C17.6812 10.0219 17.7984 10.4016 17.8781 10.7906C17.9578 11.1844 18 11.5922 18 12C18 12.4078 17.9578 12.8156 17.8781 13.2094Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M13.1016 10.775C13.2187 11.0187 13.3359 11.2672 13.4438 11.5203C13.4813 11.6094 13.5187 11.6984 13.5562 11.7828C15.3187 11.5625 17.0531 11.9328 17.1234 11.9516C17.1094 10.7375 16.6781 9.62188 15.9562 8.75C15.9469 8.76406 15.1266 9.95 13.1016 10.775Z"
                                    fill="#4B5563"
                                  />
                                  <path
                                    d="M13.8672 12.5915C14.5375 14.4384 14.8141 15.9431 14.8656 16.2524C16.0141 15.4743 16.8344 14.2462 17.0641 12.8165C16.9562 12.779 15.5219 12.3243 13.8672 12.5915Z"
                                    fill="#4B5563"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_3112_1084">
                                    <rect width="24" height="24" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            </button>
                          );
                        })()}
                      {candidate.premium_data_availability?.resume_url &&
                        (() => {
                          const url = candidate.premium_data_unlocked
                            ? candidate.premium_data?.resume_url
                            : null;
                          return (
                            <button
                              className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (url) {
                                  window.open(url, "_blank");
                                } else {
                                  setPendingReveal({
                                    candidateId: candidate.id,
                                    onSuccess: (prem) => {
                                      const finalUrl =
                                        prem.premium_data.resume_url;
                                      if (finalUrl)
                                        window.open(finalUrl, "_blank");
                                    },
                                  });
                                  setShowRevealDialog(true);
                                }
                              }}
                              aria-label={`View ${candidate.full_name}'s resume`}
                            >
                              <svg
                                width="26"
                                height="26"
                                viewBox="0 0 26 26"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M13 25C19.6274 25 25 19.6274 25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25Z"
                                  fill="#4B5563"
                                  stroke="white"
                                  stroke-miterlimit="10"
                                />
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M12.4333 7.53906H13.5051C14.4373 7.53905 15.1757 7.53905 15.7535 7.61663C16.3483 7.69647 16.8296 7.8647 17.2093 8.24377C17.5889 8.62284 17.7573 9.10351 17.8373 9.69737C17.915 10.2744 17.915 11.0117 17.915 11.9426V14.0259C17.915 14.9568 17.915 15.6941 17.8373 16.2711C17.7573 16.865 17.5889 17.3457 17.2093 17.7247C16.8296 18.1038 16.3483 18.272 15.7535 18.3519C15.1757 18.4294 14.4373 18.4294 13.5051 18.4294H12.4333C11.5011 18.4294 10.7627 18.4294 10.1849 18.3519C9.59014 18.272 9.10877 18.1038 8.72916 17.7247C8.34954 17.3457 8.18107 16.865 8.10112 16.2711C8.02342 15.6941 8.02343 14.9568 8.02344 14.0259V11.9426C8.02343 11.0117 8.02342 10.2744 8.10112 9.69737C8.18107 9.10351 8.34954 8.62284 8.72916 8.24377C9.10877 7.8647 9.59014 7.69647 10.1849 7.61663C10.7627 7.53905 11.5011 7.53905 12.4333 7.53906ZM10.2862 8.36965C9.77589 8.43816 9.48186 8.56665 9.26718 8.78102C9.05251 8.99539 8.92383 9.289 8.85522 9.79861C8.78513 10.3191 8.78433 11.0053 8.78433 11.9712V13.9973C8.78433 14.9631 8.78513 15.6493 8.85522 16.1699C8.92383 16.6795 9.05251 16.9731 9.26718 17.1875C9.48186 17.4018 9.77589 17.5303 10.2862 17.5988C10.8075 17.6688 11.4947 17.6696 12.4619 17.6696H13.4765C14.4437 17.6696 15.1309 17.6688 15.6522 17.5988C16.1625 17.5303 16.4566 17.4018 16.6712 17.1875C16.8859 16.9731 17.0146 16.6795 17.0832 16.1699C17.1533 15.6493 17.1541 14.9631 17.1541 13.9973V11.9712C17.1541 11.0053 17.1533 10.3191 17.0832 9.79861C17.0146 9.289 16.8859 8.99539 16.6712 8.78102C16.4566 8.56665 16.1625 8.43816 15.6522 8.36965C15.1309 8.29966 14.4437 8.29886 13.4765 8.29886H12.4619C11.4947 8.29886 10.8075 8.29966 10.2862 8.36965ZM10.5597 11.9712C10.5597 11.7614 10.7301 11.5913 10.9402 11.5913H14.9982C15.2083 11.5913 15.3787 11.7614 15.3787 11.9712C15.3787 12.181 15.2083 12.3511 14.9982 12.3511H10.9402C10.7301 12.3511 10.5597 12.181 10.5597 11.9712ZM10.5597 13.9973C10.5597 13.7875 10.7301 13.6174 10.9402 13.6174H13.4765C13.6866 13.6174 13.8569 13.7875 13.8569 13.9973C13.8569 14.2071 13.6866 14.3772 13.4765 14.3772H10.9402C10.7301 14.3772 10.5597 14.2071 10.5597 13.9973Z"
                                  fill="white"
                                />
                              </svg>
                            </button>
                          );
                        })()}
                      {candidate.premium_data_availability?.portfolio_url &&
                        (() => {
                          const url = candidate.premium_data_unlocked
                            ? candidate.premium_data?.portfolio_url
                            : null;
                          return (
                            <button
                              className=" text-gray-400 bg-[#F0F0F0] hover:text-gray-600 hover:bg-gray-100 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (url) {
                                  window.open(url, "_blank");
                                } else {
                                  setPendingReveal({
                                    candidateId: candidate.id,
                                    onSuccess: (prem) => {
                                      const finalUrl =
                                        prem.premium_data?.portfolio_url;
                                      if (finalUrl)
                                        window.open(finalUrl, "_blank");
                                    },
                                  });
                                  setShowRevealDialog(true);
                                }
                              }}
                              aria-label={`View ${candidate.full_name}'s portfolio`}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM7.98 15.324C7.848 15.684 7.5 15.912 7.14 15.912C7.032 15.912 6.936 15.9 6.828 15.852C5.856 15.492 5.04 14.784 4.524 13.86C3.324 11.7 4.068 8.88 6.168 7.572L8.976 5.832C10.008 5.196 11.22 5.004 12.372 5.304C13.524 5.604 14.496 6.36 15.084 7.416C16.284 9.576 15.54 12.396 13.44 13.704L13.128 13.932C12.72 14.22 12.156 14.124 11.868 13.728C11.58 13.32 11.676 12.756 12.072 12.468L12.444 12.204C13.788 11.364 14.244 9.624 13.512 8.292C13.164 7.668 12.6 7.224 11.928 7.044C11.256 6.864 10.548 6.972 9.936 7.356L7.104 9.108C5.808 9.912 5.352 11.652 6.084 12.996C6.384 13.536 6.864 13.956 7.44 14.172C7.908 14.34 8.148 14.856 7.98 15.324ZM17.904 16.38L15.096 18.12C14.388 18.564 13.596 18.78 12.792 18.78C12.432 18.78 12.06 18.732 11.7 18.636C10.548 18.336 9.576 17.58 9 16.524C7.8 14.364 8.544 11.544 10.644 10.236L10.956 10.008C11.364 9.72 11.928 9.816 12.216 10.212C12.504 10.62 12.408 11.184 12.012 11.472L11.64 11.736C10.296 12.576 9.84 14.316 10.572 15.648C10.92 16.272 11.484 16.716 12.156 16.896C12.828 17.076 13.536 16.968 14.148 16.584L16.956 14.844C18.252 14.04 18.708 12.3 17.976 10.956C17.676 10.416 17.196 9.996 16.62 9.78C16.152 9.612 15.912 9.096 16.092 8.628C16.26 8.16 16.788 7.92 17.244 8.1C18.216 8.46 19.032 9.168 19.548 10.092C20.736 12.252 20.004 15.072 17.904 16.38Z"
                                  fill="#4B5563"
                                />
                              </svg>
                            </button>
                          );
                        })()}
                    </div>
                    {/* <div className="rounded-md flex space-x-1 border border-blue-400 hover:border-blue-600 transition-colors">
                      {(() => {
                        const isInbound = activeTab === "inbound";
                        const codingRoundStage = pipelineStages.find(
                          (stage) => stage.slug === "coding-contest"
                        );

                        // For inbound: default action is "Send Coding Round" (targets the coding-contest stage if it exists)
                        // For other tabs: keep existing behavior (hardcoded stage 3882)
                        const defaultStageId = isInbound
                          ? codingRoundStage?.id ?? undefined
                          : 3882;

                        const buttonText = isInbound
                          ? codingRoundStage
                            ? "Send Coding Round"
                            : "Add to Pipeline" // fallback text if coding stage missing
                          : "Save to Pipeline";

                        const stagesToShow = getStagesToShow(isInbound);

                        return (
                          <>
                      <button
                        className="pl-3 pr-2 py-1.5 text-blue-600 text-sm font-medium flex items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveToPipeline(candidate.id, defaultStageId);
                        }}
                        aria-label={`${buttonText} for ${candidate.full_name}`}
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
                          className="text-[#0F47F2] mr-2"
                        >
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                        Save to Pipeline
                      </button>
                      <div className="w-px bg-blue-500 my-1"></div>
                      <div className="relative">
                        <button
                          className="pl-1.5 pr-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
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
                              {stagesToShow.map((stage) => (
                                <button
                                  key={stage.id}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveToPipeline(candidate.id, stage.id);
                                  }}
                                  aria-label={`Add ${candidate.full_name} to ${getStageDisplayName(stage)} stage`}
                                >
                                  {getStageDisplayName(stage)}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      </>
                      );
                    })()}
                    </div> */}
                    // Update the button logic as follows:
                    <div className="rounded-md flex space-x-1 border border-blue-400 hover:border-blue-600 transition-colors">
                      {(() => {
                        const shortlistedStage = pipelineStages.find(
                          (stage) => stage.slug === "shortlisted"
                        );

                        const defaultStageId =
                          shortlistedStage?.id ?? undefined;

                        const buttonText = shortlistedStage
                          ? "Save to Shortlisted"
                          : "Add to Pipeline"; // fallback text if shortlisted stage missing

                        return (
                          <button
                            className="pl-3 pr-2 py-1.5 text-blue-600 text-sm font-medium flex items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveToPipeline(
                                candidate.id,
                                defaultStageId
                              );
                            }}
                            aria-label={`${buttonText} for ${candidate.full_name}`}
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
                              className="text-[#0F47F2] mr-2"
                            >
                              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                            </svg>
                            {buttonText}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {totalPages >= 1 ? (
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400 lg:text-base font-[400]">
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
            <div className="text-xs text-gray-400 lg:text-base font-[400]">
              Showing {startIndex} to{" "}
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
