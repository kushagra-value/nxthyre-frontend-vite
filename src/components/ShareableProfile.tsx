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

  const candidateProfileUrl = `https://nxthyre-frontend-vite.vercel.app/candidate-profiles/${candidateId}`;

  const handleCopyId = () => {
    showToast.success('Candidate ID copied to clipboard');
    navigator.clipboard.writeText(candidateProfileUrl);
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
        <div className="max-w-7xl mx-auto">
            <div className="w-full flex justify-between items-center space-x-4 h-16">
                <div className="flex items-center">
              <svg
                width="100"
                height="22"
                viewBox="0 0 100 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-xl lg:text-2xl font-bold text-blue-600 cursor-pointer"
                onClick={onBack}
              >
                <g clip-path="url(#clip0_1918_2679)">
                  <path
                    d="M0 17.4101V0H3.25043L12.5221 14.2182H12.7353L12.5488 0H14.92V17.4101H11.9626L2.45115 2.8753H2.21136L2.39786 17.4101H0Z"
                    fill="url(#paint0_linear_1918_2679)"
                  />
                  <path
                    d="M17.8619 17.4113L22.5243 10.6056L17.8086 3.77344H20.6593L23.9098 9.26024H24.2561L27.4533 3.77344H30.2774L25.6149 10.6056L30.384 17.4113H27.5333L24.2561 11.8981H23.9098L20.7127 17.4113H17.8619Z"
                    fill="url(#paint1_linear_1918_2679)"
                  />
                  <path
                    d="M37.8223 17.6755C36.5435 17.6755 35.5932 17.3326 34.9715 16.6468C34.3499 15.9609 34.0391 14.9146 34.0391 13.5076V5.77863H31.9609L31.9876 3.77383H33.2931C33.7371 3.77383 34.0568 3.69469 34.2522 3.53642C34.4654 3.37815 34.5897 3.11436 34.6252 2.74506L34.8916 0.6875H36.3836V3.77383H40.3534V5.805H36.3836V13.4549C36.3836 14.1583 36.5435 14.6683 36.8632 14.9849C37.2007 15.2838 37.6803 15.4333 38.3019 15.4333C38.6394 15.4333 38.9858 15.3893 39.341 15.3014C39.714 15.2135 40.0781 15.0376 40.4333 14.7738V17.1743C39.9182 17.3677 39.4386 17.4996 38.9946 17.57C38.5683 17.6404 38.1776 17.6755 37.8223 17.6755Z"
                    fill="url(#paint2_linear_1918_2679)"
                  />
                  <path
                    d="M55.277 17.4101V0H57.7282V17.4101H55.277ZM43.6074 17.4101V0H46.0586V17.4101H43.6074ZM44.833 9.54914V7.46523H56.2627V9.54914H44.833Z"
                    fill="black"
                  />
                  <path
                    d="M66.9526 22.0013C66.2243 22.0013 65.505 21.9133 64.7945 21.7375C64.1018 21.5792 63.4623 21.333 62.8762 20.9989C62.29 20.6647 61.8105 20.2338 61.4375 19.7063L62.6631 17.9653C63.0716 18.5632 63.6489 19.0204 64.3949 19.337C65.1409 19.6535 65.9579 19.8118 66.846 19.8118C67.8407 19.8118 68.6666 19.592 69.3238 19.1523C69.9987 18.7303 70.505 18.0708 70.8424 17.1739C71.1799 16.2594 71.3575 15.1252 71.3753 13.7711L71.6684 11.0277H71.1622C70.9668 12.3114 70.6559 13.3402 70.2296 14.1139C69.8211 14.8702 69.306 15.4153 68.6844 15.7494C68.0805 16.0836 67.3789 16.2506 66.5795 16.2506C65.5849 16.2506 64.7412 16.0045 64.0485 15.5121C63.3736 15.0021 62.8585 14.2634 62.5032 13.2962C62.148 12.3114 61.9704 11.1156 61.9704 9.70871V3.77344H64.3949V9.18112C64.3949 10.8869 64.6346 12.1444 65.1142 12.9533C65.6115 13.7447 66.3486 14.1403 67.3255 14.1403C67.8584 14.1403 68.338 14.0084 68.7643 13.7447C69.1905 13.4809 69.5547 13.0939 69.8567 12.5839C70.1764 12.074 70.425 11.4321 70.6027 10.6583C70.798 9.86695 70.9223 8.95248 70.9756 7.91492V3.77344H73.4001V13.903C73.4001 14.9757 73.3202 15.9429 73.1604 16.8046C73.0005 17.6664 72.7429 18.4137 72.3877 19.0468C72.0502 19.6975 71.624 20.2426 71.1088 20.6823C70.5937 21.122 69.9899 21.4473 69.2972 21.6583C68.6045 21.8869 67.8229 22.0013 66.9526 22.0013Z"
                    fill="black"
                  />
                  <path
                    d="M77.582 17.4105V3.77262H79.7668L79.5536 8.52079H80.0065C80.1664 7.48324 80.4151 6.58636 80.7525 5.83017C81.0901 5.07398 81.5341 4.48485 82.0847 4.06278C82.6528 3.64072 83.3544 3.42969 84.1897 3.42969C84.3667 3.42969 84.5716 3.44728 84.8019 3.48245C85.0331 3.50003 85.2995 3.56158 85.6019 3.6671L85.4683 6.1731C85.2019 6.06758 84.9356 5.99723 84.6692 5.96207C84.4028 5.90931 84.1454 5.88292 83.8962 5.88292C83.2036 5.88292 82.5995 6.10275 82.0847 6.5424C81.5874 6.98205 81.17 7.57997 80.8325 8.33615C80.495 9.07478 80.2197 9.91013 80.0065 10.8422V17.4105H77.582Z"
                    fill="black"
                  />
                  <path
                    d="M93.9048 17.7535C92.8212 17.7535 91.8622 17.5951 91.0269 17.2786C90.2097 16.9445 89.5171 16.4696 88.9491 15.8541C88.3802 15.2386 87.954 14.5089 87.6704 13.6647C87.3859 12.8206 87.2441 11.8709 87.2441 10.8158C87.2441 9.74301 87.3859 8.75823 87.6704 7.86134C87.954 6.96446 88.372 6.18189 88.922 5.51363C89.4728 4.84535 90.1482 4.33536 90.9474 3.98365C91.7466 3.61434 92.6614 3.42969 93.6917 3.42969C94.5974 3.42969 95.4228 3.57917 96.1695 3.87813C96.9155 4.17709 97.5458 4.64312 98.0605 5.27621C98.5933 5.89172 98.9933 6.6743 99.2597 7.62394C99.5261 8.55599 99.6327 9.65509 99.5794 10.9213L88.7622 11.0004V9.36494L98.1138 9.28582L97.2884 10.3937C97.3769 9.28582 97.2704 8.37135 96.9687 7.65031C96.6663 6.92929 96.231 6.38412 95.663 6.01483C95.1122 5.64552 94.4548 5.46087 93.6917 5.46087C92.8745 5.46087 92.1548 5.67189 91.5335 6.09396C90.9113 6.51602 90.4318 7.12274 90.095 7.9141C89.7753 8.70551 89.6146 9.66389 89.6146 10.7894C89.6146 12.4073 89.9794 13.6471 90.7073 14.5089C91.4359 15.3529 92.5187 15.775 93.9581 15.775C94.5081 15.775 94.9884 15.7135 95.3966 15.5904C95.8228 15.4496 96.1777 15.265 96.4622 15.0364C96.7638 14.7902 97.004 14.5089 97.1818 14.1923C97.3769 13.8758 97.5277 13.5328 97.6343 13.1635L99.7663 13.6647C99.6064 14.2978 99.3573 14.8693 99.0204 15.3793C98.6999 15.8717 98.2917 16.2938 97.7941 16.6456C97.3146 16.9972 96.7556 17.2698 96.1163 17.4633C95.4761 17.6567 94.7392 17.7535 93.9048 17.7535Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_1918_2679"
                    x1="0"
                    y1="11"
                    x2="99.7664"
                    y2="11"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#2E62FF" />
                    <stop offset="0.317308" stop-color="#9747FF" />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear_1918_2679"
                    x1="-9.47368e-05"
                    y1="11.0013"
                    x2="99.7663"
                    y2="11.0013"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#2E62FF" />
                    <stop offset="0.317308" stop-color="#9747FF" />
                  </linearGradient>
                  <linearGradient
                    id="paint2_linear_1918_2679"
                    x1="-0.000534999"
                    y1="11.0016"
                    x2="99.7659"
                    y2="11.0016"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#2E62FF" />
                    <stop offset="0.317308" stop-color="#9747FF" />
                  </linearGradient>
                  <clipPath id="clip0_1918_2679">
                    <rect width="100" height="22" fill="white" />
                  </clipPath>
                </defs>
              </svg>
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