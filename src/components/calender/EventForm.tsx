import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Briefcase, User } from 'lucide-react';
import { CalendarEvent } from '../../data/mockEvents';
import apiClient from '../../services/api';

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<CalendarEvent, 'id'> & { applicationId: string }) => void;
  initialDate?: string;
  initialTime?: string;
  pipelineStages?: { id: number; name: string; slug: string; sort_order: number }[];
  stagesLoading?: boolean;
}

export const EventForm = ({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  initialTime,
  pipelineStages,
  stagesLoading,
}: EventFormProps) => {

  const [formData, setFormData] = useState({
    title: '',
    attendee: '',
    location: '',
    stageId: '' as string | number,
    type: 'first-round' as CalendarEvent['type'],
    date: initialDate || new Date().toISOString().split('T')[0],
    startTime: initialTime || '09:00',
    endTime: '10:00',
    applicationId: '', 
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.applicationId?.trim()) {
      alert("Application ID is required");
      return;
    }
    if (!formData.stageId) {
      alert("Please select an interview round");
      return;
    }

    const startDateTime = `${formData.date}T${formData.startTime}:00Z`;
    const endDateTime = `${formData.date}T${formData.endTime}:00Z`;

    const payload = {
      application: Number(formData.applicationId),
      title: formData.title || `${formData.attendee} - Interview`,
      description: formData.description,
      stage: Number(formData.stageId),
      start_at: startDateTime,
      end_at: endDateTime,
      location_type: "VIRTUAL", // You can make this dynamic later
      virtual_conference_url: "https://meet.google.com/placeholder", // Replace later
      status: "SCHEDULED",
      timezone: "Asia/Kolkata", // Or detect from browser
      participants: [],
      reminder_preferences: {
        candidate: [24], // 24 hours before
        interviewers: [2] // 2 hours before
      }
    };

    try {
      const response = await apiClient.post('/jobs/interview-events/', payload);
      
      // Trigger parent refresh or toast
      onSubmit({
        title: formData.title || formData.attendee,
        attendee: formData.attendee,
        type: formData.type,
        startTime: formData.startTime,
        endTime: formData.endTime,
        date: formData.date,
        confirmed: true,
        applicationId: formData.applicationId, 
        description: formData.description,
      });

      } catch (err: any) {
      console.error("Failed to create interview event:", err);
      const msg = err.response?.data?.detail || "Failed to schedule interview";
      alert(msg);
    } finally {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      attendee: '',
      location: '',
      stageId: '',
      type: 'first-round',
      date: initialDate || new Date().toISOString().split('T')[0],
      startTime: initialTime || '09:00',
      endTime: '10:00',
      applicationId:'',
      description : ''
    });
    onClose();
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[563px] bg-[#F5F9FB] rounded-l-3xl shadow-2xl overflow-y-auto  font-['Gellix',_sans-serif]">
      <div className="p-8 pt-10 pb-32 relative min-h-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-gray-600">Add Event</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="pb-6 border-b border-gray-300">
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-transparent text-xl text-gray-600 placeholder-gray-300 outline-none"
                />
                <input
                  type="text"
                  placeholder="Add Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-transparent text-base text-gray-400 placeholder-gray-300 outline-none mt-2"
                />
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-gray-300">
            <div className="flex items-center gap-4">
              <User className="w-6 h-6 text-gray-600 flex-shrink-0" />
              <div className="flex-1">
                
                <input
                  type="text"
                  required
                  placeholder="Select Candidate"
                  value={formData.applicationId || ''}
                  onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                  className="w-full bg-transparent text-gray-600 placeholder-gray-400 outline-none border-b border-gray-300 pb-1"
                />
    
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-gray-300">
            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6 text-gray-600 flex-shrink-0" />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full bg-transparent text-gray-600 placeholder-gray-400 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-gray-300">
            <div className="flex items-center gap-4">
              <Briefcase className="w-6 h-6 text-gray-600 flex-shrink-0" />
              <div className="flex-1">
                
                {stagesLoading ? (
                <p className="text-gray-500">Loading rounds...</p>
              ) : pipelineStages?.length === 0 ? (
                <p className="text-gray-500">No rounds available</p>
              ) : (
                <select
                  required
                  value={formData.type}
                  onChange={(e) =>{
                    const selectedSlug = e.target.value;
                    const selectedStage = pipelineStages?.find(stage => stage.slug === selectedSlug);
                    setFormData({
                      ...formData,
                      type: e.target.value as CalendarEvent['type'],
                      stageId: selectedStage ? selectedStage.id : '',
                    })
                  }}
                  className="w-full bg-transparent text-gray-600 outline-none appearance-none text-lg"
                >
                  <option value="">Select Round</option>
                  {pipelineStages?.map((stage) => (
                    <option key={stage.id} value={stage.slug}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              )}
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-gray-300">
            <div className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-gray-600 flex-shrink-0" />
              <div className="flex items-center gap-2">
                
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-transparent text-gray-600 outline-none"
                />
                <p className="text-gray-500 mt-2">
                  {formatDateDisplay(formData.date)}
                </p>
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-gray-300">
            <div className="flex items-center gap-4">
              <Clock className="w-6 h-6 text-gray-600 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-lg text-gray-400 mb-2">
                  Time
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="flex-1 bg-transparent text-gray-600 outline-none"
                  />
                  <span className="text-gray-600">→</span>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="flex-1 bg-transparent text-gray-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-[#0F47F2] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send Event
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 border-2 border-[#0F47F2] text-[#0F47F2] font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
              >
                <Calendar className="w-5 h-5 text-gray-600" />
              </button>
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
              >
                <Clock className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
