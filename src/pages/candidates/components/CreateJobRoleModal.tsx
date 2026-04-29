import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Download, Send } from "lucide-react";
import { showToast } from "../../../utils/toast";
import { jobPostService, CreateJobData } from "../../../services/jobPostService";
import { candidateService } from "../../../services/candidateService";
import { debounce } from "lodash";
import toast from "react-hot-toast";
import JobBasicsStep from "./JobBasicsStep";
import SkillsRequirementsStep from "./SkillsRequirementsStep";
import ReviewPublishStep from "./ReviewPublishStep";

interface Workspace { id: number; name: string; }

interface CreateJobRoleModalProps {
  isOpen: boolean;
  workspaceId: number;
  workspaces: Workspace[];
  handlePipelinesClick?: () => void;
  onClose: () => void;
  onJobCreated?: () => void;
}

const CreateJobRoleModal: React.FC<CreateJobRoleModalProps> = ({
  isOpen, workspaceId, workspaces, handlePipelinesClick, onClose, onJobCreated,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const skillSuggestionsRef = useRef<HTMLDivElement>(null);
  const [locationInput, setLocationInput] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [competencyInput, setCompetencyInput] = useState<string>("");
  const [competencies, setCompetencies] = useState<string[]>([]);
  const [editableJD, setEditableJD] = useState("");
  const [aiJdResponse, setAiJdResponse] = useState<any>(null);
  const [originalDescription, setOriginalDescription] = useState("");
  const [originalUploadType, setOriginalUploadType] = useState<"paste" | "upload">("paste");
  const [booleanSearchTerm, setBooleanSearchTerm] = useState<string>("");
  const locationInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    allowInbound: true, keepPrivate: true, shareExternally: false,
    clientCompany: "", title: "",
    skills: [] as string[], location: [] as string[],
    workApproach: "Onsite" as "Onsite" | "Remote" | "Hybrid",
    seniority: "", department: "", openings: "",
    noticePeriod: "", educationLevel: "", specifications: "",
    primarySkillsDesign: [] as string[], primarySkillsUx: [] as string[],
    primarySkillsTechnical: [] as string[],
    mustHaveRequirements: "", niceToHaveRequirements: "",
    industryPreferences: [] as string[],
    aiInterviews: false, minExp: "", maxExp: "",
    minSalary: "", maxSalary: "", confidential: false,
    jobDescription: "", uploadType: "paste" as "paste" | "upload",
    shareThirdParty: false, codingRound: false,
    workspace: workspaceId.toString(),
  });

  const seniorityOptions = ["JUNIOR", "SENIOR", "LEAD", "HEAD", "INTERN"];
  const departmentOptions = ["Human Resources", "Marketing", "Finance", "Sales", "Ops", "Engineering", "Admin", "Others"];
  const departmentNameToId: { [key: string]: number } = {
    "Human Resources": 1, Marketing: 2, Finance: 3, Sales: 4, Ops: 5, Engineering: 6, Admin: 7, Others: 8,
  };

  const isValidTextInput = (v: string) => /^[a-zA-Z0-9, ]*$/.test(v);
  const isValidNumberInput = (v: string) => /^[0-9]*$/.test(v);
  const MAX_SAFE_INTEGER = 999999999999;
  const MIN_DESCRIPTION_LENGTH = 10;

  // ── Skill suggestions ──
  const fetchSkillSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        try {
          const suggestions = await candidateService.getKeywordSuggestions(query);
          const current = formData.skills.map((s) => s.toLowerCase());
          const filtered = suggestions.filter((s: string) => !current.includes(s.toLowerCase()));
          setSkillSuggestions(filtered);
          setShowSkillSuggestions(filtered.length > 0);
        } catch { setSkillSuggestions([]); setShowSkillSuggestions(false); }
      } else { setSkillSuggestions([]); setShowSkillSuggestions(false); }
    }, 300), [formData.skills]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (skillSuggestionsRef.current && !skillSuggestionsRef.current.contains(e.target as Node))
        setShowSkillSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^a-zA-Z0-9\s]/g, "");
    setSkillInput(v); fetchSkillSuggestions(v);
  };
  const handleSkillSelect = (s: string) => {
    if (!isValidTextInput(s)) { showToast.error("Invalid characters."); return; }
    setFormData((p) => ({ ...p, skills: [...p.skills, s.trim()] }));
    setSkillInput(""); setSkillSuggestions([]); setShowSkillSuggestions(false);
  };
  const handleSkillAdd = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      if (!isValidTextInput(skillInput)) { showToast.error("Invalid characters."); return; }
      setFormData((p) => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
      setSkillInput(""); setSkillSuggestions([]); setShowSkillSuggestions(false);
    }
  };
  const removeSkill = (i: number) => setFormData((p) => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }));

  // ── Location suggestions ──
  const fetchLocationSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) { setLocationSuggestions([]); setIsLoadingLocation(false); return; }
      setIsLoadingLocation(true);
      try { setLocationSuggestions(await candidateService.getCitySuggestions(query)); }
      catch { setLocationSuggestions([]); }
      finally { setIsLoadingLocation(false); }
    }, 300), []
  );
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value; setLocationInput([q]);
    if (q.trim().length >= 2) fetchLocationSuggestions(q); else setLocationSuggestions([]);
  };
  const handleLocationAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return; e.preventDefault();
    const v = locationInput[0]?.trim(); if (!v) return;
    if (!isValidTextInput(v)) { showToast.error("Invalid location characters."); return; }
    setFormData((p) => p.location.includes(v) ? p : { ...p, location: [...p.location, v] });
    setLocationInput([]); setLocationSuggestions([]);
  };
  const handleLocationSelect = (loc: string) => {
    const t = loc.trim(); if (!t || !isValidTextInput(t)) return;
    setFormData((p) => p.location.includes(t) ? p : { ...p, location: [...p.location, t] });
    setLocationInput([]); setLocationSuggestions([]);
  };

  // ── File handling ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && ["text/plain"].includes(f.type)) setFile(f);
    else showToast.error("Please upload a valid .txt file");
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    const f = e.dataTransfer.files[0];
    if (f && ["text/plain"].includes(f.type)) setFile(f);
    else showToast.error("Please upload a valid .txt file");
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };

  // ── Validation ──
  const validateStep1 = () => {
    const errors: string[] = [];
    if (!formData.clientCompany.trim()) errors.push("Client / Company is required.");
    if (!formData.title.trim()) errors.push("Job title is required.");
    if (!formData.seniority.trim()) errors.push("Seniority is required.");
    if (!formData.department.trim() || !departmentNameToId[formData.department]) errors.push("Department is required.");
    if (formData.location.length === 0) errors.push("Location is required.");
    if (!formData.confidential) {
      if (!formData.minSalary.trim()) errors.push("Min salary required.");
      if (!formData.maxSalary.trim()) errors.push("Max salary required.");
    }
    if (!formData.openings.trim()) errors.push("Number of openings required.");
    const hasJD = formData.uploadType === "paste" ? formData.jobDescription.trim().length >= MIN_DESCRIPTION_LENGTH : !!file;
    if (!hasJD) errors.push("Job description is required (min 10 chars or file upload).");
    return errors;
  };

  const validateStep2 = () => {
    const errors: string[] = [];
    if (!formData.minExp.trim()) errors.push("Min experience required.");
    if (!formData.maxExp.trim()) errors.push("Max experience required.");
    if (!formData.noticePeriod.trim()) errors.push("Notice period required.");
    if (!formData.educationLevel.trim()) errors.push("Education level required.");
    const hasSkills = formData.skills.length > 0 || formData.primarySkillsDesign.length > 0 ||
      formData.primarySkillsUx.length > 0 || formData.primarySkillsTechnical.length > 0;
    if (!hasSkills) errors.push("At least one skill required.");
    if (formData.minExp && formData.maxExp && parseInt(formData.minExp) > parseInt(formData.maxExp))
      errors.push("Min experience cannot exceed max.");
    return errors;
  };

  // ── Navigation ──
  const handleNext = async () => {
    if (currentStep === 1) {
      const e = validateStep1(); if (e.length > 0) { showToast.error(e.join(" ")); return; }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const e = validateStep2(); if (e.length > 0) { showToast.error(e.join(" ")); return; }
      setIsLoading(true);
      try {
        const needsRegen = formData.uploadType !== originalUploadType ||
          (formData.uploadType === "paste" ? formData.jobDescription !== originalDescription : true);
        if (needsRegen) {
          const desc = formData.uploadType === "paste" ? formData.jobDescription : file!;
          const ai = await jobPostService.createAiJd(desc);
          setEditableJD(ai.job_description_markdown);
          setCompetencies(ai.technical_competencies);
          setAiJdResponse(ai);
          setBooleanSearchTerm(ai.jd_competencies?.search_criteria?.search_criteria_expression || "");
          setOriginalDescription(formData.uploadType === "paste" ? formData.jobDescription : "");
          setOriginalUploadType(formData.uploadType);
        }
        setCurrentStep(3);
      } catch (err: any) { showToast.error(err.message || "Failed to generate AI JD"); }
      finally { setIsLoading(false); }
    }
  };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  // ── Create / Publish ──
  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const allSkills = [...formData.skills, ...formData.primarySkillsDesign, ...formData.primarySkillsUx, ...formData.primarySkillsTechnical];
      const jobData: CreateJobData = {
        title: formData.title, location: formData.location,
        work_approach: formData.workApproach.toUpperCase() as "ONSITE" | "REMOTE" | "HYBRID",
        seniority: formData.seniority, department: departmentNameToId[formData.department] || 8,
        experience_min_years: parseInt(formData.minExp) || 0,
        experience_max_years: parseInt(formData.maxExp) || 0,
        salary_min: formData.minSalary, salary_max: formData.maxSalary,
        is_salary_confidential: formData.confidential,
        visibility: formData.keepPrivate ? "PRIVATE" : "PUBLIC",
        has_coding_contest_stage: formData.codingRound,
        has_ai_interview_stage: formData.aiInterviews,
        skills: allSkills, status: "ACTIVE",
        workspace: parseInt(formData.workspace), ai_jd_object: aiJdResponse,
        ...(formData.uploadType === "paste"
          ? { description_text: formData.jobDescription }
          : { description_file: file! }),
      };
      await jobPostService.createJob(jobData);
      showToast.success("Job role created successfully!");
      onJobCreated?.(); onClose(); setShowSuccessModal(true);
      setCurrentStep(1); setFile(null);
    } catch (err: any) {
      const msg = err.response?.data?.description ? `Description error: ${err.response.data.description}`
        : err.response?.data?.department ? `Department error: ${err.response.data.department.join(" ")}`
        : err.message || "Failed to create job role";
      showToast.error(msg);
    } finally { setIsLoading(false); }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const desc = formData.uploadType === "paste" ? formData.jobDescription : file!;
      const ai = await jobPostService.createAiJd(desc);
      setEditableJD(ai.job_description_markdown);
      setCompetencies(ai.technical_competencies);
      setAiJdResponse(ai);
      setBooleanSearchTerm(ai.jd_competencies?.search_criteria?.search_criteria_expression || "");
      setOriginalDescription(formData.uploadType === "paste" ? formData.jobDescription : "");
      setOriginalUploadType(formData.uploadType);
    } catch (err: any) { showToast.error(err.message || "Failed to regenerate AI JD"); }
    finally { setIsLoading(false); }
  };

  const handleCancel = () => {
    if (formData.title || formData.skills.length > 0) setShowCancelModal(true);
    else onClose();
  };

  const resetForm = () => {
    setFormData({
      allowInbound: true, keepPrivate: false, shareExternally: false,
      clientCompany: "", title: "", skills: [], location: [],
      workApproach: "Onsite", seniority: "", department: "", openings: "",
      noticePeriod: "", educationLevel: "", specifications: "",
      primarySkillsDesign: [], primarySkillsUx: [], primarySkillsTechnical: [],
      mustHaveRequirements: "", niceToHaveRequirements: "", industryPreferences: [],
      aiInterviews: false, minExp: "", maxExp: "", minSalary: "", maxSalary: "",
      confidential: false, jobDescription: "", uploadType: "paste",
      shareThirdParty: false, codingRound: false, workspace: workspaceId.toString(),
    });
    setSkillInput(""); setLocationInput([]); setLocationSuggestions([]);
    setCompetencyInput(""); setFile(null); setCurrentStep(1);
    setCompetencies([]); setEditableJD(""); setAiJdResponse(null); setBooleanSearchTerm("");
  };

  useEffect(() => { if (isOpen) resetForm(); }, [isOpen]);

  // ── Success Modal ──
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-500 mb-3">Successfully Created!</h2>
          <p className="text-gray-600 mb-8">Your Job role is created</p>
          <div className="flex gap-3">
            <button onClick={() => { setShowSuccessModal(false); onClose(); resetForm(); }}
              className="flex-1 px-6 py-3 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 font-medium">
              Back to Home
            </button>
            <button onClick={() => { handlePipelinesClick?.(); setShowSuccessModal(false); onClose(); resetForm(); }}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
              Pipeline
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  // ── Cancel Modal ──
  if (showCancelModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Confirm Cancel</h2>
          <p className="text-gray-600 mb-8">Are you sure you want to cancel? All progress will be lost.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowCancelModal(false)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Continue Editing
            </button>
            <button onClick={() => { setShowCancelModal(false); onClose(); resetForm(); }}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
              Yes, Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = ["Job Basics", "Skills & Requirements", "Review & Publish"];
  const stepDescriptions = [
    "Start with the fundamental details. This powers AI sourcing and JD generation.",
    "Define the ideal candidate profile. AI will use these to score and match candidates.",
    "Everything looks good? Review the summary and publish / create the job.",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white relative rounded-2xl shadow-xl w-full max-w-6xl max-h-[98vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded-lg mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-md font-medium text-gray-900">Create Job Role</span>
            </div>
            <button onClick={handleCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>

          {/* 3-Step Progress */}
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center w-2/3 justify-center">
              {stepLabels.map((label, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className={`flex-1 h-px mx-2 max-w-[200px] ${currentStep > i ? "bg-blue-500" : "bg-gray-300"}`} />}
                  <div className="flex flex-col items-center gap-2">
                    <span className={`text-sm ${currentStep >= i + 1 ? "text-blue-500 font-medium" : "text-gray-500"}`}>{label}</span>
                    <div className={`w-3 h-3 rounded-full ${currentStep >= i + 1 ? "bg-blue-500" : "bg-gray-300"}`} />
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-md font-semibold text-gray-900 uppercase tracking-wide">
                {stepLabels[currentStep - 1]}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{stepDescriptions[currentStep - 1]}</p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-72 mt-2 pb-6">
          {currentStep === 1 && (
            <JobBasicsStep
              formData={formData} setFormData={setFormData} workspaces={workspaces}
              isLoading={isLoading} file={file} setFile={setFile}
              locationInput={locationInput} setLocationInput={setLocationInput}
              locationSuggestions={locationSuggestions} isLoadingLocation={isLoadingLocation}
              handleLocationChange={handleLocationChange} handleLocationAdd={handleLocationAdd}
              handleLocationSelect={handleLocationSelect} locationInputRef={locationInputRef}
              isValidTextInput={isValidTextInput} isValidNumberInput={isValidNumberInput}
              handleFileChange={handleFileChange} handleDrop={handleDrop} handleDragOver={handleDragOver}
              seniorityOptions={seniorityOptions} departmentOptions={departmentOptions}
            />
          )}
          {currentStep === 2 && (
            <SkillsRequirementsStep
              formData={formData} setFormData={setFormData} isLoading={isLoading}
              skillInput={skillInput} setSkillInput={setSkillInput}
              skillSuggestions={skillSuggestions} showSkillSuggestions={showSkillSuggestions}
              skillSuggestionsRef={skillSuggestionsRef}
              handleSkillInputChange={handleSkillInputChange}
              handleSkillSelect={handleSkillSelect} handleSkillAdd={handleSkillAdd}
              removeSkill={removeSkill} isValidNumberInput={isValidNumberInput}
            />
          )}
          {currentStep === 3 && (
            <ReviewPublishStep
              formData={formData} isLoading={isLoading}
              editableJD={editableJD} setEditableJD={setEditableJD}
              aiJdResponse={aiJdResponse} setAiJdResponse={setAiJdResponse}
              competencies={competencies} setCompetencies={setCompetencies}
              competencyInput={competencyInput} setCompetencyInput={setCompetencyInput}
              booleanSearchTerm={booleanSearchTerm} handleRegenerate={handleRegenerate}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-10 py-4 bg-white rounded-b-2xl">
          {currentStep === 1 && (
            <div className="flex justify-between items-center">
              <button onClick={() => toast.success("Draft saved!")}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                Save Draft
              </button>
              <button onClick={handleNext} disabled={isLoading}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                {isLoading ? "Loading..." : "Continue to Next Step"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentStep === 2 && (
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button onClick={handleBack} disabled={isLoading}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => toast.success("Draft saved!")}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  Save Draft
                </button>
              </div>
              <button onClick={handleNext} disabled={isLoading}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                {isLoading ? "Loading..." : "Continue to Next Step"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {currentStep === 3 && (
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button onClick={handleBack} disabled={isLoading}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => toast.success("JD downloaded!")}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                  Download JD <Download className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handlePublish} disabled={isLoading}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                {isLoading ? "Publishing..." : "Publish Job"} <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateJobRoleModal;
