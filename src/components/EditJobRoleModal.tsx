import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Upload,
  FileText,
  ChevronDown,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Underline,
  List,
  CheckCircle,
  Info,
  Check,
  Plus,
  Bold,
  Italic,
} from "lucide-react";
import { showToast } from "../utils/toast";
import { jobPostService, Job, CreateJobData } from "../services/jobPostService";
import { candidateService } from "../services/candidateService";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { debounce } from "lodash";

interface Workspace {
  id: number;
  name: string;
}

interface EditJobRoleModalProps {
  isOpen: boolean;
  jobId: number;
  workspaceId: number;
  workspaces: Workspace[];
  handlePipelinesClick?: () => void;
  onClose: () => void;
  onJobUpdated?: () => void;
}

const EditJobRoleModal: React.FC<EditJobRoleModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaces,
  jobId,
  onJobUpdated,
  handlePipelinesClick,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [formData, setFormData] = useState({
    allowInbound: true,
    keepPrivate: false,
    shareExternally: false,
    title: "",
    skills: [] as string[],
    location: [] as string[],
    workApproach: "Onsite" as "Onsite" | "Remote" | "Hybrid",
    seniority: "",
    department: "",
    aiInterviews: false,
    minExp: "",
    maxExp: "",
    minSalary: "",
    maxSalary: "",
    confidential: false,
    jobDescription: "",
    uploadType: "paste" as "paste" | "upload",
    codingRound: false,
    workspace: workspaceId.toString(),
  });

  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]); // Added
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false); // Added
  const skillSuggestionsRef = useRef<HTMLDivElement>(null);
  const [locationInput, setLocationInput] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [competencyInput, setCompetencyInput] = useState("");
  const [refinementInput, setRefinementInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  const seniorityOptions = ["JUNIOR", "SENIOR", "LEAD", "HEAD", "INTERN"];
  const departmentOptions = [
    "Human Resources",
    "Marketing",
    "Finance",
    "Sales",
    "Ops",
    "Engineering",
    "Admin",
    "Others",
  ];

  const departmentMap: { [key: number]: string } = {
    1: "Human Resources",
    2: "Marketing",
    3: "Finance",
    4: "Sales",
    5: "Ops",
    6: "Engineering",
    7: "Admin",
    8: "Others",
  };

  const departmentNameToId: { [key: string]: number } = {
    "Human Resources": 1,
    Marketing: 2,
    Finance: 3,
    Sales: 4,
    Ops: 5,
    Engineering: 6,
    Admin: 7,
    Others: 8,
  };
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [editableJD, setEditableJD] = useState("");
  const [aiJdResponse, setAiJdResponse] = useState<any>(null);
  const [originalDescription, setOriginalDescription] = useState("");
  const [originalUploadType, setOriginalUploadType] = useState<
    "paste" | "upload"
  >("paste");

  const isValidTextInput = (value: string): boolean =>
    /^[a-zA-Z0-9, ]*$/.test(value);

  const isValidNumberInput = (value: string): boolean => /^[0-9]*$/.test(value);

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
          ${
            isSelected
              ? "bg-[#ECF1FF] text-blue-700"
              : "bg-[#F0F0F0]  text-gray-700 hover:bg-gray-100"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
    >
      <div className="flex items-center">
        <div
          className={`
              w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200
              ${
                isSelected
                  ? "border-blue-500 bg-white"
                  : "border-gray-300 bg-white"
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

  // Updated fetchSkillSuggestions (add useCallback and debounce, like create)
  const fetchSkillSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        try {
          const suggestions =
            await candidateService.getKeywordSuggestions(query);
          const currentSkills = formData.skills.map((s) => s.toLowerCase());
          const filteredSuggestions = suggestions.filter(
            (suggestion: string) =>
              !currentSkills.includes(suggestion.toLowerCase()),
          );
          setSkillSuggestions(filteredSuggestions);
          setShowSkillSuggestions(filteredSuggestions.length > 0);
        } catch (error) {
          console.error("Error fetching skill suggestions:", error);
          setSkillSuggestions([]);
          setShowSkillSuggestions(false);
          showToast.error("Failed to fetch skill suggestions");
        }
      } else {
        setSkillSuggestions([]);
        setShowSkillSuggestions(false);
      }
    }, 300),
    [formData.skills],
  );

  // Updated useEffect for click outside skills (add)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        skillSuggestionsRef.current &&
        !skillSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSkillSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Updated fetchLocationSuggestions (change to Geoapify like create, add useCallback)
  // UPDATED: Replace Geoapify fetch with jobPostService.getLocationSuggestions for consistency and to use backend API
  const fetchLocationSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setLocationSuggestions([]);
        setIsLoadingLocation(false);
        return;
      }

      setIsLoadingLocation(true);
      try {
        const suggestions = await candidateService.getCitySuggestions(query);
        setLocationSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setLocationSuggestions([]);
        showToast.error("Failed to fetch location suggestions");
      } finally {
        setIsLoadingLocation(false);
      }
    }, 300),
    [],
  );

  // Updated handleSkillInputChange (add replace and fetch, like create)
  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
    setSkillInput(value);
    fetchSkillSuggestions(value);
  };

  // Updated handleSkillSelect (add, like create)
  const handleSkillSelect = (suggestion: string) => {
    if (!isValidTextInput(suggestion)) {
      showToast.error(
        "Skills can only contain letters, numbers, commas, and spaces.",
      );
      return;
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, suggestion.trim()],
    }));
    setSkillInput("");
    setSkillSuggestions([]);
    setShowSkillSuggestions(false);
  };

  const validateStep1 = () => {
    const requiredFields = {
      title: formData.title.trim(),
      skills: formData.skills.length > 0,
      location: formData.location,
      seniority: formData.seniority.trim(),
      department:
        formData.department.trim() && departmentNameToId[formData.department],
      minExp: formData.minExp.trim() && isValidNumberInput(formData.minExp), // String
      maxExp: formData.maxExp.trim() && isValidNumberInput(formData.maxExp),
      minSalary: formData.confidential
        ? true
        : formData.minSalary.trim() && isValidNumberInput(formData.minSalary),
      maxSalary: formData.confidential
        ? true
        : formData.maxSalary.trim() && isValidNumberInput(formData.maxSalary),
      jobDescription:
        formData.uploadType === "paste"
          ? formData.jobDescription.trim()
          : !!file,
      workspace: formData.workspace.trim(),
    };

    const errors: string[] = [];

    if (!requiredFields.title) errors.push("Job title is required.");
    if (!isValidTextInput(formData.title))
      errors.push("Job title contains invalid characters.");
    if (!requiredFields.skills) errors.push("At least one skill is required.");
    if (!requiredFields.location) errors.push("Location is required.");
    if (!isValidTextInput(formData.location[0] || ""))
      errors.push("Location contains invalid characters.");
    if (!requiredFields.seniority) errors.push("Seniority is required.");
    if (!requiredFields.department)
      errors.push("Please select a valid department.");
    if (!requiredFields.workspace) errors.push("Workspace is required.");
    if (!requiredFields.minExp)
      errors.push("Minimum experience is required and must be a valid number.");
    if (!requiredFields.maxExp)
      errors.push("Maximum experience is required and must be a valid number.");
    if (!requiredFields.minSalary)
      errors.push("Minimum salary is required unless confidential.");
    if (!requiredFields.maxSalary)
      errors.push("Maximum salary is required unless confidential.");
    if (!requiredFields.jobDescription)
      errors.push(
        "Job description is required when pasting text. or uploading a file.",
      );
    if (!requiredFields.jobDescription)
      errors.push(
        "Job description is required when pasting text or uploading a file.",
      );
    if (
      formData.uploadType === "paste" &&
      formData.jobDescription.trim().length < MIN_DESCRIPTION_LENGTH
    ) {
      errors.push(
        `Job description must be at least ${MIN_DESCRIPTION_LENGTH} characters long.`,
      );
    }

    // Validate experience range
    if (requiredFields.minExp && requiredFields.maxExp) {
      const minExp = parseInt(formData.minExp);
      const maxExp = parseInt(formData.maxExp);
      if (isNaN(minExp) || isNaN(maxExp)) {
        errors.push("Experience fields must be valid numbers.");
      } else if (minExp > maxExp) {
        errors.push(
          "Minimum experience cannot be greater than maximum experience.",
        );
      } else if (
        minExp < 0 ||
        maxExp < 0 ||
        minExp > MAX_SAFE_INTEGER ||
        maxExp > MAX_SAFE_INTEGER
      ) {
        errors.push(
          "Experience values must be within valid integer range (0 to 999999999999).",
        );
      }
    }

    // Validate salary range
    if (
      requiredFields.minSalary &&
      requiredFields.maxSalary &&
      !formData.confidential
    ) {
      const minSalary = parseFloat(formData.minSalary);
      const maxSalary = parseFloat(formData.maxSalary);
      if (isNaN(minSalary) || isNaN(maxSalary)) {
        errors.push("Salary fields must be valid numbers.");
      } else if (minSalary > maxSalary) {
        errors.push("Minimum salary cannot be greater than maximum salary.");
      } else if (
        minSalary < 999 ||
        maxSalary < 999 ||
        minSalary > MAX_SAFE_INTEGER ||
        maxSalary > MAX_SAFE_INTEGER
      ) {
        errors.push(
          "Salary values must be within valid integer range (1000 to 999999999999).",
        );
      }
    }

    return errors;
  };

  // Updated handleSkillAdd (add validation like create)
  const handleSkillAdd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      if (!isValidTextInput(skillInput)) {
        showToast.error(
          "Skills can only contain letters, numbers, commas, and spaces.",
        );
        return;
      }
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
      setSkillSuggestions([]);
      setShowSkillSuggestions(false);
    }
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Updated handleLocationAdd (use [0]?.trim(), set single array)
  const handleLocationAdd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && locationInput[0]?.trim()) {
      if (!isValidTextInput(locationInput[0])) {
        showToast.error(
          "Location can only contain letters, numbers, commas, and spaces.",
        );
        return;
      }
      setFormData((prev) => ({
        ...prev,
        location: [locationInput[0].trim()],
      }));
      setLocationInput([]);
      setLocationSuggestions([]);
    }
  };

  // Updated handleLocationSelect (single string, set [location])
  const handleLocationSelect = (location: string) => {
    // Changed param to string
    if (!isValidTextInput(location)) {
      showToast.error(
        "Location can only contain letters, numbers, commas, and spaces.",
      );
      return;
    }
    setFormData((prev) => ({
      ...prev,
      location: [location], // Single
    }));
    setLocationInput([]);
    setLocationSuggestions([]);
  };

  // Updated handleLocationChange (use [query], fetch Geoapify)
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocationInput([query]);
    fetchLocationSuggestions(query);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && ["text/plain"].includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      showToast.error("Please upload a valid file ( .txt)");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && ["text/plain"].includes(droppedFile.type)) {
      setFile(droppedFile);
    } else {
      showToast.error("Please upload a valid file ( .txt)");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const addCompetency = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && competencyInput.trim()) {
      const newCompetency = competencyInput.trim();
      setCompetencies((prev) => {
        const updated = [...prev, newCompetency];
        setAiJdResponse((prevAi: any) => {
          if (prevAi) {
            return {
              ...prevAi,
              technical_competencies: updated,
            };
          }
          return null;
        });
        return updated;
      });
      setCompetencyInput("");
    }
  };

  const removeCompetency = (index: number) => {
    const newCompetencies = competencies.filter((_, i) => i !== index);
    setCompetencies(newCompetencies);
    setAiJdResponse((prev: any) => {
      if (prev) {
        return {
          ...prev,
          technical_competencies: newCompetencies,
        };
      }
      return null;
    });
  };

  const handleNext = async () => {
    const errors = validateStep1();
    if (errors.length > 0) {
      showToast.error(errors.join(" "));
      return;
    }

    if (formData.uploadType === "upload" && !file) {
      showToast.error("Please upload a file for the job description.");
      return;
    }

    setIsLoading(true);
    try {
      const needsRegenerate =
        formData.uploadType !== originalUploadType ||
        (formData.uploadType === "paste"
          ? formData.jobDescription !== originalDescription
          : true);

      if (needsRegenerate) {
        const description =
          formData.uploadType === "paste" ? formData.jobDescription : file!;
        const aiResponse = await jobPostService.createAiJd(description);
        setEditableJD(aiResponse.job_description_markdown);
        setCompetencies(aiResponse.technical_competencies);
        setAiJdResponse(aiResponse);
        // Update originals after regeneration
        if (formData.uploadType === "paste") {
          setOriginalDescription(formData.jobDescription);
        } else {
          setOriginalDescription("");
        }
        setOriginalUploadType(formData.uploadType);
      }
      setCurrentStep(2);
    } catch (error: any) {
      showToast.error(error.message || "Failed to generate AI JD");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleUpdate = async () => {
    const errors = validateStep1();
    if (errors.length > 0) {
      showToast.error(errors.join(" "));
      return;
    }

    if (formData.uploadType === "upload" && !file) {
      showToast.error("Please upload a file for the job description.");
      return;
    }
    if (
      formData.uploadType === "paste" &&
      formData.jobDescription.trim().length < MIN_DESCRIPTION_LENGTH
    ) {
      showToast.error(
        `Job description must be at least ${MIN_DESCRIPTION_LENGTH} characters long.`,
      );
      return;
    }

    let location = formData.location;
    let isHybrid = formData.workApproach === "Hybrid";
    if (formData.workApproach === "Remote") {
      location = ["Remote"];
      isHybrid = false;
    }

    setIsLoading(true);
    try {
      const jobData: Partial<CreateJobData> = {
        title: formData.title,
        location: location,
        work_approach: formData.workApproach.toUpperCase() as
          | "ONSITE"
          | "REMOTE"
          | "HYBRID",
        seniority: formData.seniority,
        department: departmentNameToId[formData.department] || 8,
        experience_min_years: parseInt(formData.minExp) || 0, // String parse
        experience_max_years: parseInt(formData.maxExp) || 0,
        salary_min: formData.minSalary,
        salary_max: formData.maxSalary,
        is_salary_confidential: formData.confidential,
        visibility: formData.keepPrivate ? "PRIVATE" : "PUBLIC",
        has_coding_contest_stage: formData.codingRound,
        has_ai_interview_stage: formData.aiInterviews,
        skills: formData.skills,
        status: formData.keepPrivate ? "DRAFT" : "PUBLISHED",
        workspace: parseInt(formData.workspace),
        ai_jd_object: aiJdResponse,
        ai_jd: editableJD,
        technical_competencies: competencies,
        ...(formData.uploadType === "paste"
          ? { description_text: formData.jobDescription }
          : { description_file: file! }),
      };

      await jobPostService.updateJob(jobId, jobData);
      showToast.success(
        formData.keepPrivate
          ? "Job role updated successfully!"
          : "Job role updated and published successfully!",
      );
      onJobUpdated?.();
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
            ? `Department error: ${error.response.data.department.join(" ")}`
            : error.message || "Failed to update job role";
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAndPublish = async () => {
    const errors = validateStep1();
    if (errors.length > 0) {
      showToast.error(errors.join(" "));
      return;
    }

    if (formData.uploadType === "upload" && !file) {
      showToast.error("Please upload a file for the job description.");
      return;
    }
    if (
      formData.uploadType === "paste" &&
      formData.jobDescription.trim().length < MIN_DESCRIPTION_LENGTH
    ) {
      showToast.error(
        `Job description must be at least ${MIN_DESCRIPTION_LENGTH} characters long.`,
      );
      return;
    }

    let location = formData.location;
    let isHybrid = formData.workApproach === "Hybrid";
    if (formData.workApproach === "Remote") {
      location = ["Remote"];
      isHybrid = false;
    }

    setIsLoading(true);
    try {
      const jobData: Partial<CreateJobData> = {
        title: formData.title,
        location: location,
        seniority: formData.seniority,
        department: departmentNameToId[formData.department] || 8,
        experience_min_years: parseInt(formData.minExp) || 0,
        experience_max_years: parseInt(formData.maxExp) || 0,
        salary_min: formData.minSalary,
        salary_max: formData.maxSalary,
        work_approach: formData.workApproach.toUpperCase() as
          | "ONSITE"
          | "REMOTE"
          | "HYBRID", // Added
        is_salary_confidential: formData.confidential,
        visibility: formData.keepPrivate ? "PRIVATE" : "PUBLIC",
        has_coding_contest_stage: formData.codingRound,
        has_ai_interview_stage: formData.aiInterviews,
        skills: formData.skills,
        status: formData.keepPrivate ? "DRAFT" : "PUBLISHED",
        workspace: parseInt(formData.workspace),
        ai_jd_object: aiJdResponse,
        ai_jd: editableJD,
        technical_competencies: competencies,
        ...(formData.uploadType === "paste"
          ? { description_text: formData.jobDescription }
          : { description_file: file! }),
      };

      await jobPostService.updateJob(jobId, jobData);
      showToast.success(
        formData.keepPrivate
          ? "Job role updated successfully!"
          : "Job role updated and published successfully!",
      );
      onJobUpdated?.();
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
            ? `Department error: ${error.response.data.department.join(" ")}`
            : error.message || "Failed to update job role";
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const description =
        formData.uploadType === "paste" ? formData.jobDescription : file!;
      const aiResponse = await jobPostService.createAiJd(description);
      setEditableJD(aiResponse.job_description_markdown);
      setCompetencies(aiResponse.technical_competencies);
      setAiJdResponse(aiResponse);
      // Update originals after regeneration
      if (formData.uploadType === "paste") {
        setOriginalDescription(formData.jobDescription);
      } else {
        setOriginalDescription("");
      }
      setOriginalUploadType(formData.uploadType);
    } catch (error: any) {
      showToast.error(error.message || "Failed to regenerate AI JD");
    } finally {
      setIsLoading(false);
    }
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
      title: "",
      skills: [],
      location: [],
      workApproach: "Onsite",
      seniority: "",
      department: "",
      aiInterviews: false,
      minExp: "",
      maxExp: "",
      minSalary: "",
      maxSalary: "",
      confidential: false,
      jobDescription: "",
      uploadType: "paste",
      codingRound: false,
      shareExternally: false,
      workspace: workspaceId.toString(),
    });
    setSkillInput("");
    setLocationInput([]);
    setLocationSuggestions([]);
    setCompetencyInput("");
    setFile(null);
    setCurrentStep(1);
    setValidationError("");
    setCompetencies([]);
    setEditableJD("");
    setAiJdResponse(null);
    setOriginalDescription("");
    setOriginalUploadType("paste");
  };

  useEffect(() => {
    if (isOpen && jobId) {
      setIsLoading(true);
      jobPostService
        .getJob(jobId)
        .then(async (job: Job) => {
          let workApproach: "Onsite" | "Remote" | "Hybrid" = "Onsite";
          if (job.work_approach === "HYBRID") {
            workApproach = "Hybrid";
          } else if (job.work_approach === "REMOTE") {
            workApproach = "Remote";
          } else {
            workApproach = "Onsite";
          }

          const locationFirst =
            job.location.length > 0 ? [job.location[0]] : [];

          setFormData({
            allowInbound: job.visibility === "PUBLIC",
            keepPrivate: job.visibility === "PRIVATE",
            title: job.title,
            skills: job.skills || [],
            location: locationFirst,
            workApproach,
            seniority: job.seniority,
            department: departmentMap[Number(job.department_name)] || "Others",
            aiInterviews: job.has_ai_interview_stage || false,
            minExp: job.experience_min_years?.toString() || "",
            maxExp: job.experience_max_years?.toString() || "",
            minSalary: job.salary_min
              ? job.salary_min.toString().replace(/.00$/, "")
              : "",
            maxSalary: job.salary_max
              ? job.salary_max.toString().replace(/.00$/, "")
              : "",
            confidential: job.is_salary_confidential,
            jobDescription: job.description || "",
            uploadType: job.description ? "paste" : "upload",
            codingRound: job.has_coding_contest_stage || false,
            workspace: job.workspace_details.id.toString(),
            shareExternally: false,
          });
          setOriginalDescription(job.description || "");
          setOriginalUploadType("paste");
          setEditableJD(job.ai_jd || "");
          setCompetencies(job.technical_competencies || []);
          setAiJdResponse(job.ai_jd_object || null);
          setIsLoading(false);
          setIsFetching(false);
        })
        .catch((error) => {
          showToast.error(error.message || "Failed to fetch job details");
        })
        .finally(() => {
          setIsLoading(false);
          setIsFetching(false);
        });
    }
  }, [isOpen, jobId, workspaces]);

  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-500 mb-3">
            Successfully Updated!
          </h2>
          <p className="text-gray-600 mb-8">Your Job role is updated</p>
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
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Confirm Cancel
          </h2>
          <p className="text-gray-600 mb-8">
            Are you sure you want to cancel? All progress will be lost.
          </p>
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

  if (isFetching) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-start pt-20 justify-center p-4 min-h-[150vh]">
      <div className="bg-white relative rounded-2xl shadow-xl w-full max-w-6xl max-h-[98vh]  flex flex-col overflow-hidden">
        <div className="p-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded-lg mr-4"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-md font-medium text-gray-900">
                Edit Job Role
              </span>
            </div>

            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="w-1/2 bg-white absolute z-10 top-24 left-1/2 transform -translate-x-1/2 -translate-y-1/2  flex flex-col items-center justify-center space-x-4">
            <div className="flex items-center space-x-64">
              <div className="flex flex-col justify-center gap-2 items-center">
                <span
                  className={`ml-2 text-sm ${
                    currentStep >= 1
                      ? "text-blue-500 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  Basic Info
                </span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    currentStep >= 1 ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></div>
              </div>
              <div className="flex flex-col justify-center gap-2 items-center">
                <span
                  className={`ml-2 text-sm ${
                    currentStep >= 2
                      ? "text-blue-500 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  Update and Refine JD
                </span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    currentStep >= 2 ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></div>
              </div>
            </div>
            <div className="relative top-[-6px] right-[25px]">
              <div
                className={`w-[351px] h-px ${
                  currentStep >= 2 ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></div>
            </div>
            <div className="flex-1 overflow-y-auto mt-2 pr-10">
              {currentStep === 1 ? (
                <div className="text-center mb-2">
                  <h2 className="text-md font-[400] text-gray-900 mb-2">
                    Add Basic Details
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Fill out the basic information of the job
                  </p>
                </div>
              ) : (
                <div className="text-center mb-8">
                  <h2 className="text-md font-[400] text-gray-900 mb-2">
                    Update JD
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Refine information of the job
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-72">
          {currentStep === 1 ? (
            <div className="space-y-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add to Workspace <span className="text-red-500">*</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Default workspace selected. Choose another to switch.
                  </p>
                </label>
                <select
                  value={formData.workspace}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      workspace: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  <option value="">Select workspace</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>
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
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }));
                    }
                  }}
                  className="w-full px-4 py-3 text-blue-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Skills <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-gray-300 rounded-lg px-4 pt-2 pb-2">
                  <input
                    type="text"
                    placeholder="Type skill and Press Enter"
                    value={skillInput}
                    onChange={handleSkillInputChange} // Updated
                    onKeyPress={handleSkillAdd} // Updated
                    className="w-full border-none outline-none text-sm text-blue-600 placeholder-gray-400 mb-3"
                    disabled={isLoading}
                  />
                  {showSkillSuggestions &&
                    skillSuggestions.length > 0 && ( // Added
                      <div
                        ref={skillSuggestionsRef}
                        className="absolute left-0 z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
                      >
                        {skillSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => handleSkillSelect(suggestion)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                      >
                        <X
                          className="w-3 h-3 mr-1 cursor-pointer"
                          onClick={() => removeSkill(index)}
                        />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative border border-gray-300 rounded-lg px-4 pt-2 pb-2">
                  <input
                    type="text"
                    ref={locationInputRef}
                    placeholder="Type location and Press Enter"
                    value={locationInput[0] || ""} // Updated
                    onChange={handleLocationChange} // Updated
                    onKeyPress={handleLocationAdd} // Updated
                    className=" w-full border-none outline-none text-sm text-blue-600 placeholder-gray-400 mb-3"
                    disabled={isLoading}
                  />
                  {locationInput[0]?.length >= 2 &&
                    (isLoadingLocation || locationSuggestions.length > 0) && (
                      <div className="absolute left-0 z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {isLoadingLocation ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Loading locations...
                          </div>
                        ) : (
                          locationSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 text-md text-gray-700 hover:bg-blue-100 cursor-pointer"
                              onClick={() => handleLocationSelect(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  <div className="flex flex-wrap gap-2">
                    {formData.location.length > 0 && ( // Updated to length
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                        <X
                          className="w-3 h-3 mr-1 cursor-pointer"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, location: [] }))
                          }
                        />
                        {formData.location[0]} {/* First only */}
                      </span>
                    )}
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        seniority: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-3"
                    disabled={isLoading}
                  >
                    <option value="">Select seniority</option>
                    {seniorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-blue-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">Select department</option>
                    {departmentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
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
                    isSelected={formData.workApproach === "Onsite"}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        workApproach: "Onsite",
                      }))
                    }
                    disabled={isLoading}
                  />
                  <RadioToggle
                    label="Remote"
                    isSelected={formData.workApproach === "Remote"}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        workApproach: "Remote",
                      }))
                    }
                    disabled={isLoading}
                  />
                  <RadioToggle
                    label="Hybrid"
                    isSelected={formData.workApproach === "Hybrid"}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        workApproach: "Hybrid",
                      }))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Exp Range (In Years){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Min exp"
                      value={formData.minExp} // String
                      onChange={(e) => {
                        if (isValidNumberInput(e.target.value)) {
                          setFormData((prev) => ({
                            ...prev,
                            minExp: e.target.value, // String
                          }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      placeholder="Max exp"
                      value={formData.maxExp} // String
                      onChange={(e) => {
                        if (isValidNumberInput(e.target.value)) {
                          setFormData((prev) => ({
                            ...prev,
                            maxExp: e.target.value, // String
                          }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <label className="block flex text-sm font-medium text-gray-700 mb-2">
                    Enter Salary Range{" "}
                    {formData.confidential ? (
                      ""
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <div className="flex w-full space-x-2">
                    <input
                      type="text"
                      placeholder="Min salary"
                      value={formData.minSalary}
                      onChange={(e) => {
                        if (isValidNumberInput(e.target.value)) {
                          setFormData((prev) => ({
                            ...prev,
                            minSalary: e.target.value,
                          }));
                        }
                      }}
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg text-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500  ${
                        formData.confidential ? "bg-gray-100 text-gray-400" : ""
                      }`}
                      disabled={isLoading || formData.confidential}
                    />
                    <input
                      type="text"
                      placeholder="Max salary"
                      value={formData.maxSalary}
                      onChange={(e) => {
                        if (isValidNumberInput(e.target.value)) {
                          setFormData((prev) => ({
                            ...prev,
                            maxSalary: e.target.value,
                          }));
                        }
                      }}
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg text-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formData.confidential ? "bg-gray-100 text-gray-400" : ""
                      }`}
                      disabled={isLoading || formData.confidential}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          confidential: !prev.confidential,
                        }))
                      }
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-md font-[400] transition-all duration-200 ${
                        formData.confidential
                          ? "bg-[#ECF1FF] text-blue-600"
                          : "bg-[#F0F0F0] text-gray-400"
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
                    Add Job Description <span className="text-red-500">*</span>
                  </span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          uploadType: "paste",
                          jobDescription: "",
                        }))
                      }
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        formData.uploadType === "paste"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600"
                      }`}
                      disabled={isLoading}
                    >
                      Paste Text
                    </button>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          uploadType: "upload",
                          jobDescription: "",
                        }))
                      }
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        formData.uploadType === "upload"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600"
                      }`}
                      disabled={isLoading}
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {formData.uploadType === "paste" ? (
                  <textarea
                    placeholder="Paste your job description here..."
                    value={formData.jobDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        jobDescription: e.target.value,
                      }))
                    }
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
                      {file
                        ? `Selected file: ${file.name}`
                        : "Drag and drop your job description file here"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      or click to browse (.txt)
                    </p>
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
              <div className="text-center mb-8">
                <h2 className="text-md font-[400] text-gray-900 mb-2">
                  Summary of JD
                </h2>
                <p className="text-gray-500 text-sm">
                  Verification of the JD and submission of the job
                </p>
              </div>

              {/* AI-Generated Job Description */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    AI-Generated Job Description
                  </h3>
                  <button
                    onClick={() => handleRegenerate}
                    className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                    disabled={isLoading}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Regenerate
                  </button>
                </div>
                <div className="border border-gray-300 rounded-lg p-4">
                  <CKEditor
                    editor={ClassicEditor}
                    data={editableJD}
                    onChange={(event: any, editor: any) => {
                      const data = editor.getData();
                      setEditableJD(data);
                      setAiJdResponse((prev: any) => ({
                        ...prev,
                        job_description_markdown: data,
                      }));
                    }}
                    config={{
                      toolbar: [
                        "bold",
                        "italic",
                        "link",
                        "bulletedList",
                        "numberedList",
                        "undo",
                        "redo",
                      ],
                    }}
                    className="rounded-lg"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Key Competencies */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Key Competencies
                </h3>
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
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center"
                      >
                        <X
                          className="w-3 h-3 mr-1 cursor-pointer"
                          onClick={() => removeCompetency(index)}
                        />
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
                {isLoading ? "Loading..." : "Next Step"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={
                  formData.keepPrivate ? handleUpdate : handleUpdateAndPublish
                }
                className="w-1/2 px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading
                  ? "Loading..."
                  : formData.allowInbound
                    ? "Update & Publish"
                    : "Update"}
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

export default EditJobRoleModal;
