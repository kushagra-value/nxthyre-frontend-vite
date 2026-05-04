import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Send, X, Download } from "lucide-react";
import { showToast } from "../../../utils/toast";
import { jobPostService, Job, CreateJobData } from "../../../services/jobPostService";
import { candidateService } from "../../../services/candidateService";
import { debounce } from "lodash";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import JobBasicsStep from "./JobBasicsStep";
import SkillsRequirementsStep from "./SkillsRequirementsStep";
import ReviewPublishStep from "./ReviewPublishStep";

interface Workspace { id: number; name: string; }

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
  isOpen, jobId, workspaceId, workspaces, handlePipelinesClick, onClose, onJobUpdated,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
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
  const [saveDraftText, setSaveDraftText] = useState("Save Draft");

  const [formData, setFormData] = useState({
    allowInbound: true, keepPrivate: false, shareExternally: false,
    clientCompany: "", title: "",
    skills: [] as string[], location: [] as string[],
    workApproach: "Onsite" as "Onsite" | "Remote" | "Hybrid",
    seniority: "", department: "", openings: "",
    noticePeriod: "", educationLevel: "", specifications: "",
    aiSelectedSkills: [] as string[],
    mustHaveRequirements: "", niceToHaveRequirements: "",
    industryPreferences: [] as string[],
    aiInterviews: false, minExp: "", maxExp: "",
    minSalary: "", maxSalary: "", confidential: false, salaryFormat: "INR (LPA)",
    jobDescription: "", uploadType: "paste" as "paste" | "upload",
    shareThirdParty: false, codingRound: false,
    workspace: workspaceId.toString(),
    pocEmail: "",
  });

  const seniorityOptions = ["JUNIOR", "SENIOR", "LEAD", "HEAD", "INTERN"];
  const departmentOptions = ["Human Resources", "Marketing", "Finance", "Sales", "Ops", "Engineering", "Admin", "Others"];
  const departmentMap: { [key: number]: string } = {
    1: "Human Resources", 2: "Marketing", 3: "Finance", 4: "Sales", 5: "Ops", 6: "Engineering", 7: "Admin", 8: "Others",
  };
  const departmentNameToId: { [key: string]: number } = {
    "Human Resources": 1, Marketing: 2, Finance: 3, Sales: 4, Ops: 5, Engineering: 6, Admin: 7, Others: 8,
  };

  const isValidTextInput = (v: string) => /^[a-zA-Z0-9, ]*$/.test(v);
  const isValidNumberInput = (v: string) => /^[0-9]*$/.test(v);
  const MIN_DESCRIPTION_LENGTH = 10;

  // ── Initialization ──
  const loadDrafts = () => {
    try {
      const drafts = JSON.parse(localStorage.getItem('edit_job_drafts') || '[]');
      const draftData = drafts.find((d: any) => d.id === jobId.toString());
      if (draftData) {
        setFormData(draftData.formData);
        setAiJdResponse(draftData.aiJdResponse || null);
        setEditableJD(draftData.editableJD || "");
        setCompetencies(draftData.competencies || []);
        setCurrentStep(draftData.currentStep || 1);
        setBooleanSearchTerm(draftData.booleanSearchTerm || "");
        setOriginalDescription(draftData.originalDescription || "");
        setOriginalUploadType(draftData.originalUploadType || "paste");
        return true;
      }
    } catch (err) {
      console.error("Failed to load drafts", err);
    }
    return false;
  };

  const resetForm = () => {
    const selectedWorkspaceName = workspaces.find((w) => w.id === workspaceId)?.name || "";
    setFormData({
      allowInbound: true, keepPrivate: false, shareExternally: false,
      clientCompany: selectedWorkspaceName, title: "", skills: [], location: [],
      workApproach: "Onsite", seniority: "", department: "", openings: "",
      noticePeriod: "", educationLevel: "", specifications: "",
      aiSelectedSkills: [] as string[],
      mustHaveRequirements: "", niceToHaveRequirements: "", industryPreferences: [],
      aiInterviews: false, minExp: "", maxExp: "", minSalary: "", maxSalary: "",
      confidential: false, salaryFormat: "INR (LPA)", jobDescription: "", uploadType: "paste",
      shareThirdParty: false, codingRound: false, workspace: workspaceId.toString(),
      pocEmail: "",
    });
    setSkillInput(""); setLocationInput([]); setLocationSuggestions([]);
    setCompetencyInput(""); setFile(null); setCurrentStep(1);
    setCompetencies([]); setEditableJD(""); setAiJdResponse(null); setBooleanSearchTerm("");
  };

  useEffect(() => {
    if (isOpen && jobId) {
      if (loadDrafts()) return;

      setIsFetching(true);
      setIsLoading(true);
      jobPostService.getJob(jobId).then(async (job: Job) => {
        let workApproach: "Onsite" | "Remote" | "Hybrid" = "Onsite";
        if (job.work_approach === "HYBRID") workApproach = "Hybrid";
        else if (job.work_approach === "REMOTE") workApproach = "Remote";

        const locationFirst = job.location.length > 0 ? [job.location[0]] : [];
        const selectedWorkspaceName = workspaces.find((w) => w.id === job.workspace_details.id)?.name || "";

        setFormData({
          allowInbound: job.visibility === "PUBLIC",
          keepPrivate: job.visibility === "PRIVATE",
          shareExternally: false,
          clientCompany: selectedWorkspaceName,
          title: job.title,
          skills: job.skills || [],
          location: locationFirst,
          workApproach,
          seniority: job.seniority,
          department: departmentMap[Number(job.department_name)] || "Others",
          openings: job.num_positions?.toString() || "",
          noticePeriod: job.notice_period || "",
          educationLevel: job.education_level || "",
          specifications: job.specialisations || "",
          aiSelectedSkills: [],
          mustHaveRequirements: "",
          niceToHaveRequirements: "",
          industryPreferences: [],
          aiInterviews: job.has_ai_interview_stage || false,
          minExp: job.experience_min_years?.toString() || "",
          maxExp: job.experience_max_years?.toString() || "",
          minSalary: job.salary_min ? job.salary_min.toString().replace(/.00$/, "") : "",
          maxSalary: job.salary_max ? job.salary_max.toString().replace(/.00$/, "") : "",
          confidential: job.is_salary_confidential,
          salaryFormat: "INR (₹/year)", // Default for existing jobs
          jobDescription: job.description || "",
          uploadType: job.description ? "paste" : "upload",
          codingRound: job.has_coding_contest_stage || false,
          workspace: job.workspace_details.id.toString(),
          pocEmail: job.poc_email || "",
          shareThirdParty: false,
        });

        setOriginalDescription(job.description || "");
        setOriginalUploadType("paste");
        setEditableJD(job.ai_jd || "");
        setCompetencies(job.technical_competencies || []);
        setAiJdResponse(job.ai_jd_object || null);
        setIsLoading(false);
        setIsFetching(false);
      }).catch((error) => {
        showToast.error(error.message || "Failed to fetch job details");
        setIsLoading(false);
        setIsFetching(false);
      });
    } else if (!isOpen) {
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, jobId]);

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
    if (!formData.title.trim()) errors.push("Job title is required.");
    if (!formData.seniority.trim()) errors.push("Seniority is required.");
    if (!formData.department.trim() || !departmentNameToId[formData.department]) errors.push("Department is required.");
    if (formData.location.length === 0) errors.push("Location is required.");
    if (!formData.confidential) {
      if (!formData.minSalary.trim()) errors.push("Min salary required.");
      if (!formData.maxSalary.trim()) errors.push("Max salary required.");
    }
    const hasJD = formData.uploadType === "paste" ? formData.jobDescription.trim().length >= MIN_DESCRIPTION_LENGTH : !!file;
    if (!hasJD && !formData.jobDescription) errors.push("Job description is required (min 10 chars or file upload).");
    return errors;
  };

  const validateStep2 = () => {
    const errors: string[] = [];
    if (!formData.minExp.trim()) errors.push("Min experience required.");
    if (!formData.maxExp.trim()) errors.push("Max experience required.");
    const hasSkills = formData.skills.length > 0 || (formData.aiSelectedSkills && formData.aiSelectedSkills.length > 0);
    if (!hasSkills) errors.push("At least one skill required.");
    if (formData.minExp && formData.maxExp && parseInt(formData.minExp) > parseInt(formData.maxExp))
      errors.push("Min experience cannot exceed max.");
    return errors;
  };

  // ── Navigation ──
  const handleNext = async () => {
    if (currentStep === 1) {
      const e = validateStep1(); if (e.length > 0) { showToast.error(e.join(" ")); return; }
      setIsLoading(true);
      try {
        const needsRegen = formData.uploadType !== originalUploadType ||
          (formData.uploadType === "paste" ? formData.jobDescription !== originalDescription : true);
        if (needsRegen && (formData.jobDescription || file)) {
          const desc = formData.uploadType === "paste" ? formData.jobDescription : file!;
          const ai = await jobPostService.createAiJd(desc);
          setEditableJD(ai.job_description_markdown);
          setCompetencies(ai.technical_competencies);
          setAiJdResponse(ai);
          setBooleanSearchTerm(ai.jd_competencies?.search_criteria?.search_criteria_expression || "");
          setOriginalDescription(formData.uploadType === "paste" ? formData.jobDescription : "");
          setOriginalUploadType(formData.uploadType);

          let minExp = ""; let maxExp = "";
          const expLevels = ai.jd_competencies?.critical_competencies?.experience;
          if (expLevels && expLevels.length > 0) {
            const overallExp = expLevels.find((e: any) => e.requirement === "Overall professional experience") || expLevels[0];
            const match = overallExp.minimum?.match(/(\d+)\+?\s*years?/i);
            if (match) { minExp = match[1]; maxExp = (parseInt(match[1]) + 3).toString(); }
          }

          const implicitReqs = ai.jd_competencies?.extracted_insights?.implicit_requirements?.join(", ") || "";
          const niceToHave = ai.technical_competencies?.join(", ") || "";

          const newAiSelectedSkills: any[] = [];
          const tech = ai.jd_competencies?.critical_competencies?.technical;
          if (tech) newAiSelectedSkills.push(...tech.map((t: any) => t.skill));
          const func = ai.jd_competencies?.critical_competencies?.functional;
          if (func) newAiSelectedSkills.push(...func.map((t: any) => t.competency));
          const search = ai.jd_competencies?.search_criteria?.key_search_terms;
          if (search) newAiSelectedSkills.push(...search);

          setFormData((prev: any) => ({
             ...prev,
             minExp: prev.minExp || minExp,
             maxExp: prev.maxExp || maxExp,
             mustHaveRequirements: prev.mustHaveRequirements || implicitReqs,
             niceToHaveRequirements: prev.niceToHaveRequirements || niceToHave,
             aiSelectedSkills: newAiSelectedSkills,
          }));
        }
        setCurrentStep(2);
      } catch (err: any) { showToast.error(err.message || "Failed to generate AI JD"); return; }
      finally { setIsLoading(false); }
    } else if (currentStep === 2) {
      const e = validateStep2(); if (e.length > 0) { showToast.error(e.join(" ")); return; }
      setCurrentStep(3);
    }
  };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  // ── Update ──
  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const allSkills = [...formData.skills, ...(formData.aiSelectedSkills || [])];
      const convertToINRPerYear = (val: string, format: string) => {
        if (!val || isNaN(Number(val))) return "";
        const num = Number(val);
        let converted = num;
        switch (format) {
          case "INR (LPA)": converted = num * 100000; break;
          case "INR (₹/month)": converted = num * 12; break;
          case "INR (₹/year)": converted = num; break;
          case "USD ($/year)": converted = num * 83; break;
          case "USD ($/hour)": converted = num * 2080 * 83; break;
        }
        return converted.toString();
      };

      const finalMinSalary = convertToINRPerYear(formData.minSalary, formData.salaryFormat);
      const finalMaxSalary = convertToINRPerYear(formData.maxSalary, formData.salaryFormat);

      const jobData: Partial<CreateJobData> = {
        title: formData.title, location: formData.location,
        work_approach: formData.workApproach.toUpperCase() as "ONSITE" | "REMOTE" | "HYBRID",
        seniority: formData.seniority, department: departmentNameToId[formData.department] || 8,
        experience_min_years: parseInt(formData.minExp) || 0,
        experience_max_years: parseInt(formData.maxExp) || 0,
        salary_min: finalMinSalary, salary_max: finalMaxSalary,
        is_salary_confidential: formData.confidential,
        visibility: formData.keepPrivate ? "PRIVATE" : "PUBLIC",
        has_coding_contest_stage: formData.codingRound,
        has_ai_interview_stage: formData.aiInterviews,
        skills: allSkills, status: "ACTIVE",
        workspace: parseInt(formData.workspace), ai_jd_object: aiJdResponse,
        num_positions: parseInt(formData.openings) || 0,
        notice_period: formData.noticePeriod,
        poc_email: formData.pocEmail,
        education_level: formData.educationLevel,
        specialisations: formData.specifications,
        ai_jd: editableJD,
        technical_competencies: competencies,
        ...(formData.uploadType === "paste"
          ? { description_text: formData.jobDescription }
          : { description_file: file! }),
      };
      
      await jobPostService.updateJob(jobId, jobData);
      showToast.success("Job role updated successfully!");
      onJobUpdated?.(); setShowSuccessModal(true);
      setCurrentStep(1); setFile(null);
      // Remove draft after successful update
      const drafts = JSON.parse(localStorage.getItem('edit_job_drafts') || '[]');
      localStorage.setItem('edit_job_drafts', JSON.stringify(drafts.filter((d: any) => d.id !== jobId.toString())));
    } catch (err: any) {
      const msg = err.response?.data?.description ? `Description error: ${err.response.data.description}`
        : err.response?.data?.department ? `Department error: ${err.response.data.department.join(" ")}`
          : err.message || "Failed to update job role";
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

  const handleSaveDraft = () => {
    try {
      const drafts = JSON.parse(localStorage.getItem('edit_job_drafts') || '[]');
      const newDraft = {
        id: jobId.toString(),
        workspaceId: parseInt(formData.workspace) || workspaceId,
        title: formData.title || 'Untitled Draft',
        updatedAt: new Date().toISOString(),
        formData: formData,
        aiJdResponse: aiJdResponse,
        editableJD: editableJD,
        competencies: competencies,
        currentStep: currentStep,
        booleanSearchTerm: booleanSearchTerm,
        originalDescription: originalDescription,
        originalUploadType: originalUploadType
      };
      const updatedDrafts = drafts.filter((d: any) => d.id !== jobId.toString());
      updatedDrafts.unshift(newDraft);
      localStorage.setItem('edit_job_drafts', JSON.stringify(updatedDrafts));
      toast.success("Draft saved!");
      setSaveDraftText("Draft Saved!");
      setTimeout(() => setSaveDraftText("Save Draft"), 2000);
    } catch (err) {
      toast.error("Failed to save draft");
    }
  };

  const handleDownloadJD = () => {
    if (!editableJD) { toast.error("No Job Description available."); return; }
    const element = document.createElement("div");
    element.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; color: #333;">
        <h1 style="text-align: center; color: #0F47F2;">${formData.title || "Job Description"}</h1>
        ${formData.clientCompany ? `<h3 style="text-align: center; color: #555;">${formData.clientCompany}</h3>` : ""}
        <hr style="margin-top: 20px; margin-bottom: 20px; border: 0; border-top: 1px solid #eee;" />
        <div style="line-height: 1.6;">${editableJD}</div>
      </div>
    `;
    const opt = {
      margin: 0.5, filename: `${formData.title ? formData.title.replace(/\s+/g, '_') : 'Job_Description'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 }, jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save().then(() => toast.success("JD downloaded successfully!")).catch(() => toast.error("Failed to generate PDF."));
  };

  // ── Success Modal ──
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-500 mb-3">Successfully Updated!</h2>
          <p className="text-gray-600 mb-8">Your job role has been updated successfully.</p>
          <div className="flex gap-3">
            <button onClick={() => { setShowSuccessModal(false); onClose(); resetForm(); }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Close
            </button>
            <button onClick={() => { setShowSuccessModal(false); handlePipelinesClick?.(); onClose(); resetForm(); }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Open Pipeline
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
          <h2 className="text-xl font-bold text-gray-900 mb-3">Unsaved Changes</h2>
          <p className="text-gray-600 mb-8">You have unsaved changes. What would you like to do?</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setShowCancelModal(false)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Continue Editing
            </button>
            <button onClick={() => { handleSaveDraft(); setShowCancelModal(false); onClose(); }}
              className="w-full px-6 py-3 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium">
              Save Draft
            </button>
            <button onClick={() => { setShowCancelModal(false); onClose(); resetForm(); }}
              className="w-full px-6 py-3 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 font-medium">
              Discard
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4" onClick={handleCancel}>
      <div className="bg-white relative rounded-3xl shadow-xl w-full max-w-4xl max-h-[98vh] flex flex-col pt-6 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 px-10">
          <button onClick={handleCancel} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          {/* 3-Step Progress */}
          <div className="flex flex-col items-start">
            <div className="text-start">
              <h2 className="text-md font-semibold text-gray-900 uppercase tracking-wide">
                {stepLabels[currentStep - 1]}
              </h2>
              <p className="text-gray-500 text-sm mt-1">{stepDescriptions[currentStep - 1]}</p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-10 mt-2 pb-6">
          {isFetching ? (
            <div className="flex items-center justify-center h-full">Loading job details...</div>
          ) : (
            <>
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
                  aiJdResponse={aiJdResponse}
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-10 py-4 bg-white rounded-b-2xl">
          {currentStep === 1 && (
            <div className="flex justify-between items-center">
              <button onClick={handleSaveDraft}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                {saveDraftText}
              </button>
              <button onClick={handleNext} disabled={isLoading || isFetching}
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
                <button onClick={handleSaveDraft}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  {saveDraftText}
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
                <button onClick={handleDownloadJD}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                  Download JD <Download className="w-4 h-4" />
                </button>
                <button onClick={handleSaveDraft}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                  {saveDraftText}
                </button>
              </div>
              <button onClick={handleUpdate} disabled={isLoading}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                {isLoading ? "Updating..." : "Update Job"} <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditJobRoleModal;
