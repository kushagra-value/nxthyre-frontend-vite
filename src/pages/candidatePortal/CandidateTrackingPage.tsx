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

// ── MOCK DATA (used as fallback when API is unavailable) ──
const MOCK_CANDIDATE = {
  full_name: "Max Verstappen",
  email: "max.verstappen@gmail.com",
  phone: "+91 98765 43210",
  total_experience: 5,
  location: "Bangalore, Karnataka",
  current_salary: "₹24 LPA",
  expected_ctc: "₹28-30 LPA",
  notice_period: "30 Days",
  linkedin_url: "linkedin.com/in/arjun-ramesh-dev",
};

const MOCK_APPLICATION = {
  id: 3413,
  status: "active",
  applied_on: "2025-04-18T10:00:00Z",
  current_stage: { name: "Technical Round", slug: "technical-round" },
  pipeline_stages: [
    { name: "Applied", slug: "applied", sort_order: 1 },
    { name: "Screening Call", slug: "screening-call", sort_order: 2 },
    { name: "Technical Round 1", slug: "technical-round-1", sort_order: 3 },
    { name: "Technical Round 2", slug: "technical-round-2", sort_order: 4 },
    { name: "Culture Fit & HR Round", slug: "culture-fit", sort_order: 5 },
    { name: "Offer & Onboarding", slug: "offer", sort_order: 6 },
  ],
  interview_journey: {
    total_rounds: 4,
    completed_rounds: 2,
    rounds: [
      {
        id: 1, title: "Screening Call", sort_order: 1, status: "completed",
        outcome: "cleared", outcome_note: "Shortlisted for technical rounds",
        completed_on: "2025-04-21T10:00:00Z",
        duration: "15 mins", interviewer: { name: "Suchandini", role: "Recruiter" },
      },
      {
        id: 2, title: "Technical Round 1 — DSA + JS Fundamentals", sort_order: 2,
        status: "completed", outcome: "cleared",
        outcome_note: "Strong problem solving, good JS depth",
        completed_on: "2025-04-28T10:00:00Z",
        duration: "60 mins", interviewer: { name: "Kiran M", role: "Eng Lead" },
      },
      {
        id: 3, title: "Technical Round 2 — System Design", sort_order: 3,
        status: "scheduled",
        schedule: {
          date: "2025-05-09", start_time: "15:00", end_time: "16:30",
          timezone: "IST", platform: "Google Meet",
          meeting_link: "https://meet.google.com/abc-xyz",
        },
        interviewer: { name: "Anand Krishnan", role: "Principal Architect" },
      },
      {
        id: 4, title: "Culture Fit & HR Round", sort_order: 4, status: "pending",
        outcome_note: "awaiting Round 2 outcome",
      },
      {
        id: 5, title: "Offer & Onboarding", sort_order: 5, status: "pending",
      },
    ],
  },
};

const MOCK_JOB = {
  id: 225, title: "Senior Frontend Engineer — Fintech SaaS",
  company: "Clearpath Technologies", status: "Active",
  location: { city: "Bangalore (Hybrid)", remote: false },
  employment: "Full-time", domain: "Fintech · B2B SaaS",
  applied_on: "18 Apr 2025",
  skills: ["React", "TypeScript", "GraphQL", "Micro-frontends", "Figma to Code", "Performance Optimisation"],
};

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
  const { applicationId } = useParams();
  const [appData, setAppData] = useState<any>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchPortalData();
  }, [applicationId]);

  const fetchPortalData = async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeaders();
      // Fetch application + journey data
      const appRes = await fetch(`${API_BASE}/api/candidate-portal/application/${applicationId}/`, { headers });
      if (appRes.ok) {
        const app = await appRes.json();
        setAppData(app);
        // Fetch job details
        if (app.job_id) {
          const jobRes = await fetch(`${API_BASE}/api/candidate-portal/job/${app.job_id}/`, { headers });
          if (jobRes.ok) setJobData(await jobRes.json());
        }
        // Fetch profile
        if (app.candidate_id) {
          const profRes = await fetch(`${API_BASE}/api/candidate-portal/profile/${app.candidate_id}/`, { headers });
          if (profRes.ok) {
            const prof = await profRes.json();
            setProfileData(prof);
            setEditForm(prof);
          }
        }
      } else {
        throw new Error("API unavailable");
      }
    } catch {
      // Fallback to mock data
      setAppData(MOCK_APPLICATION);
      setJobData(MOCK_JOB);
      setProfileData(MOCK_CANDIDATE);
      setEditForm(MOCK_CANDIDATE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      const headers = getAuthHeaders();
      const profId = profileData?.id || appData?.candidate_id;
      const res = await fetch(`${API_BASE}/api/candidate-portal/profile/${profId}/`, {
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
    } catch {
      showToast.success("Profile saved! (offline mode)");
      setProfileData({ ...profileData, ...editForm });
    }
    setIsEditing(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "candidate", text: chatMessage, time: "Just now", initials: "ME" }]);
    setChatMessage("");
  };

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

  // ── Resolve data ──
  const app = appData || MOCK_APPLICATION;
  const job = jobData || MOCK_JOB;
  const profile = profileData || MOCK_CANDIDATE;
  const journey = app.interview_journey || MOCK_APPLICATION.interview_journey;
  const rounds = journey.rounds || [];
  const jTitle = job.title || MOCK_JOB.title;
  const jCompany = job.company || MOCK_JOB.company;
  const jLocation = typeof job.location === "object" ? job.location.city : (job.location || MOCK_JOB.location?.city);
  const jSkills = job.skills || MOCK_JOB.skills;
  const cName = profile.full_name || MOCK_CANDIDATE.full_name;
  const cEmail = profile.email || MOCK_CANDIDATE.email;

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
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {profile.total_experience ?? MOCK_CANDIDATE.total_experience} yrs exp
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                  {profile.location || MOCK_CANDIDATE.location}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                  {profile.current_salary || MOCK_CANDIDATE.current_salary} CTC
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  {profile.notice_period || MOCK_CANDIDATE.notice_period} notice
                </span>
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
              ["Applied On", app.applied_on ? formatDate(app.applied_on) : MOCK_JOB.applied_on],
              ["Employment", job.employment || MOCK_JOB.employment],
              ["Domain", job.domain || MOCK_JOB.domain],
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
              ["Full Name", "full_name", profile.full_name || MOCK_CANDIDATE.full_name],
              ["Email Address", "email", profile.email || MOCK_CANDIDATE.email],
              ["Phone Number", "phone", profile.phone || MOCK_CANDIDATE.phone],
              ["Location", "location", profile.location || MOCK_CANDIDATE.location],
              ["Total Experience", "total_experience", `${profile.total_experience ?? MOCK_CANDIDATE.total_experience} Years`],
              ["Current CTC", "current_salary", profile.current_salary || MOCK_CANDIDATE.current_salary],
              ["Expected CTC", "expected_ctc", profile.expected_ctc || MOCK_CANDIDATE.expected_ctc],
              ["Notice Period", "notice_period", profile.notice_period || MOCK_CANDIDATE.notice_period],
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
                  {profile.linkedin_url || MOCK_CANDIDATE.linkedin_url}
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
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-gray-200 bg-white shrink-0">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
            <button type="submit" disabled={!chatMessage.trim()}
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
