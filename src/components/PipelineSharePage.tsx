import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, User, MapPin, Github, Linkedin, FileText, Twitter, X, Plus, ChevronRight, Building2, GraduationCap, Award, Star, Clock } from 'lucide-react';
import { showToast } from '../utils/toast';

interface DraggedCandidate {
  candidate: any;
  fromStage: string;
}

interface PipelineSharePageProps {
  pipelineId: string;
  onBack?: () => void;
}

const PipelineSharePage: React.FC<PipelineSharePageProps> = ({ pipelineId, onBack }) => {
  const [draggedCandidate, setDraggedCandidate] = useState<DraggedCandidate | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showCandidateProfile, setShowCandidateProfile] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('profile');
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessEmail, setAccessEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('view');

  // Pipeline data mapping
  const pipelineData = {
    'head-of-finance': {
      title: 'Head Of Finance',
      id: 'head-of-finance'
    },
    'contract-executive': {
      title: 'Contract Executive',
      id: 'contract-executive'
    },
    'aerospace-engineer': {
      title: 'Aerospace Engineer',
      id: 'aerospace-engineer'
    },
    'embedded-engineer': {
      title: 'Embedded Engineer',
      id: 'embedded-engineer'
    },
    'production-engineer': {
      title: 'Production Engineer',
      id: 'production-engineer'
    },
    'waste-water-management': {
      title: 'Waste Water Management',
      id: 'waste-water-management'
    },
    'software-engineer': {
      title: 'Software Engineer',
      id: 'software-engineer'
    },
    'product-manager': {
      title: 'Product Manager',
      id: 'product-manager'
    },
    'data-scientist': {
      title: 'Data Scientist',
      id: 'data-scientist'
    },
    'ui-ux-designer': {
      title: 'UI/UX Designer',
      id: 'ui-ux-designer'
    },
    'devops-engineer': {
      title: 'DevOps Engineer',
      id: 'devops-engineer'
    },
    'marketing-manager': {
      title: 'Marketing Manager',
      id: 'marketing-manager'
    }
  };

  const currentPipeline = pipelineData[pipelineId] || { title: 'Unknown Pipeline', id: pipelineId };

  const shareableStages = [
    { name: 'Shortlisted', color: 'bg-blue-50', borderColor: 'border-blue-200', count: 2, bgColor:"bg-blue-200", textColor: "text-blue-400" },
    { name: 'First Interview', color: 'bg-yellow-50', borderColor: 'border-yellow-200', count: 2 ,bgColor:"bg-yellow-200", textColor: "text-yellow-400"},
    { name: 'Other Interviews', color: 'bg-orange-50', borderColor: 'border-orange-200', count: 1,bgColor:"bg-orange-200", textColor: "text-orange-400" },
    { name: 'HR Round', color: 'bg-red-50', borderColor: 'border-red-200', count: 1 ,bgColor:"bg-red-200", textColor: "text-red-400"},
    { name: 'Salary Negotiation', color: 'bg-purple-50', borderColor: 'border-purple-200', count: 1,bgColor:"bg-purple-200", textColor: "text-purple-400" },
    { name: 'Offer Sent', color: 'bg-green-50', borderColor: 'border-green-200', count: 1 ,bgColor:"bg-green-200", textColor: "text-green-400"},
    { name: 'Archives', color: 'bg-gray-50', borderColor: 'border-gray-200', count: 1 ,bgColor:"bg-gray-200", textColor: "text-gray-400"}
  ];
   
  const stageOrder = {
    'Shortlisted': 0,
    'First Interview': 1,
    'Other Interviews': 2,
    'HR Round': 3,
    'Salary Negotiation': 4,
    'Offer Sent': 5,
    'Archives': 6
  };
