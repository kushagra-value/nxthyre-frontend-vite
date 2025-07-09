import React, { useState, useEffect } from 'react';
import { Copy, MessageCircle, Mail, Twitter, ArrowLeft, User, Building2, GraduationCap, Award, Star, Phone , PencilLine } from 'lucide-react';
import { showToast } from '../utils/toast';
import { pipelineCandidates, PipelineCandidate } from '../data/pipelineData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

interface ShareableProfileProps {
  candidateId: string;
  onBack?: () => void;
}

// Anonymized candidate data structure
interface AnonymizedCandidate {
  id: string;
  firstName: null;
  lastName: null;
  fullName: null;
  publicIdentifier: string;
  headline: string;
  summary: string;
  profilePicture: {
    displayImageUrl: string;
    artifacts: Array<{
      width: number;
      height: number;
      url: string;
    }>;
  };
  location: {
    country: null;
    city: null;
  };
  industry: string;
  email: null;
  phone: {
    type: string;
    number: null;
  };
  positions: Array<{
    title: string;
    companyName: null;
    companyUrn: string;
    startDate: {
      month: number;
      year: number;
    };
    endDate?: {
      month: number;
      year: number;
    };
    isCurrent: boolean;
    location: null;
    description: string;
  }>;
  educations: Array<{
    schoolName: null;
    degreeName: string;
    fieldOfStudy: string;
    startDate: {
      year: number;
    };
    endDate: {
      year: number;
    };
    activities: string;
    description: string;
  }>;
  certifications: Array<{
    name: string;
    authority: null;
    licenseNumber: string;
    startDate: {
      month: number;
      year: number;
    };
    endDate?: {
      month: number;
      year: number;
    };
    url: string;
  }>;
  skills: Array<{
    name: string;
    endorsementCount: number;
  }>;
  endorsements: Array<{
    endorser: {
      id: string;
      name: null;
      headline: string;
      profileImageUrl: string;
    };
    skill: string;
    message: string;
  }>;
  recommendations: {
    received: Array<{
      recommender: {
        id: string;
        name: null;
        headline: string;
        profileImageUrl: string;
      };
      message: string;
      relationship: string;
      createdDate: string;
    }>;
    given: Array<{
      recipient: {
        id: string;
        name: null;
        headline: string;
        profileImageUrl: string;
      };
      message: string;
      relationship: string;
      createdDate: string;
    }>;
  };
  visibility: {
    profile: 'PUBLIC' | 'CONNECTIONS' | 'PRIVATE';
    email: boolean;
    phone: boolean;
  };
  connections: Array<{
    id: string;
    fullName: null;
    publicIdentifier: string;
    headline: string;
    profilePicture: {
      displayImageUrl: string;
    };
    location: {
      country: null;
      city: null;
    };
    linkedProfilePath: string;
  }>;
  meta: {
    fetchedAt: string;
    dataCompleteness: 'full' | 'partial';
    source: string;
    scopesGranted: string[];
  };
}

