import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { showToast } from "../../utils/toast";
import { NxtHyreLogo } from "../auth/NxtHyreLogo";
import {
  CheckCircle2,
  Calendar,
  Clock4,
  Video,
  Send,
  MessageSquare,
} from "lucide-react";

const WhatsappIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1794_9003)">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.9968 0C4.9327 0 0 4.93408 0 10.9999C0 13.4055 0.775794 15.6365 2.09459 17.4474L0.723979 21.5342L4.95204 20.183C6.69102 21.334 8.76628 22 11.0032 22C17.0673 22 22 17.0657 22 11.0001C22 4.93428 17.0673 0.000181834 11.0032 0.000181834L10.9968 0ZM7.92589 5.58746C7.7126 5.07662 7.55094 5.05728 7.22781 5.04414C7.11779 5.03775 6.99518 5.03137 6.85925 5.03137C6.43887 5.03137 5.99934 5.1542 5.73423 5.42577C5.4111 5.75556 4.60938 6.52501 4.60938 8.10297C4.60938 9.68093 5.76014 11.207 5.91523 11.4206C6.07688 11.6338 8.15869 14.9189 11.3911 16.2578C13.9188 17.3054 14.6689 17.2083 15.2442 17.0854C16.0846 16.9044 17.1385 16.2833 17.4036 15.5334C17.6687 14.7831 17.6687 14.1429 17.5909 14.0071C17.5134 13.8713 17.2999 13.7939 16.9768 13.632C16.6537 13.4703 15.0825 12.6943 14.7851 12.5908C14.4941 12.481 14.2162 12.5198 13.9966 12.8303C13.6862 13.2635 13.3824 13.7034 13.1367 13.9684C12.9427 14.1754 12.6258 14.2013 12.3608 14.0912C12.0052 13.9427 11.0098 13.5932 9.78129 12.5003C8.83088 11.6533 8.18444 10.5993 7.99706 10.2825C7.80949 9.95925 7.97769 9.77145 8.12621 9.59697C8.28787 9.39639 8.44298 9.25422 8.60463 9.0666C8.76629 8.87917 8.85679 8.78207 8.96024 8.56215C9.07026 8.3488 8.99252 8.12888 8.91498 7.96718C8.83744 7.80548 8.191 6.22752 7.92589 5.58746Z" fill="white"/>
    </g>
    <defs>
      <clipPath id="clip0_1794_9003">
        <rect width="22" height="22" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const CheckMarkIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 14C0 6.26801 6.26801 0 14 0C21.732 0 28 6.26801 28 14C28 21.732 21.732 28 14 28C6.26801 28 0 21.732 0 14Z" fill="#ECFDF5"/>
    <path d="M14 0.75C21.3178 0.75 27.25 6.68223 27.25 14C27.25 21.3178 21.3178 27.25 14 27.25C6.68223 27.25 0.75 21.3178 0.75 14C0.75 6.68223 6.68223 0.75 14 0.75Z" stroke="#059669" strokeOpacity="0.25" strokeWidth="1.5"/>
    <path d="M11.972 4.76028C12.6145 4.21277 12.9357 3.93901 13.2716 3.77848C14.0484 3.40717 14.9515 3.40717 15.7284 3.77848C16.0643 3.93901 16.3855 4.21277 17.028 4.76028C17.2837 4.9782 17.4115 5.08716 17.5481 5.17867C17.8611 5.38847 18.2126 5.53408 18.5822 5.60706C18.7436 5.6389 18.911 5.65227 19.246 5.67899C20.0874 5.74613 20.5081 5.77971 20.8591 5.90369C21.6709 6.19045 22.3096 6.82903 22.5964 7.64089C22.7203 7.99191 22.7538 8.41264 22.8211 9.25409C22.8477 9.58899 22.8611 9.75644 22.893 9.91771C22.9659 10.2874 23.1115 10.6389 23.3214 10.9519C23.4129 11.0885 23.5218 11.2163 23.7398 11.472C24.2872 12.1145 24.561 12.4358 24.7216 12.7716C25.0928 13.5484 25.0928 14.4515 24.7216 15.2284C24.561 15.5643 24.2872 15.8855 23.7398 16.528C23.5218 16.7837 23.4129 16.9115 23.3214 17.0481C23.1115 17.3611 22.9659 17.7126 22.893 18.0824C22.8611 18.2436 22.8477 18.4111 22.8211 18.7459C22.7538 19.5874 22.7203 20.0081 22.5964 20.3591C22.3096 21.1709 21.6709 21.8096 20.8591 22.0964C20.5081 22.2203 20.0874 22.2538 19.246 22.3211C18.911 22.3477 18.7436 22.3612 18.5822 22.393C18.2126 22.466 17.8611 22.6115 17.5481 22.8214C17.4115 22.9129 17.2837 23.0218 17.028 23.2398C16.3855 23.7872 16.0643 24.061 15.7284 24.2216C14.9515 24.5928 14.0484 24.5928 13.2716 24.2216C12.9357 24.061 12.6145 23.7872 11.972 23.2398C11.7163 23.0218 11.5885 22.9129 11.4519 22.8214C11.1389 22.6115 10.7874 22.466 10.4177 22.393C10.2564 22.3612 10.089 22.3477 9.75409 22.3211C8.91264 22.2538 8.4919 22.2203 8.14089 22.0964C7.32903 21.8096 6.69044 21.1709 6.40369 20.3591C6.27971 20.0081 6.24613 19.5874 6.17899 18.7459C6.15226 18.4111 6.1389 18.2436 6.10706 18.0824C6.03408 17.7126 5.88847 17.3611 5.67868 17.0481C5.58716 16.9115 5.4782 16.7837 5.26029 16.528C4.71277 15.8855 4.43902 15.5643 4.27847 15.2284C3.90718 14.4515 3.90718 13.5484 4.27847 12.7716C4.43902 12.4357 4.71277 12.1145 5.26029 11.472C5.4782 11.2163 5.58716 11.0885 5.67868 10.9519C5.88847 10.6389 6.03408 10.2874 6.10706 9.91771C6.1389 9.75644 6.15226 9.58899 6.17899 9.25409C6.24613 8.41264 6.27971 7.99191 6.40369 7.64089C6.69044 6.82903 7.32903 6.19045 8.14089 5.90369C8.4919 5.77971 8.91264 5.74613 9.75409 5.67899C10.089 5.65227 10.2564 5.6389 10.4177 5.60706C10.7874 5.53408 11.1389 5.38847 11.4519 5.17867C11.5885 5.08716 11.7163 4.9782 11.972 4.76028Z" fill="#14AE5C"/>
    <path d="M11 14.5L13 16.5L18 11.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// ── Helper to get auth header ──
const getAuthHeaders = () => {
  const token = localStorage.getItem("portal_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ── Format helpers ──
const formatDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};
const formatScheduleDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};
const formatTime = (t: string) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour > 12 ? hour - 12 : hour}:${m} ${ampm}`;
};

const CandidateTrackingPage = () => {
  const { applicationId, jobId } = useParams();
  const [appData, setAppData] = useState<any>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPortalData();
  }, [applicationId, jobId]);

  // ── Helper to decode JWT payload ──
  const getCandidateIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem("portal_token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.candidate_id || payload.user_id || payload.candidate || null;
    } catch {
      return null;
    }
  };

  const fetchPortalData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const candidateIdFromToken = getCandidateIdFromToken();

      // 1) Fetch application + interview journey (primary data source)
      const appRes = await fetch(`${API_BASE}/candidate-portal/application/${applicationId}/`, { headers });
      if (!appRes.ok) {
        if (appRes.status === 401 || appRes.status === 403) {
          setError("Session expired. Please log in again.");
          return;
        }
        throw new Error(`Application fetch failed (${appRes.status})`);
      }
      const app = await appRes.json();
      setAppData(app);

      // 2) Fetch job details, profile & messages in parallel
      const fetchPromises: Promise<void>[] = [];

      if (jobId) {
        fetchPromises.push(
          fetch(`${API_BASE}/candidate-portal/job/${jobId}/`, { headers })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setJobData(data); })
            .catch(err => console.warn("Job fetch failed:", err))
        );
      }

      // Profile: fetch using candidate UUID from JWT token
      // If it's not in the token, fallback to app.candidate_id
      const profileId = candidateIdFromToken || app.candidate_id || app.candidate?.id || app.candidate;
      
      if (profileId) {
        fetchPromises.push(
          fetch(`${API_BASE}/candidate-portal/profile/${profileId}/`, { headers })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data) {
                setProfileData(data);
                setEditForm(data);
              }
            })
            .catch(err => console.warn("Profile fetch failed:", err))
        );
      }

      // Messages: fetch using applicationId
      fetchPromises.push(
        fetch(`${API_BASE}/candidate-portal/messages/${applicationId}/`, { headers })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              const msgs = Array.isArray(data) ? data : (data.results || data.messages || []);
              setMessages(msgs);
            }
          })
          .catch(err => console.warn("Messages fetch failed:", err))
      );

      await Promise.all(fetchPromises);
    } catch (err: any) {
      console.error("Portal data fetch error:", err);
      setError(err.message || "Failed to load application data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Only these fields are writable per the API spec
  const SAFE_PATCH_FIELDS = ["full_name", "email", "phone", "location", "total_experience", "current_ctc", "expected_ctc", "notice_period", "linkedin_url"];

  const handleProfileSave = async () => {
    try {
      const headers = getAuthHeaders();
      const profileId = profileData?.id || getCandidateIdFromToken() || appData?.candidate_id;
      
      if (!profileId) {
        showToast.error("Could not identify profile ID.");
        return;
      }

      // Only send safe/writable fields
      const safePayload: Record<string, any> = {};
      for (const key of SAFE_PATCH_FIELDS) {
        if (editForm[key] !== undefined) {
          safePayload[key] = editForm[key];
        }
      }
      const res = await fetch(`${API_BASE}/candidate-portal/profile/${profileId}/`, {
        method: "PATCH", headers,
        body: JSON.stringify(safePayload),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfileData(updated);
        showToast.success("Profile updated successfully!");
      } else {
        showToast.error("Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile save error:", err);
      showToast.error("Unable to save profile. Please try again.");
    }
    setIsEditing(false);
  };

  const fetchMessages = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/candidate-portal/messages/${applicationId}/`, { headers });
      if (res.ok) {
        const data = await res.json();
        const msgs = Array.isArray(data) ? data : (data.results || data.messages || []);
        setMessages(msgs);
      }
    } catch (err) {
      console.warn("Messages refresh failed:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isSendingMessage) return;

    const messageText = chatMessage.trim();
    setChatMessage("");

    // Optimistic UI: add message immediately
    const optimisticMsg = { id: `temp-${Date.now()}`, sender: "candidate", text: messageText, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimisticMsg]);

    setIsSendingMessage(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/candidate-portal/messages/${applicationId}/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: messageText }),
      });
      if (res.ok) {
        // Refresh messages to get server-confirmed data
        await fetchMessages();
      } else {
        showToast.error("Failed to send message.");
      }
    } catch (err) {
      console.error("Send message error:", err);
      showToast.error("Unable to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Refresh messages when chat is opened
  useEffect(() => {
    if (isChatOpen && applicationId) {
      fetchMessages();
    }
  }, [isChatOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={fetchPortalData} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              Retry
            </button>
            <a href="/candidate-portal/login" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No application data found.</p>
          <a href="/candidate-portal/login" className="text-blue-600 hover:underline text-sm font-medium">Back to Login</a>
        </div>
      </div>
    );
  }

  // ── Resolve data (appData is guaranteed non-null by the guard above) ──
  const app = appData;
  const job = jobData || {};
  const profile = profileData || {};
  const journey = app.interview_journey || { total_rounds: 0, completed_rounds: 0, rounds: [] };
  const rounds = journey.rounds || [];
  const jTitle = job.title || "—";
  const jCompany = job.company || "—";
  let jLocation = "—";
  if (Array.isArray(job.location)) {
    jLocation = job.location.join(", ");
  } else if (typeof job.location === "object" && job.location !== null) {
    jLocation = job.location.city || "—";
  } else if (typeof job.location === "string") {
    jLocation = job.location;
  }

  if (job.work_approach && jLocation !== "—") {
    const wa = job.work_approach.charAt(0).toUpperCase() + job.work_approach.slice(1).toLowerCase();
    jLocation = `${jLocation} (${wa})`;
  } else if (job.work_approach) {
    const wa = job.work_approach.charAt(0).toUpperCase() + job.work_approach.slice(1).toLowerCase();
    jLocation = wa;
  }

  const jSkills = job.skills || [];
  const cName = profile.full_name || "—";
  const cEmail = profile.email || "—";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center">
          <NxtHyreLogo />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ═══ PROFILE CARD ═══ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{cName}</h1>
              <p className="text-gray-500 mt-1 text-sm">{jTitle.split(" — ")[0]} · {cEmail}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                {profile.total_experience != null && (
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-blue-50/80 text-blue-500 border border-blue-100">
                    {profile.total_experience} yrs exp
                  </span>
                )}
                {profile.location && (
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-purple-50/80 text-purple-500 border border-purple-100">
                    {profile.location}
                  </span>
                )}
                {profile.current_ctc && (
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-orange-50/80 text-orange-500 border border-orange-100">
                    {profile.current_ctc}
                  </span>
                )}
                {profile.notice_period && (
                  <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-green-50/80 text-green-500 border border-green-100">
                    {profile.notice_period}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => window.open('https://wa.me/7828567987', '_blank')}
              className="bg-[#0BA360] hover:bg-[#098C52] text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm shrink-0 flex items-center gap-2"
            >
              <WhatsappIcon /> Whatsapp
            </button>
          </div>
        </div>

        {/* ═══ APPLIED POSITION ═══ */}
        <div className="text-xs font-bold text-gray-400 tracking-widest uppercase px-1">Applied Position</div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <h2 className="text-lg font-medium text-gray-800">{jTitle}</h2>
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium capitalize">
              {app.status || job.status || "Active"}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {[
              ["Company", jCompany],
              ["Location", jLocation],
              ["Applied On", app.applied_on ? formatDate(app.applied_on) : "—"],
              ["Employment", job.employment || job.work_approach || "—"],
              ["Department", job.department || "—"],
            ].map(([label, val]) => (
              <div key={label as string}>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label as string}</div>
                <div className="text-sm font-medium text-gray-900">{val as string}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Skills Required</div>
            <div className="flex flex-wrap gap-2">
              {jSkills.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium border border-blue-100">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ INTERVIEW JOURNEY ═══ */}
        <div className="text-xs font-bold text-gray-400 tracking-widest uppercase px-1">Interview Journey</div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Pipeline Progress</h2>
            <span className="text-sm text-gray-500 font-medium">
              Round {journey.completed_rounds} of {journey.total_rounds}
            </span>
          </div>
          <div className="p-6">
            <div className="relative pl-6 space-y-0">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-200"></div>
              {rounds.map((round: any, idx: number) => {
                const isCompleted = round.status === "completed";
                const isScheduled = round.status === "scheduled";
                const isPending = round.status === "pending";
                return (
                  <div key={round.id || idx} className="relative flex items-start pb-8 last:pb-0">
                    {/* Node */}
                    <div className={`absolute -left-6 mt-1 w-8 h-8 rounded-full flex items-center justify-center z-10
                      ${isCompleted ? "bg-white" : isScheduled ? "bg-blue-600 shadow-sm shadow-blue-200" : "bg-[#F8FAFC] border-2 border-gray-200"}`}>
                      {isCompleted && <CheckMarkIcon />}
                      {isScheduled && (
                        <span className="text-white text-xs font-bold">
                          {round.sort_order || idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="ml-6 w-full">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-base font-medium ${isPending ? "text-gray-400" : isScheduled ? "text-blue-600" : "text-gray-900"}`}>
                          {round.title}
                        </h3>
                        {isScheduled && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">Next</span>
                        )}
                      </div>

                      {isCompleted && (
                        <>
                          <p className="text-sm text-gray-500 mb-3">
                            Completed · {formatDate(round.completed_on)} · {round.duration || ""}{round.interviewer ? ` · ${round.interviewer.name}(${round.interviewer.role})` : ""}
                          </p>
                          {round.outcome_note && (
                            <div className="bg-[#EFF4FF] border border-[#D1E0FF] rounded-lg p-3 text-sm text-gray-700 flex items-start gap-3">
                              <span className="font-semibold text-gray-900 shrink-0 capitalize">{round.outcome || "Cleared"}</span>
                              <span className="text-gray-400">—</span>
                              <span>{round.outcome_note}</span>
                            </div>
                          )}
                        </>
                      )}

                      {isScheduled && round.schedule && (
                        <>
                          <p className="text-sm text-gray-500 mb-3">Scheduled · {formatDate(round.schedule.date)}</p>
                          <div className="bg-[#FFF9F0] border border-[#FFE4C4] rounded-xl p-5 shadow-sm space-y-3">
                            <div className="text-gray-800 text-sm font-medium">
                              {formatScheduleDate(round.schedule.date)}
                            </div>
                            <div className="text-gray-800 text-sm font-medium">
                              {formatTime(round.schedule.start_time)} – {formatTime(round.schedule.end_time)} {round.schedule.timezone}
                              <span className="text-gray-400 font-normal ml-1">
                                ({(() => { const s = round.schedule.start_time.split(":"); const e = round.schedule.end_time.split(":"); return (parseInt(e[0]) * 60 + parseInt(e[1])) - (parseInt(s[0]) * 60 + parseInt(s[1])); })() } mins)
                              </span>
                            </div>
                            {round.interviewer && (
                              <div className="text-gray-800 text-sm font-medium">
                                {round.interviewer.name}
                                <span className="text-gray-400 font-normal"> , {round.interviewer.role}</span>
                              </div>
                            )}
                            <div className="text-gray-800 text-sm font-medium">
                              {round.schedule.platform} <span className="text-gray-400 font-normal">· Link will be emailed 1hr before</span>
                            </div>
                          </div>
                        </>
                      )}

                      {isPending && (
                        <p className="text-sm text-gray-400 mt-1">
                          Pending{round.outcome_note ? ` — ${round.outcome_note}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ MY DETAILS ═══ */}
        <div className="text-xs font-bold text-gray-400 tracking-widest uppercase px-1">My Details</div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900">Candidate Profile</h2>
            {!isEditing ? (
              <button onClick={() => { setIsEditing(true); setEditForm({ ...profile }); }}
                className="px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleProfileSave}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Save
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {/* Editable fields (PATCH-safe per API spec) */}
            {[
              ["Full Name", "full_name", profile.full_name || "—", true],
              ["Email Address", "email", profile.email || "—", true],
              ["Phone Number", "phone", profile.phone || "—", true],
              ["Location", "location", profile.location || "—", true],
              ["Total Experience", "total_experience", profile.total_experience != null ? `${profile.total_experience} Years` : "—", true],
              ["Current CTC", "current_ctc", profile.current_ctc || "—", true],
              ["Expected CTC", "expected_ctc", profile.expected_ctc || "—", true],
              ["Notice Period", "notice_period", profile.notice_period || "—", true],
            ].map(([label, key, val, editable]) => (
              <div key={key as string} className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label as string}</label>
                {isEditing && editable ? (
                  <input type="text" value={editForm[key as string] || ""}
                    onChange={(e) => setEditForm({ ...editForm, [key as string]: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                ) : (
                  <div className={`bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-900 ${!editable ? "opacity-70" : ""}`}>{val as string}</div>
                )}
              </div>
            ))}
            {/* LinkedIn / Portfolio URL — editable */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">LinkedIn / Portfolio URL</label>
              {isEditing ? (
                <input type="text" value={editForm.linkedin_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-900">
                  {profile.linkedin_url || "—"}
                </div>
              )}
            </div>
          </div>

          {/* Skills (read-only from API) */}
          {profile.skills?.length > 0 && (
            <div className="mt-6">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium border border-blue-100">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-8"></div>
      </main>

      {/* ═══ CHAT OVERLAY ═══ */}
      <div className={`fixed bottom-0 right-0 w-full sm:w-[420px] h-[500px] bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border border-gray-200 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-[60] ${isChatOpen ? "translate-y-0" : "translate-y-[110%]"}`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 rounded-t-2xl">
          <h2 className="text-base font-semibold text-gray-900">Chat with Recruiter</h2>
          <button onClick={() => setIsChatOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-8">No messages yet. Start a conversation!</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender === "candidate";
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                {!isMe && msg.initials && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {msg.initials || msg.sender_name?.charAt(0) || "R"}
                  </div>
                )}
                <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                    {msg.text || msg.content || msg.message}
                  </div>
                  {(msg.created_at || msg.time) && (
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {msg.time || formatDate(msg.created_at)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-gray-200 bg-white shrink-0">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
            <button type="submit" disabled={!chatMessage.trim() || isSendingMessage}
              className="absolute right-1.5 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CandidateTrackingPage;