const getDaysAgo = (date: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Initial candidate data for each stage - using state to allow updates
  const [stageCandidates, setStageCandidates] = useState({
    'Shortlisted': [
      {
        id: 'sl1',
        name: 'Arjun Mehta',
        company: 'Microsoft',
        role: 'DevOps Engineer',
        location: 'Hyderabad, India',
        avatar: 'AM',
        notes: 'Excellent technical skills, ready for next round',
        lastUpdated: new Date(2024, 0, 15),
        socials: { github: true, linkedin: true, resume: true, twitter: false }
      },
      {
        id: 'sl2',
        name: 'Meera Joshi',
        company: 'Google',
        role: 'QA Engineer',
        location: 'Bangalore, India',
        avatar: 'MJ',
        notes: 'Strong QA background, good automation skills',
        lastUpdated: new Date(2024, 0, 12),
        socials: { github: true, linkedin: true, resume: true, twitter: true }
      }
    ],
    'First Interview': [
      {
        id: 'fi1',
        name: 'Karthik Rao',
        company: 'Ola',
        role: 'Mobile Developer',
        location: 'Bangalore, India',
        avatar: 'KR',
        notes: 'Good mobile development experience, strong problem-solving skills',
        lastUpdated: new Date(2024, 0, 10),
        socials: { github: true, linkedin: true, resume: true, twitter: false }
      },
      {
        id: 'fi2',
        name: 'Divya Krishnan',
        company: 'Accenture',
        role: 'Business Analyst',
        location: 'Chennai, India',
        avatar: 'DK',
        notes: 'Strong analytical skills, good business understanding',
        lastUpdated: new Date(2024, 0, 8),
        socials: { github: false, linkedin: true, resume: true, twitter: false }
      }
    ],
    'Other Interviews': [
      {
        id: 'oi1',
        name: 'Suresh Babu',
        company: 'IBM',
        role: 'Solution Architect',
        location: 'Pune, India',
        avatar: 'SB',
        notes: 'Excellent architecture knowledge, strong leadership potential',
        lastUpdated: new Date(2024, 0, 5),
        socials: { github: true, linkedin: true, resume: true, twitter: true }
      }
    ],
    'HR Round': [
      {
        id: 'hr1',
        name: 'Ravi Teja',
        company: 'Salesforce',
        role: 'Sales Manager',
        location: 'Mumbai, India',
        avatar: 'RT',
        notes: 'Strong cultural fit, excellent communication skills',
        lastUpdated: new Date(2024, 0, 3),
        socials: { github: false, linkedin: true, resume: true, twitter: false }
      }
    ],
    'Salary Negotiation': [
      {
        id: 'sn1',
        name: 'Arun Kumar',
        company: 'Flipkart',
        role: 'Tech Lead',
        location: 'Bangalore, India',
        avatar: 'AK',
        notes: 'Negotiating salary package, strong technical leadership',
        lastUpdated: new Date(2024, 0, 1),
        socials: { github: true, linkedin: true, resume: true, twitter: false }
      }
    ],
    'Offer Sent': [
      {
        id: 'os1',
        name: 'Manish Jain',
        company: 'Deloitte',
        role: 'Senior Consultant',
        location: 'Mumbai, India',
        avatar: 'MJ',
        notes: 'Offer sent, awaiting response',
        lastUpdated: new Date(2023, 11, 28),
        socials: { github: false, linkedin: true, resume: true, twitter: true }
      }
    ],
    'Archives': [
      {
        id: 'ar1',
        name: 'Deepak Verma',
        company: 'Infosys',
        role: 'Software Engineer',
        location: 'Pune, India',
        avatar: 'DV',
        notes: 'Did not meet technical requirements',
        lastUpdated: new Date(2023, 11, 25),
        socials: { github: true, linkedin: true, resume: true, twitter: false }
      }
    ]
  });

  const handleDragStart = (candidate: any, fromStage: string) => {
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

    // Actually move the candidate between stages
    setStageCandidates(prevStages => {
      const newStages = { ...prevStages };
      
      // Remove candidate from source stage
      newStages[feedbackData.fromStage] = newStages[feedbackData.fromStage].filter(
        c => c.id !== feedbackData.candidate.id
      );
      
      // Add candidate to destination stage with updated notes
      const updatedCandidate = {
        ...feedbackData.candidate,
        notes: feedbackComment.trim()
      };
      
      if (!newStages[feedbackData.toStage]) {
        newStages[feedbackData.toStage] = [];
      }
      
      newStages[feedbackData.toStage] = [...newStages[feedbackData.toStage], updatedCandidate];
      
      return newStages;
    });

    showToast.success(`${feedbackData.candidate.name} moved to ${feedbackData.toStage}`);
    
    setShowFeedbackModal(false);
    setFeedbackData(null);
    setFeedbackComment('');
  };

  const handleCandidateClick = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowCandidateProfile(true);
    setActiveProfileTab('profile');
  };

  const handleAccessSubmit = () => {
    if (!accessEmail.trim()) {
      showToast.error('Please enter an email address');
      return;
    }

    showToast.success(`Access granted to ${accessEmail} with ${accessLevel} permissions`);
    setShowAccessModal(false);
    setAccessEmail('');
    setAccessLevel('view');
  };

  const renderCandidateCard = (candidate: any, stage: string) => (
    <div
      key={candidate.id}
      draggable
      onDragStart={() => handleDragStart(candidate, stage)}
      className="bg-white border border-gray-200 rounded-lg p-2 mb-2 cursor-move hover:shadow-lg transition-all duration-200 relative"
    >
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-1">
          <div>
          <button
            onClick={() => handleCandidateClick(candidate)}
            className="text-sm font-semibold text-gray-900 hover:text-blue-600 text-left block"
          >
            {candidate.name}
          </button>
          <p className="text-xs text-gray-600 mt-1">
            {candidate.company} • {candidate.role}
          </p>
          <p className="text-xs text-gray-500 flex items-center mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {candidate.location}
          </p>
          </div>
          <div className="flex items-center space-x-1">
            {candidate.socials.linkedin && (
              <Linkedin className="w-3 h-3 text-gray-400" />
            )}
            {candidate.socials.resume && (
              <FileText className="w-3 h-3 text-gray-400" />
            )}
            </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Last Updated {getDaysAgo(candidate.lastUpdated)} days ago
          </p>
          
        </div>
      </div>
    </div>
  );

   const handleGoToDashboard = () => {
    // Navigate back to main dashboard
    window.location.href = '/';
  };

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
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-end ">
        <div className="fixed bg-white  shadow-xl max-w-4xl w-full max-h-[100vh] overflow-y-auto p-4">
          {/* Header */}
          <div className="absolute right-2 p-6">
            
            <button
              onClick={() => setShowCandidateProfile(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          
         

          {/* Content */}
          <div className="p-6 space-y-6">
            
              <div className="space-y-6 ">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {selectedCandidate.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCandidate.name}</h2>
                    <p className="text-gray-600">{selectedCandidate.company} | {selectedCandidate.role}</p>
                    <p className="text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedCandidate.location}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700">Experienced professional with strong technical background and excellent problem-solving skills. Demonstrated ability to work in fast-paced environments and deliver high-quality results.</p>
                </div>
              </div>
            

            
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Experience</h3>
                <div className="border-l-2 border-gray-200 pl-4 relative">
                  <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                  <h4 className="font-medium text-gray-900">{selectedCandidate.role}</h4>
                  <p className="text-gray-600">{selectedCandidate.company}</p>
                  <p className="text-gray-500"></p>
                  <p className="text-gray-700 mt-1">Leading development initiatives and managing cross-functional teams to deliver innovative solutions.</p>
                </div>
              </div>
            

            
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Education</h3>
                <div className="border-l-2 border-gray-200 pl-4 relative">
                  <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                  <h4 className="font-medium text-gray-900">Bachelor of Technology</h4>
                  <p className="text-gray-600">Indian Institute of Technology</p>
                  <p className="text-gray-500">Computer Science Engineering</p>
                  <p className="text-gray-500">2016 - 2020</p>
                </div>
              </div>
        

            
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'].map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill} (15+ endorsements)
                    </span>
                  ))}
                </div>
              </div>
            

           
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Certifications</h3>
                <div className="border-l-2 border-gray-200 pl-4 relative">
                  <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                  <h4 className="font-medium text-gray-900">AWS Certified Solutions Architect</h4>
                  <p className="text-gray-600">Amazon Web Services</p>
                  <p className="text-gray-500">June 2023</p>
                </div>
              </div>
            
          </div>
        </div>
      </div>
    );
  };

  const getStageCount = (stageName: string) => {
    return stageCandidates[stageName]?.length || 0;
  };

  return (
    <>
      <div className="mx-auto max-w-[85vw] min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={handleGoToDashboard}><ArrowLeft className="w-10 h-5"/></button>
              <h1 className="text-xl font-semibold text-gray-900">{currentPipeline.title}'s Pipeline</h1>
            </div>
            <div className="flex gap-2 items-center"><p className="text-xs text-gray-500">Share Using:</p>  
            <button
              onClick={() => setShowAccessModal(true)}
              className="p-1 px-4 border border-blue-500 text-blue-500 text-sm font-medium rounded-lg hover:bg-blue-500 hover:text-white transition-colors flex items-center space-x-2"
            > 
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="bg-white py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700"></span>
            </div>
            
          </div>
        </div>

        {/* Main Content */}
        <div className="px-2">
          {/* Pipeline Stages */}
          <div className="overflow-x-auto">
            <div className="flex space-x-4 min-w-max pb-4">
              {shareableStages.map((stage, index) => {
                const candidates = stageCandidates[stage.name] || [];
                const stageCount = getStageCount(stage.name);
                
                return (
                  <div
                    key={stage.name}
                    className="w-72 flex-shrink-0 h-[80vh]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.name)}
                  >
                    {/* Stage Header */}
                    <div className={`${stage.color} rounded-lg p-3`}>
                      <div className="flex items-center justify-between">
                         
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <div className={` ${stage.bgColor} p-1 rounded-md`}>
                            <h3 className={`font-semibold text-gray-900 text-sm`}>
                            {stage.name}
                          </h3>
                          </div>
                          <p className={`text-sm font-semibold ${stage.textColor} p-1 `}>
                            {stageCount}
                          </p>
                        </div>
                      </div>
                    

                    {/* Candidates Container */}
                    <div className="overflow-y-auto max-h-[70vh]">
                      <div className="space-y-3">
                        {candidates.map((candidate) => renderCandidateCard(candidate, stage.name))}
                        {candidates.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            <User className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">No candidates</p>
                          </div>
                        )}
                      </div>
                    </div>
                      </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Access Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Pipeline Access</h3>
              <button
                onClick={() => setShowAccessModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={accessEmail}
                  onChange={(e) => setAccessEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="view"
                      checked={accessLevel === 'view'}
                      onChange={(e) => setAccessLevel(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">View Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="edit"
                      checked={accessLevel === 'edit'}
                      onChange={(e) => setAccessLevel(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Can Edit</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAccessModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccessSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Share Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )} 

      {/* Feedback Modal */}
      {showFeedbackModal && feedbackData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center">
          <div className="bg-white h-[70vh] w-[50vw] shadow-xl rounded-md  ">
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
                  Moving <span className="font-semibold">{feedbackData.candidate.name}</span> from{' '}
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
                  value={`Moving ${feedbackData.candidate.name} to ${feedbackData.toStage} - New Stage`}
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

export default PipelineSharePage;