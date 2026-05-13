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

  const fetchPortalData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();

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

      // 2) Fetch job details & profile in parallel using URL params
      const fetchPromises: Promise<void>[] = [];

      if (jobId) {
        fetchPromises.push(
          fetch(`${API_BASE}/candidate-portal/job/${jobId}/`, { headers })
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setJobData(data); })
            .catch(err => console.warn("Job fetch failed:", err))
        );
      }

      // Profile: extract candidate ID from application response
      // The API spec returns candidate info, so we check common field names
      const candidateId = app.candidate_id || app.candidate?.id || app.candidate;
      if (candidateId) {
        fetchPromises.push(
          fetch(`${API_BASE}/candidate-portal/profile/${candidateId}/`, { headers })
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
              // Normalize: API may return array directly or { results: [...] }
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

  const handleProfileSave = async () => {
    try {
      const headers = getAuthHeaders();
      const profId = profileData?.id || appData?.candidate_id;
      const res = await fetch(`${API_BASE}/candidate-portal/profile/${profId}/`, {
        method: "PATCH", headers,
        body: JSON.stringify(editForm),
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
  const jLocation = typeof job.location === "object" ? job.location.city : (job.location || "—");
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
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {profile.total_experience} yrs exp
                  </span>
                )}
                {profile.location && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                    {profile.location}
                  </span>
                )}
                {profile.current_salary && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                    {profile.current_salary} CTC
                  </span>
                )}
                {profile.notice_period && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                    {profile.notice_period} notice
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm shrink-0 flex items-center gap-2"
            >
              <MessageSquare size={16} /> Message Recruiter
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
              ["Employment", job.employment || "—"],
              ["Domain", job.domain || "—"],
            ].map(([label, val]) => (
              <div key={label as string}>
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</div>
                <div className="text-sm font-medium text-gray-900">{val}</div>
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
                    <div className={`absolute -left-6 mt-1 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center z-10
                      ${isCompleted ? "border-green-400" : isScheduled ? "border-blue-400 border-[3px]" : "border-gray-200"}`}>
                      {isCompleted && <CheckCircle2 className="w-5 h-5 fill-green-50 text-green-500" />}
                      {isScheduled && (
                        <span className="w-5 h-5 bg-blue-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
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
                            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-sm text-gray-700 flex items-start gap-2">
                              <span className="font-semibold text-blue-900 shrink-0 capitalize">{round.outcome || "Cleared"}</span>
                              <span className="text-gray-400">—</span>
                              <span>{round.outcome_note}</span>
                            </div>
                          )}
                        </>
                      )}

                      {isScheduled && round.schedule && (
                        <>
                          <p className="text-sm text-gray-500 mb-3">Scheduled · {formatDate(round.schedule.date)}</p>
                          <div className="bg-orange-50/50 border border-orange-100/60 rounded-xl p-5 shadow-sm space-y-3">
                            <div className="flex items-center gap-2.5 text-gray-800 text-sm font-medium">
                              <Calendar className="w-4 h-4 text-orange-500" />
                              {formatScheduleDate(round.schedule.date)}
                            </div>
                            <div className="flex items-center gap-2.5 text-gray-800 text-sm font-medium">
                              <Clock4 className="w-4 h-4 text-orange-500" />
                              {formatTime(round.schedule.start_time)} – {formatTime(round.schedule.end_time)} {round.schedule.timezone}
                              <span className="text-gray-400 font-normal ml-1">
                                ({(() => { const s = round.schedule.start_time.split(":"); const e = round.schedule.end_time.split(":"); return (parseInt(e[0]) * 60 + parseInt(e[1])) - (parseInt(s[0]) * 60 + parseInt(s[1])); })() } mins)
                              </span>
                            </div>
                            {round.interviewer && (
                              <div className="flex items-center gap-2.5 text-gray-800 text-sm font-medium">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                  {round.interviewer.name?.charAt(0)}
                                </div>
                                {round.interviewer.name}
                                <span className="text-gray-400 font-normal">, {round.interviewer.role}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2.5 text-gray-800 text-sm font-medium">
                              <Video className="w-4 h-4 text-orange-500" />
                              <span className="font-semibold">{round.schedule.platform}</span>
                              <span className="text-gray-400 font-normal">· Link will be emailed 1hr before</span>
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
            {[
              ["Full Name", "full_name", profile.full_name || "—"],
              ["Email Address", "email", profile.email || "—"],
              ["Phone Number", "phone", profile.phone || "—"],
              ["Location", "location", profile.location || "—"],
              ["Total Experience", "total_experience", profile.total_experience != null ? `${profile.total_experience} Years` : "—"],
              ["Current CTC", "current_salary", profile.current_salary || "—"],
              ["Expected CTC", "expected_ctc", profile.expected_ctc || "—"],
              ["Notice Period", "notice_period", profile.notice_period || "—"],
            ].map(([label, key, val]) => (
              <div key={key as string} className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
                {isEditing ? (
                  <input type="text" value={editForm[key as string] || ""}
                    onChange={(e) => setEditForm({ ...editForm, [key as string]: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-900">{val}</div>
                )}
              </div>
            ))}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">LinkedIn / Portfolio URL</label>
              {isEditing ? (
                <input type="text" value={editForm.linkedin_url || ""}
                  onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-900">
                  {profile.linkedin_url || profile.portfolio_url || "—"}
                </div>
              )}
            </div>
          </div>
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