const ShareableProfile: React.FC<ShareableProfileProps> = ({ candidateId, onBack }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [anonymizedCandidate, setAnonymizedCandidate] = useState<AnonymizedCandidate | null>(null);

  useEffect(() => {
    // Find the candidate from all stages
    let foundCandidate: PipelineCandidate | null = null;
    
    Object.values(pipelineCandidates).forEach(stageCandidates => {
      const candidate = stageCandidates.find(c => c.id === candidateId);
      if (candidate) {
        foundCandidate = candidate;
      }
    });

    if (foundCandidate) {
      // Anonymize the candidate data
      const anonymized: AnonymizedCandidate = {
        ...foundCandidate,
        firstName: null,
        lastName: null,
        fullName: null,
        location: {
          country: null,
          city: null
        },
        email: null,
        phone: {
          ...foundCandidate.phone,
          number: null
        },
        positions: foundCandidate.positions.map(pos => ({
          ...pos,
          companyName: null,
          location: null
        })),
        educations: foundCandidate.educations.map(edu => ({
          ...edu,
          schoolName: null
        })),
        certifications: foundCandidate.certifications.map(cert => ({
          ...cert,
          authority: null
        })),
        endorsements: foundCandidate.endorsements.map(end => ({
          ...end,
          endorser: {
            ...end.endorser,
            name: null
          }
        })),
        recommendations: {
          received: foundCandidate.recommendations.received.map(rec => ({
            ...rec,
            recommender: {
              ...rec.recommender,
              name: null
            }
          })),
          given: foundCandidate.recommendations.given.map(rec => ({
            ...rec,
            recipient: {
              ...rec.recipient,
              name: null
            }
          }))
        },
        connections: foundCandidate.connections.map(conn => ({
          ...conn,
          fullName: null,
          location: {
            country: null,
            city: null
          }
        }))
      };
      
      setAnonymizedCandidate(anonymized);
    }
  }, [candidateId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(candidateId);
    showToast.success('Candidate ID copied to clipboard');
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=Check out this candidate profile: ${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Candidate Profile&body=Check out this candidate profile: ${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=Check out this candidate profile: ${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const handleGoToDashboard = () => {
    window.location.href = '/';
  };

  const renderGrayedBox = (width: string = 'w-32') => (
    <div className={`${width} h-4 bg-gray-700 rounded-sm `}></div>
  );

  const renderGrayedText = (width: string = 'w-24') => (
    <div className={`${width} h-4 bg-gray-700 rounded-sm `}></div>
  );

  const profileTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'experience', label: 'Experience', icon: Building2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Star },
    { id: 'certifications', label: 'Certifications', icon: Award }
  ];

  if (!anonymizedCandidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Candidate Not Found</h2>
          <p className="text-gray-600">The requested candidate profile could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div className="flex items-center space-x-2">
                <h1 className="text-xl lg:text-2xl font-bold text-blue-600 cursor-pointer" 
                  onClick={handleGoToDashboard}
                >
                  NxtHyre
                </h1>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600 font-medium">{candidateId}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy ID"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Share on:</span>
              <button
                onClick={() => handleShare('whatsapp')}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Share on WhatsApp"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
              </button>
              <button
                onClick={() => handleShare('email')}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Share via Email"
              >
                <Mail className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                title="Share on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          

          {/* Content */}
          <div className="p-6">
            
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                   {anonymizedCandidate.profilePicture.displayImageUrl ? (
                  <img className=" rounded-full w-20 h-20" src={anonymizedCandidate.profilePicture.displayImageUrl} alt="" />):(
     < div className="bg-gray-700 rounded-full w-16 h-16"/>
                  )}
                  <div className="space-y-2">
                   <div className="flex gap-2"> < PencilLine className="w-4 h-4" />{renderGrayedBox('w-48')}</div>
                    <div  className="flex gap-2"><Mail  className="w-4 h-4"/>{renderGrayedBox('w-64')}</div>
                    <div  className="flex gap-2"> <Phone className="w-4 h-4"/>{renderGrayedBox('w-32')}</div>
                  </div>
                </div>
                
               
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{anonymizedCandidate.summary}</p>
                </div>

                <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Experience</h3>
                {anonymizedCandidate.positions.map((position, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 relative">
                    <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                    <h4 className="font-medium text-gray-900">{position.title}</h4>
                    <div className="space-y-1">
                      <div className="flex gap-2"><Building2  className="w-4 h-4"/>{renderGrayedText('w-40')}</div>
                      <p className="text-gray-500">{position.startDate.month}/{position.startDate.year} - {position.isCurrent ? 'Present' : `${position.endDate?.month}/${position.endDate?.year}`}</p>
                    </div>
                    <p className="text-gray-700 mt-1">{position.description}</p>
                  </div>
                ))}
              </div>
           

           
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Education</h3>
                {anonymizedCandidate.educations.map((education, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 relative">
                    <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                    <h4 className="font-medium text-gray-900">{education.degreeName}</h4>
                    <div className="space-y-1">
                      <div className="flex gap-2"><GraduationCap className="w-4 h-4"/>{renderGrayedText('w-48')}</div>
                      <p className="text-gray-500">{education.fieldOfStudy}</p>
                      <p className="text-gray-500">{education.startDate.year} - {education.endDate.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            

           
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {anonymizedCandidate.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill.name} ({skill.endorsementCount} endorsements)
                    </span>
                  ))}
                </div>
              </div>
            

            
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Certifications</h3>
                {anonymizedCandidate.certifications.length > 0 ? (
                  anonymizedCandidate.certifications.map((cert, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 relative">
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <div className="space-y-1">
                        <div className="flex gap-2"><Award className="w-4 h-4"/>{renderGrayedText('w-32')}</div>
                        <p className="text-gray-500">{cert.startDate.month}/{cert.startDate.year}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No certifications available</p>
                )}
              </div>
              </div>
           

            
              
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareableProfile;