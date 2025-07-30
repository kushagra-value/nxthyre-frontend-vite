import React, { useState, useRef } from 'react';
import { X, Upload, FileText, RotateCcw, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { showToast } from '../utils/toast';
import { jobPostService, CreateJobData } from '../services/jobPostService';

interface CreateJobRoleModalProps {
  isOpen: boolean;
  workspaceId: number; 
  onClose: () => void;
  onJobCreated?: () => void; // Callback to refresh categories
}

const CreateJobRoleModal: React.FC<CreateJobRoleModalProps> = ({ isOpen, workspaceId, onClose, onJobCreated }) => {
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
    shareThirdParty: false
  });

  const [skillInput, setSkillInput] = useState('');
  const [refinementInput, setRefinementInput] = useState('');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null); // State for uploaded file
  const fileInputRef = useRef<HTMLInputElement>(null)

  const seniorityOptions = ['JUNIOR', 'SENIOR', 'LEAD', 'HEAD'];
  const departmentOptions = ['Human Resources', 'Marketing', 'Finance', 'Sales', 'Ops', 'Engineering', 'Admin', 'Others'];

  // Department mappings
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

  const dummyJD = `We are seeking a talented Head of Finance to join our dynamic team. The ideal candidate will have extensive experience in financial planning, analysis, and strategic decision-making.

Key Responsibilities:
• Lead financial planning and budgeting processes
• Oversee financial reporting and compliance
• Manage cash flow and investment strategies
• Collaborate with senior leadership on strategic initiatives
• Ensure regulatory compliance and risk management

Requirements:
• Bachelor's degree in Finance, Accounting, or related field
• 8+ years of progressive finance experience
• Strong analytical and leadership skills
• Experience with financial software and ERP systems
• Excellent communication and presentation abilities

We offer competitive compensation, comprehensive benefits, and opportunities for professional growth in a collaborative environment.`;

  const keyCompetencies = [
    'Financial Planning', 'Budget Management', 'Risk Assessment', 'Strategic Analysis',
    'Team Leadership', 'Regulatory Compliance', 'Cash Flow Management', 'Investment Strategy'
  ];

  const [competencies, setCompetencies] = useState(keyCompetencies);
  const [editableJD, setEditableJD] = useState(dummyJD);

  // Validation for text inputs (allow only alphanumeric, comma, space)
  const isValidTextInput = (value: string): boolean => /^[a-zA-Z0-9, ]*$/.test(value);

  // Validation for number inputs (only digits, no +,-,e)
  const isValidNumberInput = (value: string): boolean => /^[0-9]*$/.test(value);

  // Safe integer range for JavaScript (Number.MAX_SAFE_INTEGER)
  const MAX_SAFE_INTEGER = 999999999999;

  const handleSkillAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      if (!isValidTextInput(skillInput)) {
        showToast.error('Skills can only contain letters, numbers, commas, and spaces.');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && [ 'text/plain'].includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      showToast.error('Please upload a valid file ( .txt)');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && ['text/plain'].includes(droppedFile.type)) {
      setFile(droppedFile);
    } else {
      showToast.error('Please upload a valid file ( .txt)');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateStep1 = () => {
    const requiredFields = {
      title: formData.title.trim(),
      skills: formData.skills.length > 0,
      location: formData.location.trim(),
      seniority: formData.seniority.trim(),
      department: formData.department.trim() && departmentNameToId[formData.department],
      minExp: formData.minExp.trim() && isValidNumberInput(formData.minExp),
      maxExp: formData.maxExp.trim() && isValidNumberInput(formData.maxExp),
      minSalary: formData.confidential ? true : formData.minSalary.trim() && isValidNumberInput(formData.minSalary),
      maxSalary: formData.confidential ? true : formData.maxSalary.trim() && isValidNumberInput(formData.maxSalary),
      jobDescription: formData.uploadType === 'paste' ? formData.jobDescription.trim() : !!file,
    };

    const errors: string[] = [];

    if (!requiredFields.title) errors.push('Job title is required.');
    if (!isValidTextInput(formData.title)) errors.push('Job title contains invalid characters.');
    if (!requiredFields.skills) errors.push('At least one skill is required.');
    if (!requiredFields.location) errors.push('Location is required.');
    if (!isValidTextInput(formData.location)) errors.push('Location contains invalid characters.');
    if (!requiredFields.seniority) errors.push('Seniority is required.');
    if (!requiredFields.department) errors.push('Please select a valid department.');
    if (!requiredFields.minExp) errors.push('Minimum experience is required and must be a valid number.');
    if (!requiredFields.maxExp) errors.push('Maximum experience is required and must be a valid number.');
    if (!requiredFields.minSalary) errors.push('Minimum salary is required unless confidential.');
    if (!requiredFields.maxSalary) errors.push('Maximum salary is required unless confidential.');
    if (!requiredFields.jobDescription) errors.push('Job description is required when pasting text. or uploading a file.');

    // Validate experience range
    if (requiredFields.minExp && requiredFields.maxExp) {
      const minExp = parseInt(formData.minExp);
      const maxExp = parseInt(formData.maxExp);
      if (isNaN(minExp) || isNaN(maxExp)) {
        errors.push('Experience fields must be valid numbers.');
      } else if (minExp > maxExp) {
        errors.push('Minimum experience cannot be greater than maximum experience.');
      } else if (minExp < 0 || maxExp < 0 || minExp > MAX_SAFE_INTEGER || maxExp > MAX_SAFE_INTEGER) {
        errors.push('Experience values must be within valid integer range (0 to 999999999999).');
      }
    }

    // Validate salary range
    if (requiredFields.minSalary && requiredFields.maxSalary && !formData.confidential) {
      const minSalary = parseFloat(formData.minSalary);
      const maxSalary = parseFloat(formData.maxSalary);
      if (isNaN(minSalary) || isNaN(maxSalary)) {
        errors.push('Salary fields must be valid numbers.');
      } else if (minSalary > maxSalary) {
        errors.push('Minimum salary cannot be greater than maximum salary.');
      } else if (minSalary < 0 || maxSalary < 0 || minSalary > MAX_SAFE_INTEGER || maxSalary > MAX_SAFE_INTEGER) {
        errors.push('Salary values must be within valid integer range (0 to 999999999999).');
      }
    }

    return errors;
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

  const handleCreate = async () => {
    const errors = validateStep1();
    if (errors.length > 0) {
      showToast.error(errors.join(' '));
      return;
    }
    setIsLoading(true);
    try {
      const jobData: CreateJobData = {
        title: formData.title,
        location: formData.location,
        is_hybrid: formData.hybrid,
        seniority: formData.seniority,
        department: departmentNameToId[formData.department] || 8,
        experience_min_years: parseInt(formData.minExp) || 0,
        experience_max_years: parseInt(formData.maxExp) || 0,
        salary_min: formData.minSalary,
        salary_max: formData.maxSalary,
        is_salary_confidential: formData.confidential,
        visibility: formData.keepPrivate ? 'PRIVATE' : 'PUBLIC',
        enable_ai_interviews: formData.aiInterviews,
        skill_names: formData.skills,
        status: formData.shareExternally ? 'PUBLISHED' : 'DRAFT',
        workspace: workspaceId,
        ...(formData.uploadType === 'paste' ? { description_text: formData.jobDescription } : { description_file: file! }),
      };

      await jobPostService.createJob(jobData);
      showToast.success(formData.shareExternally ? 'Job role created and published successfully!' : 'Job role created successfully!');
      onJobCreated?.(); // Trigger refresh of categories
      onClose();
      setCurrentStep(1);
      setFile(null);
    } catch (error: any) {
      
      const errorMessage = error.response?.data?.department
        ? `Department error: ${error.response.data.department.join(' ')}`
        : error.message || 'Failed to create job role';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateAndPublish = async () => {
    const errors = validateStep1();
    if (errors.length > 0) {
      showToast.error(errors.join(' '));
      return;
    }
    setIsLoading(true);
    try {
      const jobData: CreateJobData = {
        title: formData.title,
        location: formData.location,
        is_hybrid: formData.hybrid,
        seniority: formData.seniority,
        department: parseInt(formData.department) || 1, // Assuming department ID 1 as default
        experience_min_years: parseInt(formData.minExp) || 0,
        experience_max_years: parseInt(formData.maxExp) || 0,
        salary_min: formData.minSalary,
        salary_max: formData.maxSalary,
        is_salary_confidential: formData.confidential,
        visibility: formData.keepPrivate ? 'PRIVATE' : 'PUBLIC',
        enable_ai_interviews: formData.aiInterviews,
        skill_names: formData.skills,
        status: formData.shareExternally ? 'PUBLISHED' : 'DRAFT',
        workspace: workspaceId, // Assuming default workspace ID
        ...(formData.uploadType === 'paste' ? { description_text: formData.jobDescription } : { description_file: file! }),
      };

      await jobPostService.createJob(jobData);
      showToast.success(formData.shareExternally ? 'Job role created and published successfully!' : 'Job role created successfully!');
      onClose();
      setCurrentStep(1);
      setFile(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.department
        ? `Department error: ${error.response.data.department.join(' ')}`
        : error.message || 'Failed to create job role';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    showToast.info('Feature coming Soon!');
  };

  const handleUpdate = () => {
    showToast.info('Feature Coming Soon!');
  };

  if (!isOpen) return null;

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
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" disabled={isLoading}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-900">CREATE JOB ROLE</h2>
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
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">ALLOW INBOUND APPLICATIONS</span>
                  </label>
                  {showTooltip === 'inbound' && (
                    <div className="absolute top-full left-0 mt-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10">
                      NxtHyre can post your jobs on social sites like LinkedIn to get a high number of job applicants (along with your LinkedIn as hiring POC)
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
                      disabled={isLoading}
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
                  <label 
                    className="flex items-center cursor-pointer"
                    onMouseEnter={() => setShowTooltip('shareExternally')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <input
                      type="checkbox"
                      checked={formData.shareExternally}
                      onChange={(e) => setFormData(prev => ({ ...prev, shareExternally: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">SHARE EXTERNALLY</span>
                  </label>
                  {showTooltip === 'shareExternally' && (
                    <div className="absolute top-full left-0 mt-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10">
                      Allow Sharing this job externally, so that it can be posted on Linkedin and Naukri job portals
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Job title"
                  value={formData.title}
                  onChange={(e) => {
                    if (isValidTextInput(e.target.value)) {
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
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={formData.location}
                      onChange={(e) => {
                        if (isValidTextInput(e.target.value)) {
                          setFormData(prev => ({ ...prev, location: e.target.value }));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="col-span-1 pt-5">
                  <span className="text-xs text-gray-700 font-semibold ml-3">Hybrid</span>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, hybrid: !prev.hybrid }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.hybrid ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      role="switch"
                      aria-checked={formData.hybrid}
                      disabled={isLoading}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.hybrid ? 'translate-x-6' : 'translate-x-1'
                        }`}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-3"
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.aiInterviews ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.aiInterviews ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Turning on this feature will enable AI interview as an initial screening round</p>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Exp Range <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Min exp"
                      value={formData.minExp}
                      onChange={(e) => {
                        if (isValidNumberInput(e.target.value)) {
                          setFormData(prev => ({ ...prev, minExp: e.target.value }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      placeholder="Max exp"
                      value={formData.maxExp}
                      onChange={(e) => {
                        if (isValidNumberInput(e.target.value)) {
                          setFormData(prev => ({ ...prev, maxExp: e.target.value }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="col-span-6">
                  <label className="block flex justify-between text-sm font-medium text-gray-700 mb-2">
                    Enter Salary Range {formData.confidential ? '' : <span className="text-red-500">*</span>}
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
                        if (isValidNumberInput(e.target.value)) {
                          setFormData(prev => ({ ...prev, minSalary: e.target.value }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading || formData.confidential}
                    />
                    <input
                      type="text"
                      placeholder="Max salary"
                      value={formData.maxSalary}
                      onChange={(e) => {
                        if (isValidNumberInput(e.target.value)) {
                          setFormData(prev => ({ ...prev, maxSalary: e.target.value }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading || formData.confidential}
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
                      onClick={() => setFormData(prev => ({ ...prev, uploadType: 'paste', jobDescription: '' }))}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        formData.uploadType === 'paste' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                      }`}
                      disabled={isLoading}
                    >
                      Paste Text
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, uploadType: 'upload', jobDescription: '' }))}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        formData.uploadType === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                      }`}
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
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {file ? `Selected file: ${file.name}` : 'Drag and drop your job description file here'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">or click to browse (.pdf, .doc, .docx, .txt)</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
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
                    onClick={handleUpdate}
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
                  onClick={formData.shareThirdParty ? handleCreateAndPublish : handleCreate}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : (formData.shareExternally ? 'Create & Publish' : 'Create')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJobRoleModal;