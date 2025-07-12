import React, { useState } from 'react';
import { Filter, ChevronDown, MapPin, Bookmark, Eye, Star, Link, File, Github, Linkedin, Twitter, EyeOff, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Candidate } from '../data/candidates';

interface CandidatesMainProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCandidate: Candidate | null;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  searchTerm: string;
  candidates: Candidate[];
  onPipelinesClick?: () => void;
}

const CandidatesMain: React.FC<CandidatesMainProps> = ({
  activeTab,
  setActiveTab,
  selectedCandidate,
  setSelectedCandidate,
  searchTerm,
  candidates,
  onPipelinesClick
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 5;

  const tabs = [
    { id: 'outbound', label: 'Outbound', count: candidates.length },
    { id: 'active', label: 'Active', count: 2034 },
    { id: 'inbound', label: 'Inbound', count: 2034 },
    { id: 'prevetted', label: 'Prevetted', count: 2034 }
  ];

  const handleCandidateSelect = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.currentRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIndex = (currentPage - 1) * candidatesPerPage;
  const endIndex = startIndex + candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedCandidate(null); // Clear selection when changing pages
  };

  const getAvatarColor = (name: string) => {
    return 'bg-blue-500'; // Single blue color for all profiles
  };

  const getStarCount = (skill) => {
    const sum = skill.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (sum % 5) + 1; // Returns a number between 1 and 5
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-3 lg:p-4 pb-0">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count && (
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

      {/* Filters Bar */}
      <div className="p-3 lg:p-4 border-b border-gray-200">
        <div className="mt-0 flex items-center justify-between flex-wrap gap-2">
          <div className="flex space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => setSelectAll(e.target.checked)}
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

      {/* Candidates List */}
      <div className="divide-y divide-gray-200">
        {currentCandidates.map((candidate) => (
          <div 
            key={candidate.id} 
            className={`p-3 lg:p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
              selectedCandidate?.id === candidate.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
            onClick={() => setSelectedCandidate(candidate)}
          >
            <div className="flex items-center space-x-3 border-b pb-4">
              <input
                type="checkbox"
                checked={selectedCandidates.includes(candidate.id)}
                onChange={() => handleCandidateSelect(candidate.id)}
                className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mt-1"
                onClick={(e) => e.stopPropagation()}
              />
              
              <div className={`w-14 h-14 ${getAvatarColor(candidate.name)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                {candidate.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-base font-semibold text-gray-900">{candidate.name}</h3>
                    {candidate.verified && (
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
                                stroke: 'none',
                                strokeWidth: 0,
                                strokeDasharray: 'none',
                                strokeLinecap: 'butt',
                                strokeLinejoin: 'miter',
                                strokeMiterlimit: 10,
                                fill: 'none',
                                fillRule: 'nonzero',
                                opacity: 1,
                              }}
                            >
                              <polygon
                                points="45,6.18 57.06,0 64.41,11.38 77.94,12.06 78.62,25.59 90,32.94 83.82,45 90,57.06 78.62,64.41 77.94,77.94 64.41,78.62 57.06,90 45,83.82 32.94,90 25.59,78.62 12.06,77.94 11.38,64.41 0,57.06 6.18,45 0,32.94 11.38,25.59 12.06,12.06 25.59,11.38 32.94,0"
                                style={{
                                  stroke: 'none',
                                  strokeWidth: 1,
                                  strokeDasharray: 'none',
                                  strokeLinecap: 'butt',
                                  strokeLinejoin: 'miter',
                                  strokeMiterlimit: 10,
                                  fill: 'rgb(0,150,241)',
                                  fillRule: 'nonzero',
                                  opacity: 1,
                                }}
                                transform="matrix(1 0 0 1 0 0)"
                              />
                              <polygon
                                points="40.16,58.47 26.24,45.08 29.7,41.48 40.15,51.52 61.22,31.08 64.7,34.67"
                                style={{
                                  stroke: 'none',
                                  strokeWidth: 1,
                                  strokeDasharray: 'none',
                                  strokeLinecap: 'butt',
                                  strokeLinejoin: 'miter',
                                  strokeMiterlimit: 10,
                                  fill: 'rgb(255,255,255)',
                                  fillRule: 'nonzero',
                                  opacity: 1,
                                }}
                                transform="matrix(1 0 0 1 0 0)"
                              />
                            </g>
                          </svg>
                        </span>
                      </div>
                    )}
                    <span className={`mt-1 px-2 py-1 text-xs rounded-full ${
                      candidate.status === 'Available' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      2+ years exp
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Github className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <File className="w-4 h-4" />
                    </button>
                    
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Link  className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <p className="text-sm text-gray-600 mt-1">{candidate.company} |</p>
                  <p className="text-sm text-gray-600 mt-1">{candidate.currentRole} |</p>
                  <p className="text-sm text-gray-600 mt-1">{candidate.skillLevel}</p>
                </div>

                <div className="flex space-x-1">
                  <p className="flex text-sm text-gray-600 mt-1">
                    <MapPin className="mt-1 w-4 h-3 ml-[-3px]"/>
                    {candidate.city} 
                  </p>
                  {/* <p className="text-sm text-gray-600 mt-1">{candidate.lastActive}</p> */}
                </div>
              </div>
            </div>

            <div className="p-3 lg:pl-8 lg:py-4 bg-gradient-to-r from-gray-100 via-white to-white">
              <div className="mt-2 grid grid-cols-1 gap-2 text-sm ml-1">
                <div className="flex justify-between">
                  <div className="flex space-x-12">
                    <span className="text-gray-500">Experience</span>
                    <p className="text-gray-900">{candidate.currentRole}</p>
                  </div> 
                  <p className="text-gray-900">{candidate.experience}</p>
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-12">
                    <span className="text-gray-500 mr-[5px]">Education</span>
                    <p className="text-gray-900 truncate">{candidate.education}</p>
                  </div>
                  <p className="text-gray-900 truncate">2016-2020</p>
                </div>
                <div className="flex space-x-6">
                    <span className="text-gray-500 mr-[5px]">Notice Period</span>
                  <p className="text-gray-900">{candidate.noticePeriod}</p>
                </div>
              </div>
            
              <div className="mt-3 flex items-center justify-between space-x-2 flex-wrap gap-2">
                <div className="mt-3 flex flex-wrap gap-1">
                  {candidate.skills.slice(0,3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {skill}
                      {Array.from({ length: getStarCount(skill) }).map((_, i) => (
                        <Star key={i} size={11} className="inline-block ml-1 mb-1 text-blue-600 text-[3px]" />
                      ))}
                    </span>
                  ))}
                </div>
                
                <div className="rounded-md flex space-x-2 rounde-lg border border-blue-400 hover:border-blue-600 transition-colors">
                  <button className="pl-3 pr-2 py-1.5 bg-white text-blue-600 text-sm font-medium  flex items-center rounded-md">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 lg:p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredCandidates.length)} of {filteredCandidates.length} candidates
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
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