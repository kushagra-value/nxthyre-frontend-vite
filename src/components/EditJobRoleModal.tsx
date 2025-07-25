import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, ChevronDown, RotateCcw, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { showToast } from '../utils/toast';
import { jobPostService, Job, CreateJobData } from '../services/jobPostService';

interface EditJobRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  onJobUpdated?: () => void; // Added callback for job update
}

const EditJobRoleModal: React.FC<EditJobRoleModalProps> = ({ isOpen, onClose, jobId, onJobUpdated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    allowInbound: true,
    keepPrivate: false,
    shareExternally: false,
    title: '',
    skills: [] as string[],
    location: '',
    hybrid: false,
    seniority: '',
    department: '',
    aiInterviews: false,
    minExp: '',
    maxExp: '',
    minSalary: '',
    maxSalary: '',
    confidential: false,
    jobDescription: '',
    uploadType: 'paste' as 'paste' | 'upload',
  });

  const [skillInput, setSkillInput] = useState('');
  const [refinementInput, setRefinementInput] = useState('');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const seniorityOptions = ['JUNIOR', 'SENIOR', 'LEAD', 'HEAD'];
  const departmentOptions = ['Human Resources', 'Marketing', 'Finance', 'Sales', 'Ops', 'Engineering', 'Admin', 'Others'];

  const departmentMap: { [key: number]: string } = {
    1: 'Human Resources',
    2: 'Marketing',
    3: 'Finance',
    4: 'Sales',
    5: 'Ops',
    6: 'Engineering',
    7: 'Admin',
    8: 'Others',
  };

  const departmentNameToId: { [key: string]: number } = {
    'Human Resources': 1,
    'Marketing': 2,
    'Finance': 3,
    'Sales': 4,
    'Ops': 5,
    'Engineering': 6,
    'Admin': 7,
    'Others': 8,
  };

  const dummyJD = `We are seeking a talented Head of Finance to join our dynamic team...`;
  const keyCompetencies = [
    'Financial Planning', 'Budget Management', 'Risk Assessment', 'Strategic Analysis',
    'Team Leadership', 'Regulatory Compliance', 'Cash Flow Management', 'Investment Strategy'
  ];

  const [competencies, setCompetencies] = useState(keyCompetencies);
  const [editableJD, setEditableJD] = useState(dummyJD);

  const validateTextInput = (value: string): boolean => {
    return /^[a-zA-Z0-9,\s]*$/.test(value);
  };

  const validateNumberInput = (value: string): boolean => {
    return /^[0-9]*$/.test(value) && value !== '' && parseInt(value) >= 0 && parseInt(value) <= 2147483647;
  };

  useEffect(() => {
    if (isOpen && jobId) {
      setIsFetching(true);
      jobPostService.getJob(jobId)
        .then((job: Job) => {
          setFormData({
            allowInbound: job.visibility === 'PUBLIC',
            keepPrivate: job.visibility === 'PRIVATE',
            shareExternally: job.status === 'PUBLISHED',
            title: job.title,
            skills: job.skills,
            location: job.location,
            hybrid: job.is_hybrid,
            seniority: job.seniority,
            department: departmentMap[job.department] || 'Others',
            aiInterviews: job.enable_ai_interviews,
            minExp: job.experience_min_years.toString(),
            maxExp: job.experience_max_years.toString(),
            minSalary: job.salary_min,
            maxSalary: job.salary_max,
            confidential: job.is_salary_confidential,
            jobDescription: job.description,
            uploadType: 'paste',
          });
          setEditableJD(job.description);
        })
        .catch((error) => {
          showToast.error(error.message || 'Failed to fetch job details');
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [isOpen, jobId]);

  const validateStep1 = () => {
    const requiredFields = {
      title: formData.title.trim(),
      skills: formData.skills.length > 0,
      location: formData.location.trim(),
      seniority: formData.seniority.trim(),
      department: formData.department.trim(),
      minExp: formData.minExp.trim() && validateNumberInput(formData.minExp),
      maxExp: formData.maxExp.trim() && validateNumberInput(formData.maxExp),
      minSalary: formData.confidential ? true : formData.minSalary.trim() && validateTextInput(formData.minSalary),
      maxSalary: formData.confidential ? true : formData.maxSalary.trim() && validateTextInput(formData.maxSalary),
      jobDescription: formData.uploadType === 'paste' ? formData.jobDescription.trim() : true,
    };

    const errors: string[] = [];

    if (!requiredFields.title) errors.push('Job title is required.');
    if (!validateTextInput(formData.title)) errors.push('Job title contains invalid characters.');
    if (!requiredFields.skills) errors.push('At least one skill is required.');
    if (!requiredFields.location) errors.push('Location is required.');
    if (!validateTextInput(formData.location)) errors.push('Location contains invalid characters.');
    if (!requiredFields.seniority) errors.push('Seniority is required.');
    if (!requiredFields.department) errors.push('Department is required.');
    if (!requiredFields.minExp) errors.push('Minimum experience is required and must be a valid positive integer.');
    if (!requiredFields.maxExp) errors.push('Maximum experience is required and must be a valid positive integer.');
    if (!requiredFields.minSalary) errors.push('Minimum salary is required unless confidential.');
    if (!requiredFields.maxSalary) errors.push('Maximum salary is required unless confidential.');
    if (!requiredFields.jobDescription) errors.push('Job description is required when pasting text.');

    if (requiredFields.minExp && requiredFields.maxExp) {
      const minExp = parseInt(formData.minExp);
      const maxExp = parseInt(formData.maxExp);
      if (minExp > maxExp) {
        errors.push('Minimum experience cannot be greater than maximum experience.');
      }
    }

    return errors;
  };

  const handleSkillAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      if (!validateTextInput(skillInput)) {
        showToast.error('Skills can only contain letters, numbers, spaces, and commas');
        return;
      }
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const removeCompetency = (index: number) => {
    setCompetencies(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    const errors = validateStep1();
    if (errors.length > 0) {
      showToast.error(errors.join(' '));
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleUpdate = async () => {
    const errors = validateStep1();
    if (errors.length > 0) {
      showToast.error(errors.join(' '));
      return;
    }
    setIsLoading(true);
    try {
      const jobData: Partial<CreateJobData> = {
        title: formData.title,
        location: formData.location,
        is_hybrid: formData.hybrid,
        seniority: formData.seniority || "null",
        department: departmentNameToId[formData.department] || 1,
        experience_min_years: parseInt(formData.minExp) || 0,
        experience_max_years: parseInt(formData.maxExp) || 0,
        salary_min: formData.minSalary,
        salary_max: formData.maxSalary,
        is_salary_confidential: formData.confidential,
        visibility: formData.keepPrivate ? 'PRIVATE' : 'PUBLIC',
        enable_ai_interviews: formData.aiInterviews,
        description: formData.jobDescription,
        skill_names: formData.skills,
        status: formData.shareExternally ? 'PUBLISHED' : 'DRAFT',
        workspace: 1,
      };

      await jobPostService.updateJob(jobId, jobData);
      showToast.success(formData.shareExternally ? 'Job role updated and published successfully!' : 'Job role updated successfully!');
      onJobUpdated?.(); // Trigger callback to refresh categories
      onClose();
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update job role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    showToast.info('Job description regenerated!');
  };

  const handleUpdateJD = () => {
    showToast.success('Job description updated!');
  };

  if (!isOpen) return null;

  if (isFetching) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between">
            <h2></h2>
            <div className="flex ml-8 mb-4 justify-center items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep >= 1 ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1 
              </div>
              <span>Basic Details</span>
              <div className={`w-20 h-[1px] mt-1 ${currentStep >= 2 ? 'bg-blue-400' : 'bg-gray-900'}`}></div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep >= 2 ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span>Update & Refine JD</span>
            </div>
            <div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-900">EDIT JOB ROLE</h2>
          </div>
        </div>

        <div className="p-6">
          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="flex space-x-6">
                <div className="relative">
                  <label 
                    className="flex items-center cursor-pointer"
                    onMouseEnter={() => setShowTooltip('inbound')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="inbound"
                      checked={formData.allowInbound}
                      onChange={() => setFormData(prev => ({ ...prev, allowInbound: true, keepPrivate: false }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">ALLOW INBOUND APPLICATIONS</span>
                  </label>
                  {showTooltip === 'inbound' && (
                    <div className="absolute top-full left-0 mt-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10">
                      NxtHyre can post your jobs on social sites like LinkedIn to get high number of job applicants
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <label 
                    className="flex items-center cursor-pointer"
                    onMouseEnter={() => setShowTooltip('private')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={formData.keepPrivate}
                      onChange={() => setFormData(prev => ({ ...prev, allowInbound: false, keepPrivate: true }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">KEEP IT PRIVATE</span>
                  </label>
                  {showTooltip === 'private' && (
                    <div className="absolute top-full left-0 mt-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10">
                      NxtHyre will not post LinkedIn on NxtHyre job portal
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.shareExternally}
                      onChange={(e) => setFormData(prev => ({ ...prev, shareExternally: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">SHARE EXTERNALLY</span>
                    {showTooltip === 'shareExternally' && (
                    <div className="absolute top-full left-0 mt-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10">
                      Allow sharing this job externally, so that it can be posted on LinkedIn and Naukri job portals
                    </div>
                  )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Job title"
                  value={formData.title}
                  onChange={(e) => {
                    if (validateTextInput(e.target.value)) {
                      setFormData(prev => ({ ...prev, title: e.target.value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter skills and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillAdd}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <div className="flex flex-wrap gap-2 mt-2 max-h-20 overflow-hidden">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                        {skill}
                        <button onClick={() => removeSkill(index)} className="ml-1 text-blue-600 hover:text-blue-800" disabled={isLoading}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => {
                      if (validateTextInput(e.target.value)) {
                        setFormData(prev => ({ ...prev, location: e.target.value }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
                <div className="col-span-1 pt-5">
                  <span className="text-xs text-gray-700 font-semibold ml-3">Hybrid</span>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, hybrid: !prev.hybrid }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.hybrid ? 'bg-blue-500' : 'bg-gray-300'}`}
                      role="switch"
                      aria-checked={formData.hybrid}
                      disabled={isLoading}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hybrid ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seniority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.seniority}
                    onChange={(e) => setFormData(prev => ({ ...prev, seniority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">Select seniority</option>
                    {seniorityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">Select department</option>
                    {departmentOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">AI Interviews</span>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, aiInterviews: !prev.aiInterviews }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.aiInterviews ? 'bg-blue-600' : 'bg-gray-300'}`}
                    disabled={isLoading}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.aiInterviews ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Turning on this feature will enable AI interview, as an initial screening round</p>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Range (Years) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min exp"
                      value={formData.minExp}
                      onChange={(e) => {
                        if (validateNumberInput(e.target.value)) {
                          setFormData(prev => ({ ...prev, minExp: e.target.value }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="1"
                      disabled={isLoading}
                    />
                    <input
                      type="number"
                      placeholder="Max exp"
                      value={formData.maxExp}
                      onChange={(e) => {
                        if (validateNumberInput(e.target.value)) {
                          setFormData(prev => ({ ...prev, maxExp: e.target.value }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="1"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="col-span-6">
                  <label className="block flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Salary Range <span className="text-red-500">{formData.confidential ? '' : '*'}</span></span>
                    <div className="flex items-end">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.confidential}
                          onChange={(e) => setFormData(prev => ({ ...prev, confidential: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled={isLoading}
                        />
                        <span className="ml-1 text-sm text-gray-700">Keep it confidential</span>
                      </label>
                    </div>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Min salary"
                      value={formData.minSalary}
                      onChange={(e) => {
                        if (validateTextInput(e.target.value)) {
                          setFormData(prev => ({ ...prev, minSalary: e.target.value }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={formData.confidential || isLoading}
                    />
                    <input
                      type="text"
                      placeholder="Max salary"
                      value={formData.maxSalary}
                      onChange={(e) => {
                        if (validateTextInput(e.target.value)) {
                          setFormData(prev => ({ ...prev, maxSalary: e.target.value }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={formData.confidential || isLoading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-4 mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Job Description <span className="text-red-500">*</span>
                  </span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, uploadType: 'paste' }))}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${formData.uploadType === 'paste' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
                      disabled={isLoading}
                    >
                      Paste Text
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, uploadType: 'upload' }))}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${formData.uploadType === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
                      disabled={isLoading}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {formData.uploadType === 'paste' ? (
                  <textarea
                    placeholder="Paste your job description here..."
                    value={formData.jobDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                    disabled={isLoading}
                  />
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Drag and drop your job description file here</p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                    <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" disabled={isLoading} />
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  disabled={isLoading}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-100 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">AI-Generated Job Description</h3>
                  <button
                    onClick={handleRegenerate}
                    className="px-3 py-1.5 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center text-sm"
                    disabled={isLoading}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Regenerate
                  </button>
                </div>
                <div className="bg-white rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre
                    className="text-sm text-gray-700 whitespace-pre-wrap font-sans outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    contentEditable="true"
                    onInput={(e) => setEditableJD(e.currentTarget.innerText)}
                    suppressContentEditableWarning={true}
                  >
                    {editableJD}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {competencies.map((competency, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                      {competency}
                      <button onClick={() => removeCompetency(index)} className="ml-2 text-blue-600 hover:text-blue-800" disabled={isLoading}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Refine JD (e.g. 'Add remote work details')</label>
                <div className="flex justify-between">
                  <textarea
                    placeholder="Enter refinement instructions..."
                    value={refinementInput}
                    onChange={(e) => setRefinementInput(e.target.value)}
                    className="w-[87%] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11 resize-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleUpdateJD}
                    className="px-[20px] py-[9px] bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={isLoading}
                  >
                    Update
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : (formData.shareExternally ? 'Update & Publish' : 'Update')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditJobRoleModal;