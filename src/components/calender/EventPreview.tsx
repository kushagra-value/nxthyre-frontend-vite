import apiClient from '../../services/api';
import { showToast } from '../../utils/toast';

interface EventPreviewProps {
  event: any; 
  candidate: any; 
  onClose: () => void; 
  isOpen?: boolean;  
}

export default function EventPreview({ event, candidate, onClose, isOpen = true }: EventPreviewProps) {
 if (!isOpen) return null;

 if (!event || !candidate) {
  return <div>Loading event details...</div>;
}

  const title = event.title || "Interview Event";
  const description = event.description || "No description provided";
  const startDate = new Date(event.start_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const startTime = new Date(event.start_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const endTime = new Date(event.end_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const location = event.location_type === 'VIRTUAL' ? event.virtual_conference_url : event.location_details || 'TBD';
  const attachment = event.attachments_summary?.[0];

  const handleDelete = async () => {
    if (!confirm('Delete this event?')) return;
    try {
      await apiClient.delete(`/jobs/interview-events/${event.id}/`);
      onClose();
      // Trigger refresh (pass callback if needed)
      showToast.success('Event deleted');
    } catch (err) {
      showToast.error('Failed to delete event');
    }
  };

  const handleReschedule = () => { /* Open EventForm with initialEvent={event} */ onClose(); };
  const handleEdit = () => { /* Open EventForm with initialEvent={event}, mode='edit' */ onClose(); };

  
  return (
    <div className="fixed inset-y-0 right-0 w-[700px] bg-[#F5F9FB] rounded-l-3xl shadow-2xl overflow-y-auto font-['Gellix',_sans-serif] flex items-center justify-center">
      <div className="p-8 pt-10 pb-32 relative min-h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
              </div>
              <p className="text-gray-500 mt-2 ml-3">{description}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.2766 16.2766L8.22656 8.22656M16.2766 8.22656L8.22656 16.2766" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="square"/>
                <path d="M4.11827 20.3817C-0.372757 15.8907 -0.372757 8.6093 4.11827 4.11827C8.6093 -0.372757 15.8907 -0.372757 20.3817 4.11827C24.8728 8.6093 24.8728 15.8907 20.3817 20.3817C15.8907 24.8728 8.6093 24.8728 4.11827 20.3817Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="square"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                {candidate.full_name?.split(' ').map((n: any[]) => n[0]).join('') || 'NP'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{candidate.full_name || candidate.candidate_name}</h2>
                <p className="text-gray-500">Candidate</p>
              </div>
            </div>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
              See Profile
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12.8758 6.58459C12.6214 6.82758 12.6214 7.22155 12.8758 7.46454L16.9751 11.3801H4.65065C4.29088 11.3801 3.99922 11.6587 3.99922 12.0024C3.99922 12.346 4.29088 12.6246 4.65065 12.6246H16.9751L12.8758 16.5402C12.6214 16.7832 12.6214 17.1771 12.8758 17.4201C13.1302 17.6631 13.5426 17.6631 13.797 17.4201L19.0084 12.4423C19.2628 12.1993 19.2628 11.8054 19.0084 11.5624L13.797 6.58459C13.5426 6.3416 13.1302 6.3416 12.8758 6.58459Z" fill="#0F47F2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 12.9576C6 8.01047 9.9399 4 14.8 4C19.6601 4 23.6 8.01047 23.6 12.9576C23.6 17.8661 20.7914 23.5937 16.4092 25.6419C15.3877 26.1194 14.2123 26.1194 13.1908 25.6419C8.80866 23.5937 6 17.8661 6 12.9576Z" stroke="#4B5563" strokeWidth="1.5"/>
                <path d="M14.8 16.1C16.6225 16.1 18.1 14.6225 18.1 12.8C18.1 10.9775 16.6225 9.5 14.8 9.5C12.9775 9.5 11.5 10.9775 11.5 12.8C11.5 14.6225 12.9775 16.1 14.8 16.1Z" stroke="#4B5563" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <p className="text-gray-800 leading-relaxed">
                  {location}</p>
                <button className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="13.75" stroke="#818283" strokeWidth="0.5"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.7496 8.04297C15.6527 8.04297 14.7635 8.93218 14.7635 10.0291C14.7635 10.1488 14.774 10.266 14.7944 10.3799L11.9034 12.4036C11.8887 12.4139 11.8748 12.4249 11.8617 12.4365C11.5245 12.1725 11.0999 12.0152 10.6385 12.0152C9.54155 12.0152 8.65234 12.9044 8.65234 14.0013C8.65234 15.0982 9.54155 15.9874 10.6385 15.9874C11.0999 15.9874 11.5245 15.8301 11.8617 15.5661C11.8748 15.5777 11.8887 15.5887 11.9034 15.599L14.7944 17.6227C14.774 17.7365 14.7635 17.8538 14.7635 17.9735C14.7635 19.0704 15.6527 19.9596 16.7496 19.9596C17.8464 19.9596 18.7357 19.0704 18.7357 17.9735C18.7357 16.8766 17.8464 15.9874 16.7496 15.9874C16.1062 15.9874 15.5343 16.2933 15.1713 16.7676L12.4339 14.8514C12.5562 14.5937 12.6246 14.3055 12.6246 14.0013C12.6246 13.6971 12.5562 13.4089 12.4339 13.1512L15.1713 11.235C15.5343 11.7093 16.1062 12.0152 16.7496 12.0152C17.8464 12.0152 18.7357 11.126 18.7357 10.0291C18.7357 8.93218 17.8464 8.04297 16.7496 8.04297ZM15.6801 10.0291C15.6801 9.43844 16.1589 8.95964 16.7496 8.95964C17.3402 8.95964 17.819 9.43844 17.819 10.0291C17.819 10.6197 17.3402 11.0985 16.7496 11.0985C16.1589 11.0985 15.6801 10.6197 15.6801 10.0291ZM10.6385 12.9319C10.0478 12.9319 9.56901 13.4107 9.56901 14.0013C9.56901 14.5919 10.0478 15.0707 10.6385 15.0707C11.2291 15.0707 11.7079 14.5919 11.7079 14.0013C11.7079 13.4107 11.2291 12.9319 10.6385 12.9319ZM16.7496 16.9041C16.1589 16.9041 15.6801 17.3829 15.6801 17.9735C15.6801 18.5642 16.1589 19.043 16.7496 19.043C17.3402 19.043 17.819 18.5642 17.819 17.9735C17.819 17.3829 17.3402 16.9041 16.7496 16.9041Z" fill="#818283"/>
                  </svg>
                </button>
              </div>
              <p className="text-gray-400 mt-2">Location</p>
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 15.178C5 11.5051 5 9.66873 6.13874 8.52772C7.27749 7.38672 9.11026 7.38672 12.7758 7.38672H16.6637C20.3293 7.38672 22.1621 7.38672 23.3008 8.52772C24.4396 9.66873 24.4396 11.5051 24.4396 15.178V17.1258C24.4396 20.7986 24.4396 22.6351 23.3008 23.776C22.1621 24.917 20.3293 24.917 16.6637 24.917H12.7758C9.11026 24.917 7.27749 24.917 6.13874 23.776C5 22.6351 5 20.7986 5 17.1258V15.178Z" stroke="#4B5563" strokeWidth="1.5"/>
                <path d="M9.85938 7.38854V6" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M19.5781 7.38854V6" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M5.51562 12.2461H23.9138" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M20.4444 19.9742C20.4444 20.5014 20.017 20.9288 19.4898 20.9288C18.9625 20.9288 18.5352 20.5014 18.5352 19.9742C18.5352 19.4469 18.9625 19.0195 19.4898 19.0195C20.017 19.0195 20.4444 19.4469 20.4444 19.9742Z" fill="#4B5563"/>
                <path d="M20.4444 16.146C20.4444 16.6733 20.017 17.1006 19.4898 17.1006C18.9625 17.1006 18.5352 16.6733 18.5352 16.146C18.5352 15.6188 18.9625 15.1914 19.4898 15.1914C20.017 15.1914 20.4444 15.6188 20.4444 16.146Z" fill="#4B5563"/>
                <path d="M15.7586 19.9742C15.7586 20.5014 15.2924 20.9288 14.7172 20.9288C14.142 20.9288 13.6758 20.5014 13.6758 19.9742C13.6758 19.4469 14.142 19.0195 14.7172 19.0195C15.2924 19.0195 15.7586 19.4469 15.7586 19.9742Z" fill="#4B5563"/>
                <path d="M15.7586 16.146C15.7586 16.6733 15.2924 17.1006 14.7172 17.1006C14.142 17.1006 13.6758 16.6733 13.6758 16.146C13.6758 15.6188 14.142 15.1914 14.7172 15.1914C15.2924 15.1914 15.7586 15.6188 15.7586 16.146Z" fill="#4B5563"/>
                <path d="M10.8936 19.9742C10.8936 20.5014 10.4662 20.9288 9.939 20.9288C9.41178 20.9288 8.98438 20.5014 8.98438 19.9742C8.98438 19.4469 9.41178 19.0195 9.939 19.0195C10.4662 19.0195 10.8936 19.4469 10.8936 19.9742Z" fill="#4B5563"/>
                <path d="M10.8936 16.146C10.8936 16.6733 10.4662 17.1006 9.939 17.1006C9.41178 17.1006 8.98438 16.6733 8.98438 16.146C8.98438 15.6188 9.41178 15.1914 9.939 15.1914C10.4662 15.1914 10.8936 15.6188 10.8936 16.146Z" fill="#4B5563"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-medium">{startDate}</p>
              <p className="text-gray-800 mt-1">{`${startTime} – ${endTime}`}</p>
              <p className="text-gray-400 mt-2">Date and Time</p>
            </div>
          </div>
        </div>

        {/* Attachment */}
        {attachment && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.1634 21.5971L19.4488 13.6662C20.4436 12.714 20.4436 11.1702 19.4488 10.218C18.454 9.26578 16.8412 9.26578 15.8465 10.218L7.62106 18.0915C5.73101 19.9006 5.73101 22.8339 7.62106 24.6431C9.5111 26.4523 12.5755 26.4523 14.4655 24.6431L22.811 16.6547C25.5963 13.9885 25.5963 9.66579 22.811 6.99963C20.0257 4.33346 15.5097 4.33346 12.7244 6.99963L6 13.4363" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg width="27" height="29" viewBox="0 0 27 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M0 7.74038C0 3.46548 3.46548 0 7.74038 0H18.5096C22.7845 0 26.25 3.46548 26.25 7.74038V21.2019C26.25 25.4768 22.7845 28.9423 18.5096 28.9423H7.74038C3.46548 28.9423 0 25.4768 0 21.2019V7.74038ZM7.74038 2.01923C4.58068 2.01923 2.01923 4.58068 2.01923 7.74038V21.2019C2.01923 24.3616 4.58068 26.9231 7.74038 26.9231H18.5096C21.6693 26.9231 24.2308 24.3616 24.2308 21.2019V7.74038C24.2308 4.58068 21.6693 2.01923 18.5096 2.01923H7.74038Z" fill="white"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M6.73047 9.35337C6.73047 8.79576 7.18249 8.34375 7.74008 8.34375H18.5093C19.0669 8.34375 19.5189 8.79576 19.5189 9.35337C19.5189 9.91096 19.0669 10.363 18.5093 10.363H7.74008C7.18249 10.363 6.73047 9.91096 6.73047 9.35337Z" fill="white"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M6.73047 14.7401C6.73047 14.1825 7.18249 13.7305 7.74008 13.7305H18.5093C19.0669 13.7305 19.5189 14.1825 19.5189 14.7401C19.5189 15.2977 19.0669 15.7497 18.5093 15.7497H7.74008C7.18249 15.7497 6.73047 15.2977 6.73047 14.7401Z" fill="white"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M8.07812 20.1268C8.07812 19.5692 8.53015 19.1172 9.08774 19.1172H17.1647C17.7222 19.1172 18.1743 19.5692 18.1743 20.1268C18.1743 20.6844 17.7222 21.1364 17.1647 21.1364H9.08774C8.53015 21.1364 8.07812 20.6844 8.07812 20.1268Z" fill="white"/>
                    </svg>
                  </div>
                  <span className="text-gray-800 font-medium">{attachment.file_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M11.0019 4.63281C8.76364 4.63281 6.94922 6.44724 6.94922 8.68544C6.94922 10.9237 8.76364 12.7381 11.0019 12.7381C13.2401 12.7381 15.0545 10.9237 15.0545 8.68544C15.0545 6.44724 13.2401 4.63281 11.0019 4.63281ZM8.57027 8.68544C8.57027 7.34256 9.65897 6.25387 11.0019 6.25387C12.3447 6.25387 13.4334 7.34256 13.4334 8.68544C13.4334 10.0283 12.3447 11.117 11.0019 11.117C9.65897 11.117 8.57027 10.0283 8.57027 8.68544Z" fill="#4B5563"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M11 0C6.38089 0 3.2696 2.68387 1.46384 4.95929L1.43127 5.00032C1.02289 5.51475 0.646759 5.98855 0.39159 6.54879C0.118329 7.14874 0 7.80259 0 8.68421C0 9.56583 0.118329 10.2197 0.39159 10.8196C0.646759 11.3799 1.02289 11.8537 1.43128 12.3681L1.46384 12.4091C3.2696 14.6846 6.38089 17.3684 11 17.3684C15.6191 17.3684 18.7304 14.6846 20.5361 12.4091L20.5687 12.3681C20.9772 11.8537 21.3532 11.3799 21.6084 10.8196C21.8817 10.2197 22 9.56583 22 8.68421C22 7.80259 21.8817 7.14874 21.6084 6.54879C21.3532 5.98854 20.9772 5.51474 20.5687 5.0003L20.5361 4.95929C18.7304 2.68387 15.6191 0 11 0ZM2.68013 5.86735C4.34745 3.76639 7.06083 1.48872 11 1.48872C14.9391 1.48872 17.6526 3.76639 19.3199 5.86735C19.7687 6.43286 20.0316 6.77081 20.2044 7.15033C20.3661 7.50514 20.4651 7.93876 20.4651 8.68421C20.4651 9.42966 20.3661 9.86328 20.2044 10.2181C20.0316 10.5976 19.7687 10.9356 19.3199 11.5011C17.6526 13.6021 14.9391 15.8797 11 15.8797C7.06083 15.8797 4.34745 13.6021 2.68013 11.5011C2.23135 10.9356 1.96848 10.5976 1.79557 10.2181C1.63398 9.86328 1.53488 9.42966 1.53488 8.68421C1.53488 7.93876 1.63398 7.50514 1.79557 7.15033C1.96848 6.77081 2.23134 6.43286 2.68013 5.86735Z" fill="#4B5563"/>
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.55358 0.96875H6.81945C2.48413 0.96875 0.75 2.70288 0.75 7.0382V12.2406C0.75 16.5759 2.48413 18.31 6.81945 18.31H12.0218C16.3572 18.31 18.0913 16.5759 18.0913 12.2406V10.5065" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12.9247 1.85224L6.09226 8.6847C5.83214 8.94482 5.57202 9.45639 5.52 9.82923L5.14716 12.4391C5.00843 13.3842 5.67607 14.0432 6.62117 13.9131L9.23103 13.5403C9.5952 13.4882 10.1068 13.2281 10.3756 12.968L17.208 6.13554C18.3872 4.95633 18.9422 3.58637 17.208 1.85224C15.4739 0.118109 14.1039 0.67303 12.9247 1.85224Z" stroke="#4B5563" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.9453 2.83203C12.5262 4.90432 14.1477 6.52573 16.2286 7.11533" stroke="#4B5563" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                    <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.3327 3.67969H0.75" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M15.7101 6.11719L15.2614 12.8469C15.0887 15.4366 15.0024 16.7315 14.1586 17.5209C13.3149 18.3103 12.0171 18.3103 9.42165 18.3103H8.66734C6.07181 18.3103 4.77407 18.3103 3.9303 17.5209C3.08654 16.7315 3.00021 15.4366 2.82755 12.8469L2.37891 6.11719" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M6.60547 8.55469L7.09319 13.4319" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M11.4838 8.55469L10.9961 13.4319" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3.67969 3.67635C3.7342 3.67635 3.76145 3.67635 3.78616 3.67573C4.58938 3.65537 5.29798 3.14464 5.5713 2.38907C5.57971 2.36582 5.58832 2.33997 5.60556 2.28826L5.70026 2.00415C5.78111 1.76162 5.82153 1.64035 5.87514 1.53738C6.08906 1.12659 6.48483 0.841341 6.94219 0.768309C7.05682 0.75 7.18467 0.75 7.44034 0.75H10.649C10.9046 0.75 11.0325 0.75 11.1471 0.768309C11.6045 0.841341 12.0003 1.12659 12.2142 1.53738C12.2678 1.64035 12.3082 1.76162 12.3891 2.00415L12.4838 2.28826C12.501 2.33991 12.5097 2.36584 12.518 2.38907C12.7914 3.14464 13.4999 3.65537 14.3032 3.67573C14.3279 3.67635 14.3551 3.67635 14.4096 3.67635" stroke="#4B5563" strokeWidth="1.5"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p className="text-gray-400 mt-3">Attachment</p>
            </div>
          </div>
        </div>
)}

        {/* Action Buttons */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <button onClick={handleReschedule}  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Reschedule
            </button>
            <button onClick={handleDelete} className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.3327 3.67969H0.75" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M15.7101 6.11719L15.2614 12.8469C15.0887 15.4366 15.0024 16.7315 14.1586 17.5209C13.3149 18.3103 12.0171 18.3103 9.42165 18.3103H8.66734C6.07181 18.3103 4.77407 18.3103 3.9303 17.5209C3.08654 16.7315 3.00021 15.4366 2.82755 12.8469L2.37891 6.11719" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M6.60547 8.55469L7.09319 13.4319" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M11.4838 8.55469L10.9961 13.4319" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3.67969 3.67635C3.7342 3.67635 3.76145 3.67635 3.78616 3.67573C4.58938 3.65537 5.29798 3.14464 5.5713 2.38907C5.57971 2.36582 5.58832 2.33997 5.60556 2.28826L5.70026 2.00415C5.78111 1.76162 5.82153 1.64035 5.87514 1.53738C6.08906 1.12659 6.48483 0.841341 6.94219 0.768309C7.05682 0.75 7.18467 0.75 7.44034 0.75H10.649C10.9046 0.75 11.0325 0.75 11.1471 0.768309C11.6045 0.841341 12.0003 1.12659 12.2142 1.53738C12.2678 1.64035 12.3082 1.76162 12.3891 2.00415L12.4838 2.28826C12.501 2.33991 12.5097 2.36584 12.518 2.38907C12.7914 3.14464 13.4999 3.65537 14.3032 3.67573C14.3279 3.67635 14.3551 3.67635 14.4096 3.67635" stroke="#4B5563" strokeWidth="1.5"/>
              </svg>
              Delete Event
            </button>
            <button onClick={handleEdit} className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.55358 0.96875H6.81945C2.48413 0.96875 0.75 2.70288 0.75 7.0382V12.2406C0.75 16.5759 2.48413 18.31 6.81945 18.31H12.0218C16.3572 18.31 18.0913 16.5759 18.0913 12.2406V10.5065" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.9247 1.85224L6.09226 8.6847C5.83214 8.94482 5.57202 9.45639 5.52 9.82923L5.14716 12.4391C5.00843 13.3842 5.67607 14.0432 6.62117 13.9131L9.23103 13.5403C9.5952 13.4882 10.1068 13.2281 10.3756 12.968L17.208 6.13554C18.3872 4.95633 18.9422 3.58637 17.208 1.85224C15.4739 0.118109 14.1039 0.67303 12.9247 1.85224Z" stroke="#4B5563" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.9453 2.83203C12.5262 4.90432 14.1477 6.52573 16.2286 7.11533" stroke="#4B5563" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}