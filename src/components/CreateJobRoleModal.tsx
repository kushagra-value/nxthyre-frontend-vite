import React, { useState, useRef , useEffect } from 'react';
import { X, Upload, FileText, RotateCcw, ArrowLeft, ArrowRight, Bold, Italic, Underline, List, CheckCircle, Info, Check, Plus  } from 'lucide-react';
import { showToast } from '../utils/toast';
import { jobPostService, CreateJobData } from '../services/jobPostService';

interface CreateJobRoleModalProps {
  isOpen: boolean;
  workspaceId: number;
  handlePipelinesClick?: () => void; // Optional callback for pipeline click 
  onClose: () => void;
  onJobCreated?: () => void; // Callback to refresh categories
}

const CreateJobRoleModal: React.FC<CreateJobRoleModalProps> = ({ isOpen, workspaceId, handlePipelinesClick, onClose, onJobCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [formData, setFormData] = useState({
    allowInbound: true,
    keepPrivate: false,
    shareExternally: false,
    title: '',
    skills: [] as string[],
    location: '',
    workApproach: 'Hybrid' as 'Onsite' | 'Remote' | 'Hybrid',
    hybrid: true,
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
    shareThirdParty: false,
    codingRound: false,
  });

  const [skillInput, setSkillInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [competencyInput, setCompetencyInput] = useState('');
  const [refinementInput, setRefinementInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null); // State for uploaded file
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  const seniorityOptions = ['JUNIOR', 'SENIOR', 'LEAD', 'HEAD', 'INTERN'];
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
  const MIN_DESCRIPTION_LENGTH = 10;

  const RadioToggle: React.FC<{
    label: string;
    isSelected: boolean;
    onClick: () => void;
    disabled?: boolean;
  }> = ({ label, isSelected, onClick, disabled = false }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-start px-4 py-2 rounded-lg  text-md font-[400] transition-all duration-200
        ${isSelected 
          ? 'bg-[#ECF1FF] text-blue-700' 
          : 'bg-[#F0F0F0]  text-gray-700 hover:bg-gray-100'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-center">
        <div
          className={`
            w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200
            ${isSelected 
              ? 'border-blue-500 bg-white' 
              : 'border-gray-300 bg-white'
            }
          `}
        >
          {isSelected && (
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          )}
        </div>
        {label}
      </div>
    </button>
  );

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

  const handleLocationAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && locationInput.trim()) {
      if (!isValidTextInput(locationInput)) {
        showToast.error('Location can only contain letters, numbers, commas, and spaces.');
        return;
      }
      setFormData(prev => ({
        ...prev,
        location: locationInput.trim()
      }));
      setLocationInput('');
      setLocationSuggestions([]);
    }
  };

  const handleLocationSelect = (location: string) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
    setLocationInput('');
    setLocationSuggestions([]);
  };

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocationInput(query);
    if (query.length > 2) {
      try {
        const suggestions = await jobPostService.getLocationSuggestions(query);
        const uniqueSuggestions = [...new Set(suggestions)].filter(s => s !== formData.location);
        setLocationSuggestions(uniqueSuggestions);
      } catch (error) {
        showToast.error('Failed to fetch location suggestions');
      }
    } else {
      setLocationSuggestions([]);
    }
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
    if (!requiredFields.jobDescription) errors.push('Job description is required when pasting text or uploading a file.');
    if (formData.uploadType === 'paste' && formData.jobDescription.trim().length < MIN_DESCRIPTION_LENGTH) {
      errors.push(`Job description must be at least ${MIN_DESCRIPTION_LENGTH} characters long.`);
    }

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
      } else if (minSalary < 999 || maxSalary < 999 || minSalary > MAX_SAFE_INTEGER || maxSalary > MAX_SAFE_INTEGER) {
        errors.push('Salary values must be within valid integer range (1000 to 999999999999).');
      }
    }

    return errors;
  };

   const addCompetency = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && competencyInput.trim()) {
        setCompetencies(prev => [...prev, competencyInput.trim()]);
        setCompetencyInput('');
      }
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

    if (formData.uploadType === 'upload' && !file) {
      showToast.error('Please upload a file for the job description.');
      return;
    }
    if (formData.uploadType === 'paste' && formData.jobDescription.trim().length < MIN_DESCRIPTION_LENGTH) {
      showToast.error(`Job description must be at least ${MIN_DESCRIPTION_LENGTH} characters long.`);
      return;
    }

    setIsLoading(true);
    try {
      const jobData: CreateJobData = {
        title: formData.title,
        location: formData.location,
        is_hybrid: formData.workApproach === 'Hybrid',
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
        status: formData.keepPrivate ? 'DRAFT' : 'PUBLISHED',
        workspace: workspaceId,
        ...(formData.uploadType === 'paste' ? { description_text: formData.jobDescription } : { description_file: file! }),
      };

      await jobPostService.createJob(jobData);
      showToast.success(formData.shareExternally ? 'Job role created and published successfully!' : 'Job role created successfully!');
      onJobCreated?.(); // Trigger refresh of categories
      onClose();
      setShowSuccessModal(true);
      setCurrentStep(1);
      setFile(null);
    } catch (error: any) {
      
      const errorMessage = error.response?.data?.description
        ? `Description error: ${error.response.data.description}`
        : error.response?.data?.description_file
        ? `File upload error: ${error.response.data.description_file}`
        : error.response?.data?.department
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

    
    if (formData.uploadType === 'upload' && !file) {
      showToast.error('Please upload a file for the job description.');
      return;
    }
    if (formData.uploadType === 'paste' && formData.jobDescription.trim().length < MIN_DESCRIPTION_LENGTH) {
      showToast.error(`Job description must be at least ${MIN_DESCRIPTION_LENGTH} characters long.`);
      return;
    }


    setIsLoading(true);
    try {
      const jobData: CreateJobData = {
        title: formData.title,
        location: formData.location,
        is_hybrid: formData.workApproach === 'Hybrid',
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
        status: formData.keepPrivate ? 'DRAFT' : 'PUBLISHED',
        workspace: workspaceId, // Assuming default workspace ID
        ...(formData.uploadType === 'paste' ? { description_text: formData.jobDescription } : { description_file: file! }),
      };

      await jobPostService.createJob(jobData);
      showToast.success(formData.shareExternally ? 'Job role created and published successfully!' : 'Job role created successfully!');
      onClose();
      setCurrentStep(1);
      setFile(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.description
        ? `Description error: ${error.response.data.description}`
        : error.response?.data?.description_file
        ? `File upload error: ${error.response.data.description_file}`
        : error.response?.data?.department
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

  const handleCancel = () => {
    if (formData.title || formData.skills.length > 0) {
      setShowCancelModal(true);
    } else {
      onClose();
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    onClose();
    resetForm();
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
    resetForm();
  };
  const handlePipelineButtonClick = () => {
    handlePipelinesClick?.();
    setShowSuccessModal(false);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      allowInbound: true,
      keepPrivate: false,
      shareExternally: false,
      title: '',
      skills: [],
      location: '',
      workApproach: 'Hybrid',
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
      uploadType: 'paste',
      shareThirdParty: false,
      codingRound: false,
    });
    setSkillInput('');
    setLocationInput('');
    setLocationSuggestions([]);
    setCompetencyInput('');
    setFile(null);
    setCurrentStep(1);
    setValidationError('');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (showSuccessModal) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-green-500 mb-3">Successfully Created!</h2>
            <p className="text-gray-600 mb-8">Your Job role is created</p>
            <div className="flex gap-3">
              <button
                onClick={handleSuccessClose}
                className="flex-1 px-6 py-3 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Back to Home
              </button>
              <button
                onClick={handlePipelineButtonClick}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Pipeline
              </button>
            </div>
          </div>
        </div>
      );
    }



  if (!isOpen) return null;

  // Cancel Confirmation Modal
  if (showCancelModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Confirm Cancel</h2>
          <p className="text-gray-600 mb-8">Are you sure you want to cancel? All progress will be lost.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Continue Editing
            </button>
            <button
              onClick={confirmCancel}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white relative rounded-2xl shadow-xl w-full max-w-6xl max-h-[98vh]  flex flex-col overflow-hidden">
        <div className="p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded-lg mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-md font-medium text-gray-900">Create Job Role</span>
            </div>
            
            <button onClick={handleCancel} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>


          {/* Progress Indicator */}
          <div className="w-1/2 bg-white absolute z-10 top-24 left-1/2 transform -translate-x-1/2 -translate-y-1/2  flex flex-col items-center justify-center space-x-4">
            <div className="flex items-center space-x-64">
              <div className='flex flex-col justify-center gap-2 items-center'>
                <span className={`ml-2 text-sm ${currentStep >= 1 ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                  Basic Info
                </span>
                <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className='flex flex-col justify-center gap-2 items-center'>
                <span className={`ml-2 text-sm ${currentStep >= 2 ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                  Update and Refine JD
                </span>
                <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>
            <div className="relative top-[-6px] right-[25px]">              
              <div className={`w-[351px] h-px ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex-1 overflow-y-auto mt-2 pr-10">
                {currentStep === 1 ? (
                  <div className="text-center mb-2">
                    <h2 className="text-md font-[400] text-gray-900 mb-2">Add Basic Details</h2>
                    <p className="text-gray-500 text-sm">Fill out the basic information of the job</p>
                  </div>
                  ):(
                    <div className="text-center mb-8">
                    <h2 className="text-md font-[400] text-gray-900 mb-2">Update JD</h2>
                    <p className="text-gray-500 text-sm">Refine information of the job</p>
                  </div>
                  )}
            </div>
          </div>
          
        </div>
        

        <div className="flex-1 overflow-y-auto px-72">
          {currentStep === 1 ? (
            <div className="space-y-6 mt-6">
              

              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="AI Research Engineer"
                  value={formData.title}
                  onChange={(e) => {
                    if (isValidTextInput(e.target.value)) {
                      setFormData(prev => ({ ...prev, title: e.target.value }));
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg px-4 pt-2 pb-2">
                  <input
                    type="text"
                    placeholder="Type skill and Press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillAdd}
                    className="w-full border-none outline-none text-sm placeholder-gray-400 mb-3"
                    disabled={isLoading}
                  />
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                        <X className="w-3 h-3 mr-1 cursor-pointer" onClick={() => removeSkill(index)} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative border border-gray-300 rounded-lg px-4 pt-2 pb-2">
                    <input
                      type="text"
                      ref={locationInputRef}
                      placeholder="Type location and Press Enter"
                      value={locationInput}
                      onChange={handleLocationChange}
                      onKeyPress={handleLocationAdd}
                      className=" w-full border-none outline-none text-sm placeholder-gray-400 mb-3"
                      disabled={isLoading}
                    />
                    {locationSuggestions.length > 0 && (
                      <div className="absolute left-0 z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {locationSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-4 py-3 text-md text-gray-700 hover:bg-blue-100 cursor-pointer"
                            onClick={() => handleLocationSelect(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {formData.location && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                          <X className="w-3 h-3 mr-1 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, location: '' }))} />
                          {formData.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              {/* Seniority and Department Option */}
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

              {/* Work Approach as Radio Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Work Approach <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <RadioToggle
                    label="Onsite"
                    isSelected={formData.workApproach === 'Onsite'}
                    onClick={() => setFormData(prev => ({ ...prev, workApproach: 'Onsite' }))}
                    disabled={isLoading}
                  />
                  <RadioToggle
                    label="Remote"
                    isSelected={formData.workApproach === 'Remote'}
                    onClick={() => setFormData(prev => ({ ...prev, workApproach: 'Remote' }))}
                    disabled={isLoading}
                  />
                  <RadioToggle
                    label="Hybrid"
                    isSelected={formData.workApproach === 'Hybrid'}
                    onClick={() => setFormData(prev => ({ ...prev, workApproach: 'Hybrid' }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

            <div className="flex flex-col items-start space-y-3">
              <span className="text-sm font-medium text-gray-700">Job Post Control</span>
                <div className="flex relative">
                  <RadioToggle
                    label="Allow Inbound Applications"
                    isSelected={formData.allowInbound}
                    onClick={() => setFormData(prev => ({ ...prev, allowInbound: true, keepPrivate: false }))}
                    disabled={isLoading}
                  />
                  <label 
                    className="flex items-center cursor-pointer"
                    onMouseEnter={() => setShowTooltip('inbound')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    {/* <input
                      type="radio"
                      name="privacy"
                      value="inbound"
                      checked={formData.allowInbound}
                      onChange={() => setFormData(prev => ({ ...prev, allowInbound: true, keepPrivate: false }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      disabled={isLoading}
                    /> */}
                    <span className="ml-2  px-2 text-sm bg-gray-200 rounded-full font-medium text-gray-700">!</span>
                  </label>
                  {showTooltip === 'inbound' && (
                    <div className="absolute top-full left-0 mt-2 w-80 p-3 bg-gray-50 text-gray-500 text-sm rounded-lg shadow-lg z-10">
                      NxtHyre can post your jobs on social sites like LinkedIn to get a high number of job applicants (along with your LinkedIn as hiring POC)
                    </div>
                  )}
                </div>
                
                <div className="flex relative">
                  <RadioToggle
                    label="Keep It Private"
                    isSelected={formData.keepPrivate}
                    onClick={() => setFormData(prev => ({ ...prev, allowInbound: false, keepPrivate: true}))}
                    disabled={isLoading}
                  />
                  <label 
                    className="flex items-center cursor-pointer"
                    onMouseEnter={() => setShowTooltip('private')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    
                    <span className="ml-2  px-2 text-sm bg-gray-200 rounded-full font-medium text-gray-700">!</span>
                  </label>
                  {showTooltip === 'private' && (
                    <div className="absolute top-full left-0 mt-2 w-80 p-3 bg-gray-50 text-gray-500 text-sm rounded-lg shadow-lg z-10">
                       NxtHyre will not post LinkedIn on NxtHyre job portal
                    </div>
                  )}
                </div>
              </div>

              <div className='border-y-2 border-dotted border-gray-400 py-6 mt-6'>
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
                <p className="text-xs text-gray-500 mt-1">Turning on this feature will enable AI interview, as a secondary screening round</p>
              </div>
              <div className='border-b-2 border-dotted border-gray-400 pb-6 mt-6'>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Coding Round</span>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, codingRound: !prev.codingRound }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.codingRound ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.codingRound ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Turning on this feature will enable Coding round, as a initial screening round to make more efficient screening</p>
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
                
              </div>
              <div className="grid grid-cols-12 gap-4">
                
                <div className="col-span-12">
                  <label className="block flex text-sm font-medium text-gray-700 mb-2">
                    Enter Salary Range {formData.confidential ? '' : <span className="text-red-500">*</span>}
                    
                  </label>
                  <div className="flex w-full space-x-2">
                    <input
                      type="text"
                      placeholder="Min salary"
                      value={formData.minSalary}
                      onChange={(e) => {
                        if (isValidNumberInput(e.target.value)) {
                          setFormData(prev => ({ ...prev, minSalary: e.target.value }));
                        }
                      }}
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500  ${
                        formData.confidential ? 'bg-gray-100 text-gray-400' : ''
                      }`}
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
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formData.confidential ? 'bg-gray-100 text-gray-400' : ''}`}
                      disabled={isLoading || formData.confidential}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, confidential: !prev.confidential }))}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-md font-[400] transition-all duration-200 ${
                        formData.confidential
                          ? 'bg-[#ECF1FF] text-blue-600'
                          : 'bg-[#F0F0F0] text-gray-400'
                      }`}
                      disabled={isLoading}
                    >
                      {formData.confidential ? (
                        <>
                          <div className="flex items-center justify-center w-5 h-5 border border-blue-600 rounded-full">
                            <Check className="w-3 h-3 text-blue-600" />
                          </div>
                          Confidential
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-gray-400" />
                          Confidential
                        </>
                      )}
                    </button>
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
                    <p className="text-xs text-gray-500 mt-1">or click to browse (.txt)</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".txt"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>

              
            </div>
          ) : (
            <div className="space-y-6">
              {/* Title Section */}
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Summary of JD</h2>
                <p className="text-gray-500 text-sm">Verification of the JD and submission of the job</p>
              </div>

              {/* AI-Generated Job Description */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">AI-Generated Job Description</h3>
                  <button
                    onClick={() => showToast.info('Feature coming soon!')}
                    className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                    disabled={isLoading}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Regenerate
                  </button>
                </div>
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-3">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Bold className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Italic className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Underline className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <List className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                  <textarea
                    value={editableJD}
                    onChange={(e) => setEditableJD(e.target.value)}
                    className="w-full h-48 resize-none border-none outline-none text-sm text-gray-700 leading-relaxed"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Key Competencies */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Competencies</h3>
                <div className="border border-gray-300 rounded-lg p-4">
                  <input
                    type="text"
                    placeholder="Type competency..."
                    value={competencyInput}
                    onChange={(e) => setCompetencyInput(e.target.value)}
                    onKeyPress={addCompetency}
                    className="w-full border-none outline-none text-sm placeholder-gray-400 mb-3"
                    disabled={isLoading}
                  />
                  <div className="flex flex-wrap gap-2">
                    {competencies.map((competency, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                        <X className="w-3 h-3 mr-1 cursor-pointer" onClick={() => removeCompetency(index)} />
                        {competency}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>

          {/* Sticky Footer with Action Buttons */}
        <div className="border-t border-gray-200 py-4 bg-white rounded-b-2xl">
          {currentStep === 1 ? (
            <div className="flex justify-center"> 
              <button
                onClick={handleNext}
                className="w-1/2 px-6 py-2 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
                disabled={isLoading}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center">
                <button
                  onClick={formData.shareThirdParty ? handleCreateAndPublish : handleCreate}
                  className="w-1/2 px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : (formData.allowInbound ? 'Create & Publish' : 'Create')}
                </button>
              
              
              <button
                onClick={handleBack}
                className="w-1/2 px-8 py-3 border border-blue-700 text-blue-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Back
              </button>
            </div>
          )}

        </div>
        </div>
    </div>
  );
};

export default CreateJobRoleModal;