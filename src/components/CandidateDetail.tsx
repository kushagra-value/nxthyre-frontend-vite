import React, { useState, useEffect } from 'react';
import { Mail, Phone, Copy, MapPin, Calendar, Award, Briefcase, GraduationCap, Send, Star, Plus, User, Users, FileText, TrendingUp, MessageCircle, X, Share2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { showToast } from '../utils/toast';

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  company: string;
  currentRole: string;
  skillLevel: string;
  city: string;
  verified: boolean;
  status: string;
  experience: string;
  education: string;
  noticePeriod: string;
  skills: string[];
  headline: string;
  currentCompanyExperience: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  graduationYears:string;
  location?: string;
}

interface CandidateDetailProps {
  candidate: Candidate | null;
  candidates?: Candidate[];
  onSendInvite?: () => void;
}

interface Experience {
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
  is_current: boolean;
}

interface Education {
  institution: string;
  degree: string;
  specialization: string;
  start_date: string;
  end_date: string;
}

interface Certification {
  name: string;
  issuer: string;
  issued_date: string;
}

interface Recommendation {
  recommender_name: string;
  recommender_title: string;
  recommender_company: string;
  feedback: string;
  date_received: string;
}

interface Note {
  noteId: string;
  content: string;
  postedBy: string | null;
  posted_at: string;
  organisation: { orgId: string; orgName: string };
}

interface CandidateData {
  id: string;
  full_name: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  portfolio_url?: string;
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  recommendations: Recommendation[];
  notes: Note[];
  skills_data: {
    skills_mentioned: { skill: string; number_of_endorsements: number }[];
    endorsements: { skill_endorsed: string; endorser_name: string; endorser_title: string; endorser_company: string }[];
  };
}

