import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { candidateService, CandidateListItem } from "../services/candidateService";

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
  onCandidatesUpdate: (candidates: CandidateListItem[], totalCount: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
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
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const candidatesPerPage = 20;
  const maxVisiblePages = 5;

  const tabs = [
    { id: "outbound", label: "Outbound", count: activeTab === "outbound" ? totalCount : 0 },
    { id: "active", label: "Active", count: activeTab === "active" ? totalCount : 0 },
    { id: "inbound", label: "Inbound", count: activeTab === "inbound" ? totalCount : 0 },
    { id: "prevetted", label: "Prevetted", count: activeTab === "prevetted" ? totalCount : 0 },
  ];

  useEffect(() => {
    setTotalPages(Math.ceil(totalCount / candidatesPerPage) || 1);
    if (currentPage > Math.ceil(totalCount / candidatesPerPage)) {
      setCurrentPage(1);
    }
  }, [totalCount, currentPage, setCurrentPage]);

  const handleCandidateSelect = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const currentCandidates = candidates.slice(
        (currentPage - 1) * candidatesPerPage,
        currentPage * candidatesPerPage
      );
      setSelectedCandidates(currentCandidates.map((candidate) => candidate.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCandidateClick = async (candidate: CandidateListItem) => {
    setSelectedCandidate(candidate);
    await deductCredits();
  };

  const getAvatarColor = (name: string) => "bg-blue-500";

  const getStarCount = (skill: string) => {
    const sum = skill.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
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

  const startIndex = (currentPage - 1) * candidatesPerPage;
  const endIndex = Math.min(startIndex + candidatesPerPage, candidates.length);
  const currentCandidates = candidates.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-3 lg:p-4 pb-0">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div>
              <button
                onClick={onPipelinesClick}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                Pipelines
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 lg:p-4 border-b border-gray-200">
          <div className="mt-0 flex items-center justify-between flex-wrap gap-2">
            <div className="flex space-x-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-500 border-gray-400 rounded focus:ring-blue-600"
                />
                <span className="ml-2 text-sm text-gray-600">Select all</span>
              </label>
              <button className="px-1.5 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors flex items-center">
                Add To Pipeline
              </button>
              <button className="px-1.5 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors flex items-center">
                Export Candidates
              </button>
            </div>
            <div className="flex space-x-2">
              <button className="px-1.5 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors flex items-center">
                Sort By - <span className="text-blue-600 font-semibold ml-1 mr-1">Relevance</span>
                <ChevronDown className="w-4 h-4 mt-1" />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading candidates...</p>
        </div>
        <div className="p-3 lg:p-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, totalCount)} of {totalCount} candidates
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && handlePageChange(page)}
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
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!candidates.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between p-3 lg:p-4 pb-0">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div>
              <button
                onClick={onPipelinesClick}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                Pipelines
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 lg:p-4 border-b border-gray-200">
          <div className="mt-0 flex items-center justify-between flex-wrap gap-2">
            <div className="flex space-x-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-500 border-gray-400 rounded focus:ring-blue-600"
                />
                <span className="ml-2 text-sm text-gray-600">Select all</span>
              </label>
              <button className="px-1.5 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors flex items-center">
                Add To Pipeline
              </button>
              <button className="px-1.5 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors flex items-center">
                Export Candidates
              </button>
            </div>
            <div className="flex space-x-2">
              <button className="px-1.5 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors flex items-center">
                Sort By - <span className="text-blue-600 font-semibold ml-1 mr-1">Relevance</span>
                <ChevronDown className="w-4 h-4 mt-1" />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-base font-medium">No candidates found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search term.</p>
        </div>
        <div className="p-3 lg:p-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing 0 to 0 of {totalCount} candidates
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && handlePageChange(page)}
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
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-3 lg:p-4 pb-0">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div>
            <button
              onClick={onPipelinesClick}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              Pipelines
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 lg:p-4 border-b border-gray-200">
        <div className="mt-0 flex items-center justify-between flex-wrap gap-2">
          <div className="flex space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-500 border-gray-400 rounded focus:ring-blue-600"
              />
              <span className="ml-2 text-sm text-gray-600">Select all</span>
            </label>
            <button className="px-1.5 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors flex items-center">
              Add To Pipeline
            </button>
            <button className="px-1.5 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors flex items-center">
              Export Candidates
            </button>
          </div>
          <div className="flex space-x-2">
            <button className="px-1.5 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-400 hover:border-blue-600 transition-colors flex items-center">
              Sort By - <span className="text-blue-600 font-semibold ml-1 mr-1">Relevance</span>
              <ChevronDown className="w-4 h-4 mt-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {currentCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className={`p-3 lg:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
              selectedCandidate?.id === candidate.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
            }`}
            onClick={() => handleCandidateClick(candidate)}
          >
            <div className="flex items-center space-x-3 border-b pb-4">
              <input
                type="checkbox"
                checked={selectedCandidates.includes(candidate.id)}
                onChange={() => handleCandidateSelect(candidate.id)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mt-1"
                onClick={(e) => e.stopPropagation()}
              />
              <div className={`w-14 h-14 ${getAvatarColor(candidate.full_name)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                {candidate.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-900">{candidate.full_name}</h3>
                    {candidate.is_background_verified && (
                      <div className="flex space-x-1">
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
                      </div>
                    )}
                    <span
                      className={`mt-1 px-2 py-1 text-xs rounded-full ${
                        candidate.experience_years?.includes("Available") ? "bg-blue-100 text-blue-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {candidate.experience_years}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {candidate.social_links?.github && (
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => window.open(candidate.social_links?.github, "_blank")}
                      >
                        <Github className="w-4 h-4" />
                      </button>
                    )}
                    {candidate.social_links?.linkedin && (
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => window.open(candidate.social_links?.linkedin, "_blank")}
                      >
                        <Linkedin className="w-4 h-4" />
                      </button>
                    )}
                    {candidate.social_links?.resume && (
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => window.open(candidate.social_links?.resume, "_blank")}
                      >
                        <File className="w-4 h-4" />
                      </button>
                    )}
                    {candidate.social_links?.portfolio && (
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => window.open(candidate.social_links?.portfolio, "_blank")}
                      >
                        <Link className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <p className="text-sm text-gray-600 mt-1 max-w-[58ch] truncate">
                    {candidate.headline} |
                  </p>
                </div>
                <div className="flex space-x-1">
                  <p className="flex text-sm text-gray-600 mt-1">
                    <MapPin className="mt-1 w-4 h-3 ml-[-3px]" />
                    {candidate.location?.split(",")[0]}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 lg:pl-8 lg:py-4 bg-gradient-to-r from-gray-100 via-white to-white">
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm ml-1">
                <div className="flex justify-between">
                  <div className="flex space-x-12">
                    <span className="text-gray-500">Experience</span>
                    <p className="text-gray-900 max-w-[58ch] truncate">{candidate.experience_summary?.title}</p>
                  </div>
                  <p className="text-gray-900 truncate">{candidate.experience_summary?.date_range}</p>
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-12">
                    <span className="text-gray-500 mr-[5px]">Education</span>
                    <p className="text-gray-900 max-w-[58ch] truncate">{candidate.education_summary?.title}</p>
                  </div>
                  <p className="text-gray-900 truncate">{candidate.education_summary?.date_range}</p>
                </div>
                <div className="flex space-x-6">
                  <span className="text-gray-500 mr-[5px]">Notice Period</span>
                  <p className="text-gray-900">{candidate.notice_period_summary}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between space-x-2 flex-wrap gap-2">
                <div className="mt-3 flex flex-wrap gap-1">
                  {candidate.skills_list?.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {skill}
                      {Array.from({ length: getStarCount(skill) }).map((_, i) => (
                        <Star key={i} size={11} className="inline-block ml-1 mb-1 text-blue-600" />
                      ))}
                    </span>
                  ))}
                </div>
                <div className="rounded-md flex space-x-2 rounde-lg border border-blue-400 hover:border-blue-600 transition-colors">
                  <button className="pl-3 pr-2 py-1.5 bg-white text-blue-600 text-sm font-medium flex items-center rounded-md">
                    <Bookmark className="w-4 h-4 mr-1" />
                    Save to Pipeline
                  </button>
                  <button className="border-l border-l-blue-400 pl-1.5 pr-2 py-1.5">
                    <ChevronDown className="w-4 h-4 ml-1 mt-[2px] text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, totalCount)+startIndex} of {totalCount} candidates
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
                  onClick={() => typeof page === "number" && handlePageChange(page)}
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