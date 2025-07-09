import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, MessageCircle, Mail, Twitter, Github, Linkedin, FileText, MapPin, User, ChevronRight, Building2, GraduationCap, Award, Star } from 'lucide-react';
import { PipelineCandidate, pipelineCandidates } from '../data/pipelineData';
import { showToast } from '../utils/toast';

interface SharePipelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobRole: string;
}

interface DraggedCandidate {
  candidate: PipelineCandidate;
  fromStage: string;
}

const SharePipelinesModal: React.FC<SharePipelinesModalProps> = ({ isOpen, onClose, jobRole }) => {
  const [draggedCandidate, setDraggedCandidate] = useState<DraggedCandidate | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    candidate: PipelineCandidate;
    fromStage: string;
    toStage: string;
    isMovingForward: boolean;
  } | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<PipelineCandidate | null>(null);
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('profile');

  const shareableStages = ['Shortlisted', 'First Interview', 'Other Interviews', 'HR Round', 'Salary Negotiation', 'Offer Sent', 'Archives'];
  
  const stageOrder = {
    'Shortlisted': 0,
    'First Interview': 1,
    'Other Interviews': 2,
    'HR Round': 3,
    'Salary Negotiation': 4,
    'Offer Sent': 5,
    'Archives': 6
  };

  const handleDragStart = (candidate: PipelineCandidate, fromStage: string) => {
    setDraggedCandidate({ candidate, fromStage });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toStage: string) => {
    e.preventDefault();
    if (!draggedCandidate) return;

    const { candidate, fromStage } = draggedCandidate;
    
    if (fromStage === toStage) {
      setDraggedCandidate(null);
      return;
    }

    const fromOrder = stageOrder[fromStage];
    const toOrder = stageOrder[toStage];
    const isMovingForward = toOrder > fromOrder;

    setFeedbackData({
      candidate,
      fromStage,
      toStage,
      isMovingForward
    });
    setShowFeedbackModal(true);
    setDraggedCandidate(null);
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackData || !feedbackComment.trim()) {
      showToast.error('Please enter a comment');
      return;
    }

    // Here you would update the candidate's stage in your data
    showToast.success(`${feedbackData.candidate.fullName} moved to ${feedbackData.toStage}`);
    
    setShowFeedbackModal(false);
    setFeedbackData(null);
    setFeedbackComment('');
  };

  const handleCandidateClick = (candidate: PipelineCandidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateProfile(true);
    setActiveProfileTab('profile');
  };

  const handleShare = (platform: string) => {
    showToast.success(`Pipeline shared on ${platform}`);
  };

  const renderCandidateCard = (candidate: PipelineCandidate, stage: string) => (
    <div
      key={candidate.id}
      draggable
      onDragStart={() => handleDragStart(candidate, stage)}
      className="bg-white border border-gray-200 rounded-lg p-3 mb-3 cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {candidate.firstName[0]}{candidate.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => handleCandidateClick(candidate)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 text-left"
          >
            {candidate.fullName}
          </button>
          <p className="text-xs text-gray-600 truncate">
            {candidate.positions[0]?.companyName} | {candidate.positions[0]?.title}
          </p>
          <p className="text-xs text-gray-500 flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {candidate.location.city}, {candidate.location.country}
          </p>
          
          {/* Notes */}
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Notes:</p>
            <p className="text-xs text-gray-700 bg-gray-50 rounded p-1">
              {candidate.stageData[stage.toLowerCase().replace(' ', '')]?.notes?.[0] || 
               candidate.stageData[stage.toLowerCase().replace(/\s+/g, '')]?.interviewNotes?.[0] || 
               'No notes available'}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-2 mt-2">
            <Github className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
            <Linkedin className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-pointer" />
            <FileText className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
            <Twitter className="w-4 h-4 text-gray-400 hover:text-blue-400 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCandidateProfile = () => {
    if (!selectedCandidate) return null;

    const profileTabs = [
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'experience', label: 'Experience', icon: Building2 },
      { id: 'education', label: 'Education', icon: GraduationCap },
      { id: 'skills', label: 'Skills', icon: Star },
      { id: 'certifications', label: 'Certifications', icon: Award }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Candidate Profile</h3>
            <button
              onClick={() => setShowCandidateProfile(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {profileTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProfileTab(tab.id)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeProfileTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeProfileTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {selectedCandidate.firstName[0]}{selectedCandidate.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCandidate.fullName}</h2>
                    <p className="text-gray-600">{selectedCandidate.positions[0]?.companyName} | {selectedCandidate.positions[0]?.title}</p>
                    <p className="text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedCandidate.location.city}, {selectedCandidate.location.country}
                    </p>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Move to Next Round
                </button>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700">{selectedCandidate.summary}</p>
                </div>
              </div>
            )}

            {activeProfileTab === 'experience' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Experience</h3>
                {selectedCandidate.positions.map((position, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 relative">
                    <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                    <h4 className="font-medium text-gray-900">{position.title}</h4>
                    <p className="text-gray-600">{position.companyName}</p>
                    <p className="text-gray-500">{position.startDate.month}/{position.startDate.year} - {position.isCurrent ? 'Present' : `${position.endDate?.month}/${position.endDate?.year}`}</p>
                    <p className="text-gray-700 mt-1">{position.description}</p>
                  </div>
                ))}
              </div>
            )}

            {activeProfileTab === 'education' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Education</h3>
                {selectedCandidate.educations.map((education, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 relative">
                    <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                    <h4 className="font-medium text-gray-900">{education.degreeName}</h4>
                    <p className="text-gray-600">{education.schoolName}</p>
                    <p className="text-gray-500">{education.fieldOfStudy}</p>
                    <p className="text-gray-500">{education.startDate.year} - {education.endDate.year}</p>
                  </div>
                ))}
              </div>
            )}

            {activeProfileTab === 'skills' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill.name} ({skill.endorsementCount} endorsements)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeProfileTab === 'certifications' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Certifications</h3>
                {selectedCandidate.certifications.length > 0 ? (
                  selectedCandidate.certifications.map((cert, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 relative">
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-gray-600">{cert.authority}</p>
                      <p className="text-gray-500">{cert.startDate.month}/{cert.startDate.year}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No certifications available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{jobRole}'s Pipelines</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Share on:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleShare('WhatsApp')}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare('Email')}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare('Twitter')}
                  className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare('More')}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="p-6 overflow-x-auto">
            <div className="flex space-x-4 min-w-max">
              {shareableStages.map((stage) => {
                const stageCandidates = pipelineCandidates[stage] || [];
                return (
                  <div
                    key={stage}
                    className="w-80 bg-gray-50 rounded-lg p-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage)}
                  >
                    {/* Stage Header */}
                    <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
                      <h3 className="font-semibold text-gray-900 text-center">{stage}</h3>
                      <p className="text-sm text-gray-500 text-center">{stageCandidates.length} candidates</p>
                    </div>

                    {/* Candidates List */}
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {stageCandidates.map((candidate) => renderCandidateCard(candidate, stage))}
                      {stageCandidates.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No candidates in this stage</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && feedbackData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-end">
          <div className="bg-white h-full w-96 shadow-xl">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {feedbackData.isMovingForward ? 'Move Ahead Feedback' : 'Move Behind Feedback'}
                </h3>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Moving <span className="font-semibold">{feedbackData.candidate.fullName}</span> from{' '}
                  <span className="font-semibold">{feedbackData.fromStage}</span> to{' '}
                  <span className="font-semibold">{feedbackData.toStage}</span>
                </p>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={`Moving ${feedbackData.candidate.fullName} to ${feedbackData.toStage} - New Stage`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 mb-4"
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Enter your feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit and move forward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Profile Modal */}
      {showCandidateProfile && renderCandidateProfile()}
    </>
  );
};

export default SharePipelinesModal;