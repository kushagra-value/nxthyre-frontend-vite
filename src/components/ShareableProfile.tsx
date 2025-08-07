import React, { useState, useEffect } from 'react';
import { Copy, Mail, ArrowLeft, User, Building2, GraduationCap, Award, Star, Phone, MapPin } from 'lucide-react';
import { showToast } from '../utils/toast';
import { useNavigate } from "react-router-dom";
import { candidateService, ShareableProfileSensitiveCandidate } from '../services/candidateService';

interface ShareableProfileProps {
  candidateId: string;
  onBack?: () => void;
}
const ShareableProfile: React.FC<ShareableProfileProps> = ({ candidateId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [anonymizedCandidate, setAnonymizedCandidate] = useState<ShareableProfileSensitiveCandidate | null>(null);

  useEffect(() => {
    const fetchShareableProfile = async () => {
      setLoading(true);
      try {
          const data = await candidateService.getShareableProfile(candidateId);
          setAnonymizedCandidate(data);
      } catch (err) {
        setError('Failed to load candidate profile');
      } finally {
        setLoading(false);
      }
    };
    fetchShareableProfile();
  }, [candidateId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(candidateId);
    showToast.success('Candidate ID copied to clipboard');
  };

  const handleGoToDashboard = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-base font-medium">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Candidate Not Found</h2>
          <p className="text-gray-600">{error || 'The requested candidate profile could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={handleGoToDashboard}
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
                </div>
                <div className="flex items-center space-x-4">
                <button
                  onClick={handleCopyId}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Copy ID"
                >
                  <Copy className="w-4 h-4 text-gray-500" /><span className="font-medium">Copy Profile ID</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            {/* Profile Header */}
            <div className="grid grid-cols-4 gap-24 mb-6 ">
              <div className="col-span-1 w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img 
                  src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className=" col-span-2 flex-1">
                <div className="mb-4">
                  <h2 className="text-4xl font-[400] text-gray-700 mb-2">XXXXXXX XXXX</h2>
                  <div className="flex flex-col items-start justify-start text-gray-600 mb-2">
                    <div className="flex items-center justify-left">
                      <Mail className="w-4 h-4 mr-1" />
                      <span>***********************</span>
                    </div>
                    <div className="flex items-center justify-left">
                      <Phone className="w-4 h-4 mr-1" />
                      <span>************</span>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
             <div className="grid grid-cols-4 gap-24 pb-6 mb-6 border-b border-gray-200">
                  <div>
                    <div className="text-sm text-gray-500">Experience</div>
                    <div className="font-semibold text-gray-900">5 Years</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Current Company</div>
                    <div className="font-semibold text-gray-900">2 Years</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Notice Period</div>
                    <div className="font-semibold text-gray-900">15 Days</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Current Salary</div>
                    <div className="font-semibold text-gray-900">20 LPA</div>
                  </div>
                </div>

            {/* Profile Summary */}
            <div className="mb-8 pb-6 mb-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Summary</h3>
              <p className="text-gray-700 leading-relaxed">{anonymizedCandidate?.about}</p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 ">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">Skills</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {anonymizedCandidate?.skills.slice(0, 9).map((skill, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-gray-100 rounded-lg py-2 px-3 mb-1">
                          <div className="text-sm font-[400] text-gray-700">{skill.skill}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">Education</h3>
                  <div className="space-y-4">
                    {anonymizedCandidate?.education.map((edu, index) => (
                      <div key={index}>
                        <div className="font-medium text-gray-900">{edu.degree} in {edu.specialization}</div>
                        <div className="text-sm text-gray-600">**************************</div>
                        <div className="text-sm text-gray-500">{edu.start_date} - {edu.end_date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificates */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">Certificates</h3>
                  <div className="space-y-3">
                    {anonymizedCandidate?.certifications.map((cert, index) => (
                      <div key={index}>
                        <div className="font-medium text-gray-900">{cert.name}</div>
                        <div className="text-sm text-gray-600">{cert.issuer}</div>
                        <div className="text-sm text-gray-500">Issued {cert.issued_date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* References */}
                
              </div>

              {/* Right Column */}
              <div className="ml-8 pl-8 border-l border-gray-200 col-span-2 space-y-6">
                {/* Work Experience */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">Work Experience</h3>
                  <div className="space-y-6">
                    {anonymizedCandidate?.experience.map((exp, index) => (
                      <div key={index}>
                        <div className="font-medium text-gray-900">{exp.job_title}</div>
                        <div className="text-sm text-gray-600 mb-1">************* | {exp.location}</div>
                        <div className="text-sm text-gray-500 mb-2">{exp.start_date} - {exp.end_date || 'Present'}</div>
                        <p className="text-sm text-gray-700">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                
              </div>

              
            </div>
            <div className="pt-6 mt-6 border-t border-gray-200 w-full grid grid-cols-1 lg:grid-cols-3">

              <div className="mr-8 col-span-1">
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">References</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Ana De Armas</div>
                        <div className="text-sm text-gray-600">HR Manager at *************</div>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Ana De Armas</div>
                        <div className="text-sm text-gray-600">HR Manager at *************</div>
                      </div>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Ana De Armas</div>
                        <div className="text-sm text-gray-600">HR Manager at *************</div>
                      </div>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                {/* Community Notes */}

             <div className="ml-8 pl-8 col-span-2">
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">Community Notes</h3>
                  <div className="space-y-4">
                    <div className="">
                      <div className="flex flex-col items-left justify-between mb-2">
                        <div className="font-medium text-gray-500">Company</div>
                        <div className="text-sm text-gray-500">Posted Date</div>
                      </div>
                      <p className="text-sm text-gray-700">This innovative AI engineer skillfully solved complex problems, collaborated effectively, and delivered precise, reliable solutions with creative insight.</p>
                    </div>
                    <div className="">
                      <div className="flex flex-col items-left justify-between mb-2">
                        <div className="font-medium text-gray-500">Company</div>
                        <div className="text-sm text-gray-500">Posted Date</div>
                      </div>
                      <p className="text-sm text-gray-700">This innovative AI engineer skillfully solved complex problems, collaborated effectively, and delivered precise, reliable solutions with creative insight.</p>
                    </div>
                  </div>
                </div>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareableProfile;