// components/AddNewStageForm.tsx
import { useState } from 'react';
import StageTypeDropdown from './StageTypeDropdown';

export default function AddNewStageForm() {
  const [stageName, setStageName] = useState('F2F 1');
  const [stageType, setStageType] = useState('face-to-face');
  const [calendarInvite, setCalendarInvite] = useState(false);
  const [reminders, setReminders] = useState({
    panel24h: true,
    candidate48h: true,
    hr30min: true,
  });

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
            Stage Name <span className="text-red-500">*</span>
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

        {/* Calendar Invite Toggle */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <label className="block text-lg font-medium text-[#4B5563]">
              Calendar Invite <span className="text-red-500">*</span>
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

        {/* Reminders & Notifications */}
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
              <div className="relative w-5 h-5 border-2 border-[#0F47F2] rounded">
                {reminders.panel24h && (
                  <>
                    <div className="absolute inset-1 border-2 border-[#0F47F2]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border-2 border-[#0F47F2] rotate-45 translate-x-px -translate-y-px" />
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
              <div className="relative w-5 h-5 border-2 border-[#0F47F2] rounded">
                {reminders.candidate48h && (
                  <>
                    <div className="absolute inset-1 border-2 border-[#0F47F2]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border-2 border-[#0F47F2] rotate-45 translate-x-px -translate-y-px" />
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
              <div className="relative w-5 h-5 border-2 border-[#0F47F2] rounded">
                {reminders.hr30min && (
                  <>
                    <div className="absolute inset-1 border-2 border-[#0F47F2]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border-2 border-[#0F47F2] rotate-45 translate-x-px -translate-y-px" />
                  </>
                )}
              </div>
              <span className="text-lg font-normal text-[#0F47F2]">
                Reminder to HR/Co-ordinator 30 minutes before
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons - Fixed Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#F5F9FB] px-8 py-6 border-t border-gray-200 flex justify-end gap-4">
          <button className="px-6 py-3 text-lg font-medium text-[#0F47F2] bg-[#ECF1FF] border border-[#0F47F2] rounded-lg hover:bg-blue-50 transition">
            Cancel
          </button>
          <button className="px-8 py-3 text-lg font-medium text-[#F5F9FB] bg-[#0F47F2] rounded-lg hover:bg-blue-700 transition">
            Create Stage
          </button>
        </div>
      </div>
    </div>
  );
}