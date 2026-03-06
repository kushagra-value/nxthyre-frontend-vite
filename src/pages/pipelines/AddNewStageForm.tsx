// components/AddNewStageForm.tsx
import { useState } from 'react';
import StageTypeDropdown from './StageTypeDropdown';
import apiClient from '../../services/api';
import { showToast } from '../../utils/toast';
import { useParams } from 'react-router-dom';

interface AddNewStageFormProps {
  onClose: () => void;
  onStageCreated?: () => void;
}

export default function AddNewStageForm({ onClose, onStageCreated }: AddNewStageFormProps) {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const [stageName, setStageName] = useState('F2F1');
  const [stageType, setStageType] = useState('face-to-face');
  const [calendarInvite, setCalendarInvite] = useState(false);
  const isBackgroundVerification = stageType === 'background';
  const isMockCall = stageType === 'mock';
  const [loading, setLoading] = useState(false);



  const [reminders, setReminders] = useState({
    panel24h: true,
    candidate48h: true,
    hr30min: true,
  });


  const [documentRequired, setDocumentRequired] = useState({
    idProof: true,
    marksheets_10th_12th: true,
    collegeTranscript: true,
    experienceLetters: true,
    panCard: true
  });

  const handleCreateStage = async () => {
    if (!stageName.trim()) {
      showToast.error("Stage name is required");
      return;
    }

    if (!pipelineId) {
      showToast.error("Pipeline ID not found");
      return;
    }

    setLoading(true);

    try {

      let payload: any = {
        name: stageName.trim(),
      };
      if (isBackgroundVerification) {
        // Background Verification stage
        payload.stage_type = "BACKGROUND_VERIFICATION";
        payload.enable_document_reminders = calendarInvite; // Reuse toggle as reminder enable
        payload.required_documents = [];

        if (documentRequired.idProof) payload.required_documents.push("ID_PROOF");
        if (documentRequired.marksheets_10th_12th) payload.required_documents.push("MARKSHEETS_10TH_12TH");
        if (documentRequired.collegeTranscript) payload.required_documents.push("COLLEGE_TRANSCRIPT");
        if (documentRequired.experienceLetters) payload.required_documents.push("EXPERIENCE_LETTERS");
        if (documentRequired.panCard) payload.required_documents.push("PAN_CARD");
      } else if (isMockCall) {
        payload.stage_type = "MOCK_CALL";
      } else {
        const stageTypeMapping: Record<string, string> = {
          'face-to-face': 'FACE_TO_FACE_INTERVIEW',
          'virtual': 'VIRTUAL_INTERVIEW',
          'external': 'EXTERNAL_PLATFORM_INTERVIEW',
        };

        payload.stage_type = stageTypeMapping[stageType] || 'FACE_TO_FACE_INTERVIEW';
        payload.enable_calendar_invite = calendarInvite;
        payload.notify_panel_24h_before = reminders.panel24h;
        payload.notify_candidate_48h_before = reminders.candidate48h;
        payload.notify_hr_30min_before = reminders.hr30min;
      }
      await apiClient.post(`/jobs/roles/${pipelineId}/custom-stages/`, payload);

      showToast.success(`Stage "${stageName}" created successfully`);
      onStageCreated?.();        // Refresh stages in parent
      onClose();                 // Close the form
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.response?.data?.name?.[0] || "Failed to create stage";
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[563px] bg-[#F5F9FB] rounded-l-3xl shadow-2xl overflow-y-auto font-['Gellix',_sans-serif]">
      <div className="p-8 pt-10 pb-32 relative min-h-full">

        {/* Header */}
        <h3 className="text-2xl font-medium text-[#4B5563] mb-10">
          Add New Stage
        </h3>

        {/* Stage Name */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-[#4B5563] mb-3">
            Stage Name <span className="text-[#0F47F2]">*</span>
          </label>

          <input
            type="text"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            className="w-full h-12 px-4 text-lg font-normal text-[#0F47F2] bg-white border-[0.5px] border-[#0F47F2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F47F2] focus:ring-opacity-30"
            placeholder="Enter stage name"
          />
        </div>

        {/* Stage Type Dropdown */}
        <div className="mb-8">
          <StageTypeDropdown value={stageType} onChange={setStageType} />
        </div>

        {isBackgroundVerification && (
          <>
            <div className="mb-8">
              <h4 className="text-lg font-medium text-[#4B5563] mb-5">
                Documents Required
              </h4>
              <div className="space-y-4">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={documentRequired.idProof}
                    onChange={(e) => setDocumentRequired({ ...documentRequired, idProof: e.target.checked })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center w-5 h-5 border-2 border-[#0F47F2] rounded">
                    {documentRequired.idProof && (
                      <>
                        <svg width="10" height="10" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0.5 2.62248L2.6225 4.74498L6.875 0.5" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </>
                    )}
                  </div>
                  <span className="text-lg font-normal text-[#0F47F2]">
                    ID Proof
                  </span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={documentRequired.marksheets_10th_12th}
                    onChange={(e) => setDocumentRequired({ ...documentRequired, marksheets_10th_12th: e.target.checked })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center w-5 h-5 border-2 border-[#0F47F2] rounded">
                    {documentRequired.marksheets_10th_12th && (
                      <>
                        <svg width="10" height="10" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0.5 2.62248L2.6225 4.74498L6.875 0.5" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </>
                    )}
                  </div>
                  <span className="text-lg font-normal text-[#0F47F2]">
                    10th/12th Marksheet
                  </span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={documentRequired.collegeTranscript}
                    onChange={(e) => setDocumentRequired({ ...documentRequired, collegeTranscript: e.target.checked })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center w-5 h-5 border-2 border-[#0F47F2] rounded">
                    {documentRequired.collegeTranscript && (
                      <>
                        <svg width="10" height="10" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0.5 2.62248L2.6225 4.74498L6.875 0.5" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </>
                    )}
                  </div>
                  <span className="text-lg font-normal text-[#0F47F2]">
                    College Transcript
                  </span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={documentRequired.experienceLetters}
                    onChange={(e) => setDocumentRequired({ ...documentRequired, experienceLetters: e.target.checked })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center w-5 h-5 border-2 border-[#0F47F2] rounded">
                    {documentRequired.experienceLetters && (
                      <>
                        <svg width="10" height="10" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0.5 2.62248L2.6225 4.74498L6.875 0.5" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </>
                    )}
                  </div>
                  <span className="text-lg font-normal text-[#0F47F2]">
                    Experience Letters
                  </span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={documentRequired.panCard}
                    onChange={(e) => setDocumentRequired({ ...documentRequired, panCard: e.target.checked })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center w-5 h-5 border-2 border-[#0F47F2] rounded">
                    {documentRequired.panCard && (
                      <>
                        <svg width="10" height="10" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0.5 2.62248L2.6225 4.74498L6.875 0.5" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </>
                    )}
                  </div>
                  <span className="text-lg font-normal text-[#0F47F2]">
                    Pan Card
                  </span>
                </label>
              </div>
            </div>

            <div className="mb-10 flex items-center justify-between">
              <div>
                <label className="block text-lg font-medium text-[#4B5563]">
                  Enable Reminders
                </label>
                <p className="text-lg font-normal text-[#818283] mt-1">
                  Enable reminders for candidates for upload documents
                </p>
              </div>
              <button
                onClick={() => setCalendarInvite(!calendarInvite)}
                className={`relative w-14 h-8 rounded-full transition-colors ${calendarInvite ? 'bg-[#0F47F2]' : 'bg-[#D9D9D9]'}`}
              >
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${calendarInvite ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </>
        )}

        {!isBackgroundVerification && !isMockCall && (
          <>
            <div className="mb-10 flex items-center justify-between">
              <div>
                <label className="block text-lg font-medium text-[#4B5563]">
                  Calendar Invite <span className="text-[#0F47F2]">*</span>
                </label>
                <p className="text-lg font-normal text-[#818283] mt-1">
                  Enable Scheduling invite to candidate for this round stage
                </p>
              </div>

              {/* Custom Toggle Switch */}
              <button
                onClick={() => setCalendarInvite(!calendarInvite)}
                className={`relative w-14 h-8 rounded-full transition-colors ${calendarInvite ? 'bg-[#0F47F2]' : 'bg-[#D9D9D9]'}`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${calendarInvite ? 'translate-x-6' : ''}`}
                />
              </button>
            </div>



            <div className="mb-10">
              <h4 className="text-lg font-medium text-[#4B5563] mb-6">
                Reminders & Notifications
              </h4>

              <div className="space-y-5">
                {/* Notify Panel 24h */}
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminders.panel24h}
                    onChange={(e) => setReminders({ ...reminders, panel24h: e.target.checked })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center w-5 h-5 border-2 border-[#0F47F2] rounded">
                    {reminders.panel24h && (
                      <>
                        <svg width="10" height="10" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0.5 2.62248L2.6225 4.74498L6.875 0.5" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </>
                    )}
                  </div>
                  <span className="text-lg font-normal text-[#0F47F2]">
                    Notify panel 24 hours before
                  </span>
                </label>

                {/* Candidate 48h */}
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminders.candidate48h}
                    onChange={(e) => setReminders({ ...reminders, candidate48h: e.target.checked })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center w-5 h-5 border-2 border-[#0F47F2] rounded">
                    {reminders.candidate48h && (
                      <>
                        <svg width="10" height="10" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0.5 2.62248L2.6225 4.74498L6.875 0.5" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </>
                    )}
                  </div>
                  <span className="text-lg font-normal text-[#0F47F2]">
                    Reminder to candidate 48 hours before
                  </span>
                </label>

                {/* HR 30min */}
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminders.hr30min}
                    onChange={(e) => setReminders({ ...reminders, hr30min: e.target.checked })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-center w-5 h-5 border-2 border-[#0F47F2] rounded">
                    {reminders.hr30min && (
                      <>
                        <svg width="10" height="10" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0.5 2.62248L2.6225 4.74498L6.875 0.5" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                      </>
                    )}
                  </div>
                  <span className="text-lg font-normal text-[#0F47F2]">
                    Reminder to HR/Co-ordinator 30 minutes before
                  </span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons - Fixed Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#F5F9FB] px-8 py-6 border-t border-gray-200 flex justify-left gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-lg font-medium text-[#0F47F2] bg-[#ECF1FF] border border-[#0F47F2] rounded-lg hover:bg-blue-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateStage}
            disabled={loading || !stageName.trim()}
            className={`px-8 py-3 text-lg font-medium text-white rounded-lg transition ${loading || !stageName.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#0F47F2] hover:bg-blue-700'
              }`}
          >
            {loading ? 'Creating...' : 'Create Stage'}
          </button>
        </div>
      </div>
    </div>
  );
}