import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import apiClient from '../../../services/api';
import { organizationService, MyWorkspace } from '../../../services/organizationService';
import { jobPostService, AllRoleOption } from '../../../services/jobPostService';
import { scheduleService } from '../../../services/scheduleService';
import { candidateService, PipelineStage } from '../../../services/candidateService';

interface PipelineCandidate {
  id: number;
  candidate: {
    id: string;
    full_name: string;
  };
  stage_slug: string;
}

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  onSuccess?: () => void;
  initialDate?: string;
  initialTime?: string;
  initialCompanyId?: string;
  initialJobId?: string;
  initialApplicationId?: string;
}

// Time options for the Start Time dropdown
const TIME_OPTIONS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM',
];

const DURATION_OPTIONS = ['15 min', '30 min', '45 min', '60 min', '90 min', '120 min'];

const INTERVIEW_MODES = [
  { id: 'face-to-face', label: 'Face to Face', icon: '🤝' },
  { id: 'external', label: 'External Platform', icon: '🔗' },
  { id: 'virtual', label: 'Virtual Interview', icon: '💻' },
  { id: 'mock-call', label: 'Mock Call', icon: '📱' },
];

// Custom dropdown component
const CustomSelect = ({
  label,
  required,
  value,
  placeholder,
  options,
  onChange,
  loading,
  disabled,
  id,
}: {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  loading?: boolean;
  disabled?: boolean;
  id: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <label className="text-sm font-medium text-[#1F2937]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled || loading}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all duration-200 ${
            isOpen ? 'border-[#0F47F2] ring-2 ring-[#0F47F2]/10' : 'border-[#E5E7EB] hover:border-[#D1D5DB]'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
        >
          <span className={selectedLabel ? 'text-[#1F2937]' : 'text-[#9CA3AF]'}>
            {loading ? 'Loading...' : selectedLabel || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-[#E5E7EB] rounded-xl shadow-lg max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            {options.length === 0 ? (
              <div className="px-3.5 py-2.5 text-sm text-[#9CA3AF]">No options available</div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${
                    value === opt.value
                      ? 'bg-[#EEF2FF] text-[#0F47F2] font-medium'
                      : 'text-[#374151] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const EventForm = ({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  initialDate,
  initialTime,
  initialCompanyId,
  initialJobId,
  initialApplicationId,
}: EventFormProps) => {
  // ── Company & Job state ──
  const [workspaces, setWorkspaces] = useState<MyWorkspace[]>([]);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [allJobs, setAllJobs] = useState<AllRoleOption[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');

  // ── Pipeline candidates fetched when job is selected ──
  const [pipelineCandidates, setPipelineCandidates] = useState<PipelineCandidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  // ── Pipeline stages fetched when job is selected ──
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Form state ──
  const [formData, setFormData] = useState({
    title: '',
    attendee: '',
    location: '',
    stageId: '' as string | number,
    type: 'first-round' as string,
    date: initialDate || (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    startTime: initialTime || '11:00 AM',
    duration: '60 min',
    interviewMode: 'virtual',
    meetingLink: '',
    applicationId: '',
    description: '',
    note: '',
    candidateSearch: '',
  });

  // ── Sync initial company/job props ──
  useEffect(() => {
    if (isOpen && initialCompanyId) {
      setSelectedCompanyId(initialCompanyId);
      // We set isInitialMount to false after a short delay to allow all initial sync effects to complete
      // without being interrupted by the reset effects.
      const timer = setTimeout(() => {
        isInitialMount.current = false;
      }, 100);
      return () => clearTimeout(timer);
    } else if (isOpen) {
        isInitialMount.current = false;
    }
  }, [isOpen, initialCompanyId]);

  useEffect(() => {
    if (isOpen && initialJobId && selectedCompanyId) {
      setSelectedJobId(initialJobId);
    }
  }, [isOpen, initialJobId, selectedCompanyId]);

  useEffect(() => {
    if (isOpen && initialApplicationId && selectedJobId) {
      setFormData((prev) => ({ ...prev, applicationId: initialApplicationId }));
    }
  }, [isOpen, initialApplicationId, selectedJobId]);

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        date: initialDate || (() => {
          const d = new Date();
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })(),
        startTime: initialTime || '11:00 AM',
      }));
    }
  }, [isOpen, initialDate, initialTime]);

  // ── Fetch workspaces (companies) ──
  useEffect(() => {
    if (!isOpen) return;
    const fetchWorkspaces = async () => {
      setWorkspacesLoading(true);
      try {
        const data = await organizationService.getMyWorkspacesData();
        setWorkspaces(data.workspaces || []);
      } catch (error) {
        console.error('Failed to fetch workspaces', error);
      } finally {
        setWorkspacesLoading(false);
      }
    };
    fetchWorkspaces();
  }, [isOpen]);

  // ── Fetch jobs (categories) ──
  useEffect(() => {
    if (!isOpen) return;
    const fetchCategories = async () => {
      setJobsLoading(true);
      try {
        const jobs = await jobPostService.getAllRoles();
        setAllJobs(jobs);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchCategories();
  }, [isOpen]);

  // ── Filtered jobs based on selected company ──
  const filteredJobs = selectedCompanyId
    ? allJobs.filter((j) => j.workspace_id === Number(selectedCompanyId))
    : allJobs;

  // Reset job selection when company changes (but not on initial mount with initialCompanyId)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    setSelectedJobId('');
    setPipelineCandidates([]);
    setFormData((prev) => ({ ...prev, applicationId: '' }));
  }, [selectedCompanyId]);

  // ── Fetch pipeline candidates when job is selected ──
  useEffect(() => {
    if (!selectedJobId) {
      setPipelineCandidates([]);
      setPipelineStages([]);
      return;
    }

    const fetchCandidates = async () => {
      setCandidatesLoading(true);
      setPipelineCandidates([]); // Clear before fetch
      try {
        console.log('Fetching candidates for job:', selectedJobId);
        const response = await apiClient.get(
          `/jobs/applications/?job_id=${selectedJobId}`
        );
        const data = response.data;
        let candidateData: PipelineCandidate[] = [];

        if (Array.isArray(data)) {
          candidateData = data;
        } else if (data && Array.isArray(data.results)) {
          candidateData = data.results;
        } else if (data && data.data && Array.isArray(data.data)) {
          candidateData = data.data;
        }

        console.log('Fetched candidates:', candidateData.length);
        setPipelineCandidates(candidateData);
      } catch (error) {
        console.error('Failed to fetch pipeline candidates', error);
      } finally {
        setCandidatesLoading(false);
      }
    };

    const fetchStages = async () => {
      setStagesLoading(true);
      setPipelineStages([]); // Clear before fetch
      try {
        console.log('Fetching stages for job:', selectedJobId);
        const stagesRes = await candidateService.getPipelineStages(Number(selectedJobId));
        let stagesData: any[] = [];
        
        if (Array.isArray(stagesRes)) {
          stagesData = stagesRes;
        } else if (stagesRes && Array.isArray((stagesRes as any).results)) {
          stagesData = (stagesRes as any).results;
        } else if (stagesRes && (stagesRes as any).data && Array.isArray((stagesRes as any).data)) {
          stagesData = (stagesRes as any).data;
        }

        // Sort by sort_order if available
        if (stagesData.length > 0 && typeof stagesData[0].sort_order === 'number') {
          stagesData.sort((a, b) => a.sort_order - b.sort_order);
        }

        console.log('Fetched stages:', stagesData.length);
        setPipelineStages(stagesData);
      } catch (error) {
        console.error('Failed to fetch pipeline stages', error);
      } finally {
        setStagesLoading(false);
      }
    };

    fetchCandidates();
    fetchStages();
  }, [selectedJobId]);

  // Reset applicationId when job changes, but NOT on initial mount/open
  useEffect(() => {
    if (isInitialMount.current) return;
    setFormData((prev) => ({ ...prev, applicationId: '', stageId: '', type: '' }));
  }, [selectedJobId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompanyId) {
      alert('Please select a company');
      return;
    }
    if (!selectedJobId) {
      alert('Please select a job role');
      return;
    }
    if (!formData.applicationId?.trim()) {
      alert('Please select a candidate');
      return;
    }
    if (!formData.stageId) {
      alert('Please select an interview stage');
      return;
    }

    // Convert 12h time to 24h for API
    const convert12to24 = (time12: string) => {
      const [time, modifier] = time12.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const startTime24 = convert12to24(formData.startTime);
    const durationMin = parseInt(formData.duration);
    const [sh, sm] = startTime24.split(':').map(Number);
    const endMinutes = sh * 60 + sm + durationMin;
    const endH = Math.floor(endMinutes / 60) % 24;
    const endM = endMinutes % 60;
    const endTime24 = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const startDateTime = `${formData.date}T${startTime24}:00Z`;
    const endDateTime = `${formData.date}T${endTime24}:00Z`;

    // Map interview mode to API location_type
    let locationType = 'VIRTUAL';
    if (formData.interviewMode === 'face-to-face') locationType = 'ONSITE';
    else if (formData.interviewMode === 'external') locationType = 'HYBRID';

    const payload = {
      application: String(formData.applicationId),
      title: formData.title || 'Interview',
      description: formData.description || formData.note || '',
      stage: Number(formData.stageId),
      start_at: startDateTime,
      end_at: endDateTime,
      location_type: locationType,
      virtual_conference_url: formData.meetingLink || undefined,
      status: 'SCHEDULED',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      participants: [],
      reminder_preferences: {
        candidate: [24],
        interviewers: [2],
      },
    };

    setSubmitting(true);
    try {
      await scheduleService.createEvent(payload);
      onSubmit?.(payload);
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      console.error('Failed to create interview event:', err);
      const detail = err.response?.data;
      const msg = typeof detail === 'string' ? detail : detail?.detail || detail?.message || JSON.stringify(detail) || 'Failed to schedule interview';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      attendee: '',
      location: '',
      stageId: '',
      type: '',
      date: initialDate || (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })(),
      startTime: initialTime || '11:00 AM',
      duration: '60 min',
      interviewMode: 'virtual',
      meetingLink: '',
      applicationId: '',
      description: '',
      note: '',
      candidateSearch: '',
    });
    setSelectedCompanyId('');
    setSelectedJobId('');
    setPipelineCandidates([]);
    setPipelineStages([]);
    isInitialMount.current = true;
    onClose();
  };

  const companyOptions = workspaces.map((ws) => ({
    value: String(ws.id),
    label: ws.name,
  }));

  const jobOptions = filteredJobs.map((job) => ({
    value: String(job.id),
    label: job.title,
  }));

  const stageOptions = pipelineStages.map((stage) => ({
    value: String(stage.id),
    label: stage.name,
  }));

  // Build candidate options from pipeline candidates
  const candidateOptions = pipelineCandidates.map((pc) => ({
    value: String(pc.id),
    label: pc.candidate.full_name,
  }));

  const timeOptions = TIME_OPTIONS.map((t) => ({ value: t, label: t }));
  const durationOptions = DURATION_OPTIONS.map((d) => ({ value: d, label: d }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={handleClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-[780px] max-h-[90vh] bg-white rounded-2xl shadow-xl overflow-y-auto"
        style={{ fontFamily: "'Inter', 'Gellix', sans-serif" }}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <h2 className="text-xl font-semibold text-[#1F2937]">Schedule Interview</h2>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
              id="close-event-form"
            >
              <X className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>
          <p className="text-sm text-[#9CA3AF] mb-8 ml-[2.6rem]">
            Fill in the details to schedule and send the invite
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company & Job Role Row */}
            <div className="grid grid-cols-2 gap-5">
              <CustomSelect
                id="company-select"
                label="Company"
                required
                value={selectedCompanyId}
                placeholder="Select company..."
                options={companyOptions}
                onChange={setSelectedCompanyId}
                loading={workspacesLoading}
              />
              <CustomSelect
                id="job-role-select"
                label="Job Role"
                required
                value={selectedJobId}
                placeholder="Select role..."
                options={jobOptions}
                onChange={setSelectedJobId}
                loading={jobsLoading}
                disabled={!selectedCompanyId}
              />
            </div>

            {/* Candidate */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1F2937]">
                Candidate <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                {candidatesLoading ? (
                  <div className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#9CA3AF]">
                    Loading candidates...
                  </div>
                ) : candidateOptions.length > 0 ? (
                  <select
                    id="candidate-select"
                    required
                    value={formData.applicationId}
                    onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] outline-none focus:border-[#0F47F2] focus:ring-2 focus:ring-[#0F47F2]/10 transition-all appearance-none"
                  >
                    <option value="" disabled>Search by name, role or ID...</option>
                    {candidateOptions.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="candidate-search-input"
                    type="text"
                    placeholder={selectedJobId ? 'No candidates in this pipeline' : 'Select a job role first...'}
                    value={formData.candidateSearch}
                    onChange={(e) => setFormData({ ...formData, candidateSearch: e.target.value, applicationId: e.target.value })}
                    disabled={!selectedJobId}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:border-[#0F47F2] focus:ring-2 focus:ring-[#0F47F2]/10 transition-all disabled:opacity-50 disabled:bg-gray-50"
                  />
                )}
              </div>
            </div>

            {/* Interview Stage */}
            <CustomSelect
              id="interview-stage-select"
              label="Interview Stage"
              required
              value={String(formData.stageId)}
              placeholder="Select stage..."
              options={stageOptions}
              onChange={(val) => {
                const selectedStage = pipelineStages.find((s) => String(s.id) === val);
                setFormData({
                  ...formData,
                  type: selectedStage?.slug || val,
                  stageId: selectedStage ? selectedStage.id : val,
                });
              }}
              loading={stagesLoading}
              disabled={!selectedJobId}
            />

            {/* Date, Start Time, Duration Row */}
            <div className="grid grid-cols-3 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#1F2937]">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="date-input"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] outline-none focus:border-[#0F47F2] focus:ring-2 focus:ring-[#0F47F2]/10 transition-all"
                />
              </div>
              <CustomSelect
                id="start-time-select"
                label="Start Time"
                required
                value={formData.startTime}
                placeholder="Select time..."
                options={timeOptions}
                onChange={(val) => setFormData({ ...formData, startTime: val })}
              />
              <CustomSelect
                id="duration-select"
                label="Duration"
                value={formData.duration}
                placeholder="Select duration..."
                options={durationOptions}
                onChange={(val) => setFormData({ ...formData, duration: val })}
              />
            </div>

            {/* Interview Mode */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-[#1F2937]">
                Interview Mode <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {INTERVIEW_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    id={`mode-${mode.id}`}
                    onClick={() => setFormData({ ...formData, interviewMode: mode.id })}
                    className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.interviewMode === mode.id
                        ? 'border-[#0F47F2] bg-[#EEF2FF] shadow-sm'
                        : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        formData.interviewMode === mode.id
                          ? 'bg-[#0F47F2] text-white shadow-md'
                          : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}
                    >
                      {mode.icon}
                    </span>
                    <span
                      className={`text-xs font-medium text-center ${
                        formData.interviewMode === mode.id ? 'text-[#0F47F2]' : 'text-[#4B5563]'
                      }`}
                    >
                      {mode.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Virtual Interview Link - shown when virtual mode is selected */}
            {formData.interviewMode === 'virtual' && (
              <div className="bg-[#F9FAFB] rounded-xl p-5 border border-[#F3F4F6]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-7 h-7 rounded-md bg-[#1F2937] flex items-center justify-center text-white text-xs">💻</span>
                  <span className="text-sm font-medium text-[#1F2937]">Virtual Interview Link</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#1F2937]">
                    Meeting Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="meeting-link-input"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:border-[#0F47F2] focus:ring-2 focus:ring-[#0F47F2]/10 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1F2937]">
                <span className="mr-1.5">📝</span> Note <span className="text-xs font-normal text-[#9CA3AF]">(optional)</span>
              </label>
              <div className="relative">
                <textarea
                  id="note-textarea"
                  placeholder="Add any notes for the interview..."
                  value={formData.note}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      setFormData({ ...formData, note: e.target.value });
                    }
                  }}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:border-[#0F47F2] focus:ring-2 focus:ring-[#0F47F2]/10 transition-all resize-none"
                />
                <span className="absolute bottom-2.5 right-3.5 text-xs text-[#9CA3AF]">
                  {formData.note.length} / 300
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3F4F6]">
              <button
                type="button"
                onClick={handleClose}
                id="cancel-event-btn"
                className="px-6 py-2.5 text-sm font-medium text-[#4B5563] bg-white border border-[#E5E7EB] rounded-xl hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="schedule-interview-btn"
                disabled={submitting}
                className={`px-6 py-2.5 text-sm font-medium text-white bg-[#0F47F2] rounded-xl hover:bg-[#0D3DD4] transition-colors shadow-sm ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Scheduling...' : 'Schedule Interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
