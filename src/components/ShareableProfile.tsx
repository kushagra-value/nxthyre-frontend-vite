import React, { useState, useEffect } from 'react';
import { Copy, Mail, ArrowLeft, User, Building2, GraduationCap, Award, Star, Phone } from 'lucide-react';
import { showToast } from '../utils/toast';
import { candidateService, ShareableProfileSensitiveCandidate } from '../services/candidateService';

interface ShareableProfileProps {
  candidateId: string;
  onBack?: () => void;
}
const ShareableProfile: React.FC<ShareableProfileProps> = ({ candidateId, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anonymizedCandidate, setAnonymizedCandidate] = useState<ShareableProfileSensitiveCandidate | null>(null);

  useEffect(() => {
    const fetchShareableProfile = async () => {
      setLoading(true);
      try {
          const data = await candidateService.getShareableProfile(candidateId);
          setAnonymizedCandidate(data);
        
        //   const dummyData: ShareableProfileSensitiveCandidate = {
        //     id: "ed51c22f-517c-4f71-884b-55b56c9bea1a",
        //     about: "Machine Learning Engineer | NLP, Deep Learning, MLOps | Healthcare AI",
        //     location: "Hyderabad, India",
        //     total_experience_years: 6.6,
        //     experience: [
        //       {
        //         job_title: "Machine Learning Engineer",
        //         location: "Remote",
        //         start_date: "2021-06-01",
        //         end_date: null,
        //         description: "Developed and deployed deep learning models for radiology report summarization and image-text cross-modal retrieval. Worked closely with radiologists to build annotation pipelines and establish data quality baselines. Designed custom CNN+Transformer hybrid architectures in PyTorch, achieving 92% F1 score in disease classification. Built internal autoML tooling for model benchmarking and hyperparameter tuning using Optuna. Also led the end-to-end MLOps setup using MLflow and AWS SageMaker for model versioning, reproducibility, and monitoring in production. Mentored 2 interns on explainable AI (GradCAM, SHAP) and supervised learning projects.",
        //         is_current: true
        //       },
        //       {
        //         job_title: "Data Scientist",
        //         location: "Bangalore, India",
        //         start_date: "2018-11-01",
        //         end_date: "2021-05-01",
        //         description: "Worked on natural language understanding (NLU) problems in digital health. Built intent recognition models for symptom checkers using BERT and fastText embeddings. Contributed to internal Python packages for text preprocessing and spell correction tailored to medical transcripts. Improved chatbot performance by 15% by integrating rule-based fallback layers. Also explored weak supervision and active learning strategies to improve low-resource language coverage. Supported product analytics using cohort tracking and built dashboards in Streamlit for internal stakeholders.",
        //         is_current: false
        //       }
        //     ],
        //     education: [
        //       {
        //         degree: "M.Tech",
        //         specialization: "Artificial Intelligence",
        //         start_date: "2016-07-01",
        //         end_date: "2018-06-01"
        //       },
        //       {
        //         degree: "B.E.",
        //         specialization: "Computer Science",
        //         start_date: "2012-07-01",
        //         end_date: "2016-06-01"
        //       }
        //     ],
        //     skills: [
        //       {
        //         skill: "PyTorch",
        //         number_of_endorsements: 1
        //       },
        //       {
        //         skill: "Transformers",
        //         number_of_endorsements: 0
        //       },
        //       {
        //         skill: "NLP",
        //         number_of_endorsements: 1
        //       },
        //       {
        //         skill: "MLOps",
        //         number_of_endorsements: 0
        //       },
        //       {
        //         skill: "AWS SageMaker",
        //         number_of_endorsements: 0
        //       }
        //     ],
        //     certifications: [
        //       {
        //         name: "AWS Certified Machine Learning - Specialty",
        //         issuer: "Amazon Web Services",
        //         license_number: "AWS-ML-SP-1012",
        //         issued_date: "2023-01-01",
        //         valid_until: "2026-01-01",
        //         url: "https://aws.amazon.com/verification/aws-ml-sp-1012"
        //       },
        //       {
        //         name: "Deep Learning Specialization",
        //         issuer: "Coursera / DeepLearning.AI",
        //         license_number: "DL-3021-998",
        //         issued_date: "2019-08-01",
        //         valid_until: null,
        //         url: "https://coursera.org/certificate/dl-3021-998"
        //       }
        //     ]
        //   };
        // setAnonymizedCandidate(dummyData);
        
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
    window.location.href = '/';
  };

  const profileTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'experience', label: 'Experience', icon: Building2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Star },
    { id: 'certifications', label: 'Certifications', icon: Award }
  ];

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

  if (error || !anonymizedCandidate) {
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-2 py-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          

          {/* Content */}
          <div className="p-6">
            
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                    <User className="w-4 h-4 text-white " />
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-gray-700">******** ********</span>
                    </div>
                    <div className="flex gap-2">
                      <Mail className="w-4 h-4"/>
                      <span className="text-gray-700">*********************</span>
                    </div>
                    <div className="flex gap-2">
                      <Phone className="w-4 h-4"/>
                      <span className="text-gray-700">**********</span>
                    </div>
                  </div>
                </div>
                
               
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{anonymizedCandidate.about}</p>
                </div>

                <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Experience</h3>
                {anonymizedCandidate.experience.map((exp:any, index:number) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 relative">
                    <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                    <h4 className="font-medium text-gray-900">{exp.job_title}</h4>
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <Building2 className="w-4 h-4"/>
                        <span className="text-gray-700">********* ********* *********</span>
                      </div>
                      <p className="text-gray-500">{exp.start_date} - {exp.end_date || 'Present'}</p>
                    </div>
                    <p className="text-gray-700 mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Education</h3>
                {anonymizedCandidate.education.map((edu:any, index:number) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4 relative">
                    <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                    <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <GraduationCap className="w-4 h-4"/>
                        <span className="text-gray-700">********* ********* *********</span>
                      </div>
                      <p className="text-gray-500">{edu.specialization}</p>
                      <p className="text-gray-500">{edu.start_date} - {edu.end_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            

           
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {anonymizedCandidate.skills.map((skill:any, index:number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill.skill} ({skill.number_of_endorsements} endorsements)
                    </span>
                  ))}
                </div>
              </div>
            

            
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Certifications</h3>
                {anonymizedCandidate.certifications.length > 0 ? (
                  anonymizedCandidate.certifications.map((cert:any, index:number) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 relative">
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <Award className="w-4 h-4"/>
                          <span className="text-gray-700">********* ********* *********</span>
                        </div>
                        <p className="text-gray-500">{cert.issued_date}</p>
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