const CandidateDetail: React.FC<CandidateDetailProps> = ({ candidate, candidates = [], onSendInvite }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the first candidate if no candidate is selected but candidates are available
  const displayCandidate = candidate || (candidates.length > 0 ? candidates[0] : null);

// Fetch candidate details dynamically
  useEffect(() => {
    if (displayCandidate?.id) {
      setLoading(true);
      setError(null);
      fetch(`/api/candidates/candidates/${displayCandidate.id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch candidate details');
          }
          return response.json();
        })
        .then((data) => {
          setCandidateData(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
          showToast.error('Failed to load candidate details');
        });
    }
  }, [displayCandidate?.id]);

  useEffect(() => {
    if (showComments) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showComments]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4">
        <div className="text-center text-gray-500 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-base font-medium">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (!displayCandidate) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4">
        <div className="text-center text-gray-500 mt-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-base font-medium">No candidates available</p>
          <p className="text-sm mt-1">No candidate data is available to display</p>
        </div>
      </div>
    );
  }

  if (error || !candidateData || !displayCandidate) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4">
        <div className="text-center text-gray-500 mt-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-base font-medium">No candidate selected</p>
          <p className="text-sm mt-1">{error || 'Please select a candidate to view details'}</p>
        </div>
      </div>
    );
  }

  const experiences = [
    {
      title: displayCandidate.currentRole,
      company: `${displayCandidate.company} | ${displayCandidate.location}`,
      period: displayCandidate.experience,
      duration: `${displayCandidate.currentCompanyExperience} yr`,
      description: 'Conducted in-depth data analysis on performance metrics, and inventory data using various tools. Streamlined the team workflow for increased efficiency.'
    },
    {
      title: 'Previous Role',
      company: 'Previous Company | Location',
      period: '2019 - 2022',
      duration: '3 yr',
      description: 'Mentored team members and implemented KPIs. Mediated various processes and contributed to organizational growth.'
    }
  ];

  const education = [
    {
      degree: displayCandidate.education,
      field: 'Specialized Field',
      period: '2017 - 2019',
      location: displayCandidate.city
    }
  ];

  const certifications = [
    {
      name: 'Certified Python Developer',
      issuer: 'Python Institute',
      date: 'January 2023'
    },
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: 'June 2022'
    }
  ];

  const recommendations = [
    {
      name: 'Sarah Lee',
      role: 'Project Manager at Innovations Inc.',
      company: 'Innovations Inc.',
      text: 'Alex is a fantastic team player with exceptional technical skills.',
      date: 'Received March 2024'
    }
  ];

  const existingComments = [
    {
      id: 1,
      text: 'Great candidate with strong technical background. Very responsive during initial screening.',
      author: 'John Doe',
      date: '2 days ago',
      avatar: 'J'
    },
    {
      id: 2,
      text: 'Excellent communication skills. Would be a good fit for senior roles.',
      author: 'Jane Smith',
      date: '1 week ago',
      avatar: 'J'
    },
    {
      id: 3,
      text: 'Had a great conversation about their experience with Python and data analysis. Very knowledgeable.',
      author: 'Mike Johnson',
      date: '3 days ago',
      avatar: 'M'
    }
  ];

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  const handleShareProfile = () => {
    // Navigate to shareable profile page
    window.open(`/candidate-profiles/${candidateData.id}`, '_blank');
  };

  const getAvatarColor = (name: string) => {
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-3 space-y-6 min-h-[81vh] relative overflow-hidden">
      {/* Header */}
      <div className="flex space-x-3 items-center mt-1">
        <div className={`w-12 h-12 ${getAvatarColor(candidateData.full_name)} rounded-full flex items-center justify-center text-white`}>
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base lg:text-lg font-bold text-gray-900">{candidateData.full_name}</h2>
          <div className="flex">
            <p className="text-sm text-gray-500 ml-1 max-w-[28ch] truncate">{candidateData.headline}</p>
          </div>
          <div className="flex">
            <p className="text-sm text-gray-500 ml-1">{candidateData.location}</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 absolute right-6 top-4">
        <button onClick={handleShareProfile}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Share Profile">
          <Share2 className="w-4 h-4 "/> 
        </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
            <span className="text-sm text-gray-700 truncate">{candidateData.email}</span>
          </div>
          <button className="flex space-x-2 ml-auto p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{candidateData.phone}</span>
          </div>
          <button className="flex space-x-2 ml-auto p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
            <FontAwesomeIcon icon={faWhatsapp} />
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          <button 
            onClick={onSendInvite}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            style={{ width: '75%' }}
          >
            Send Invite & Reveal Info
          </button>
          <button 
            onClick={() => setShowComments(true)}
            className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            style={{ width: '25%' }}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Experience */}
      <div>
        <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
          <Briefcase className="w-4 h-4 mr-2 text-gray-800" />
          Experience
        </h3>
        <div className="ml-2">
          {candidateData.experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4 relative pb-2">
              <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
              <h4 className="font-medium text-gray-900 text-sm">{exp.job_title}</h4>
              <p className="text-sm text-gray-600">{`${exp.company} | ${exp.location}`}</p>
              <p className="text-sm text-gray-500">{`${new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}`}</p>
              <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
          <GraduationCap className="w-4 h-4 mr-2 text-gray-800" />
          Education
        </h3>
        <div className="ml-2">
          {candidateData.education.map((edu, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4 relative pb-2">
              <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
              <h4 className="font-medium text-gray-900 text-sm">{edu.degree}</h4>
              <p className="text-sm text-gray-600">{edu.specialization}</p>
              <p className="text-sm text-gray-500">{`${new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}</p>
              {edu.institution && (
                <p className="text-sm text-gray-500">{edu.institution}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
          <Award className="w-4 h-4 mr-2 text-gray-800" />
          Certifications
        </h3>
        <div className="ml-2">
          {candidateData.certifications.map((cert, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4 relative pb-2">
              <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
              <h4 className="font-medium text-gray-900 text-sm">{cert.name}</h4>
              <p className="text-sm text-gray-600">{cert.issuer}</p>
              <p className="text-sm text-gray-500">{new Date(cert.issued_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <h3 className="flex text-sm lg:text-base font-semibold text-gray-900 mb-2">
          <Star className="w-4 h-4 mr-2 mt-1 text-gray-800" />
          Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {candidateData.skills_data.skills_mentioned.map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              {skill.skill} <span className="text-gray-600 font-medium ml-2">{skill.number_of_endorsements}+</span>
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-gray-800" />
          Recommendations
        </h3>
        <div className="space-y-2">
          {candidateData.recommendations.map((rec, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{rec.recommender_name}</h4>
                  <p className="text-xs text-gray-700">{rec.recommender_title}</p>
                  <p className="text-sm text-gray-800 mt-1">"{rec.feedback}"</p>
                  <p className="text-xs text-gray-600 mt-1">{new Date(rec.date_received).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div
        className={`absolute top-14 left-0 w-full h-[480px] bg-gray-50 transform transition-all duration-300 ease-in-out z-10 ${
          showComments ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white p-4 h-full flex flex-col shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
            <button
              onClick={() => setShowComments(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" /> 
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {candidateData.notes.map((note) => (
              <div key={note.noteId} className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {note.postedBy?.[0] || note.organisation.orgName[0]}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2 mr-2">
                    <p className="font-medium text-sm text-gray-900">{note.postedBy || note.organisation.orgName}</p>
                    <p className="text-sm text-gray-800 mt-1">{note.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-4">{new Date(note.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                S
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;