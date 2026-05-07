import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Wallet,
  Clock,
  CheckCircle2,
  Circle,
  MessageSquare,
  Send,
  Video,
  Calendar,
  Clock4
} from "lucide-react";

// MOCK DATA for the Tracking Page
const MOCK_CANDIDATE = {
  name: "Max Verstappen",
  email: "max.verstappen@gmail.com",
  phone: "+91 98765 43210",
  experience: "5 yrs exp",
  location: "Bangalore",
  currentCTC: "₹24 LPA",
  expectedCTC: "₹28-30 LPA",
  noticePeriod: "30 days notice",
  linkedIn: "linkedin.com/in/arjun-ramesh-dev" // Notice from figma it was arjun, keeping it as is
};

const MOCK_JOB = {
  title: "Senior Frontend Engineer — Fintech SaaS",
  status: "Active",
  company: "Clearpath Technologies",
  location: "Bangalore (Hybrid)",
  budget: "₹22-28 LPA",
  employment: "Full-time",
  domain: "Fintech - B2B SaaS",
  appliedOn: "18 Apr 2025",
  skills: ["React", "TypeScript", "GraphQL", "Micro-frontends", "Figma to Code", "Performance Optimisation"]
};

const MOCK_PIPELINE = [
  {
    id: 1,
    title: "Screening Call",
    status: "completed",
    date: "21 Apr 2025",
    duration: "15 mins",
    interviewer: "Suchandini (Recruiter)",
    notes: "Shortlisted for technical rounds",
    noteStatus: "Cleared"
  },
  {
    id: 2,
    title: "Technical Round 1 — DSA + JS Fundamentals",
    status: "completed",
    date: "28 Apr 2025",
    duration: "60 mins",
    interviewer: "Kiran M (Eng Lead)",
    notes: "Strong problem solving, good JS depth",
    noteStatus: "Cleared"
  },
  {
    id: 3,
    title: "Technical Round 2 — System Design",
    status: "next",
    date: "09 May 2025",
    details: {
      dateFull: "Thursday, 9 May 2025",
      time: "3:00 PM – 4:30 PM IST",
      duration: "90 mins",
      interviewer: "Anand Krishnan",
      interviewerRole: "Principal Architect",
      platform: "Google Meet",
      platformNotes: "Link will be emailed 1hr before"
    }
  },
  {
    id: 4,
    title: "Culture Fit & HR Round",
    status: "pending",
    notes: "awaiting Round 2 outcome"
  },
  {
    id: 5,
    title: "Offer & Onboarding",
    status: "pending",
  }
];

const MOCK_CHAT = [
  {
    id: 1,
    sender: "recruiter",
    text: "Hi Max! Congratulations on clearing Round 1. You did great on the JS fundamentals section.",
    time: "28 Apr · 5:10 PM",
    initials: "SM"
  },
  {
    id: 2,
    sender: "candidate",
    text: "Thank you Sana! Looking forward to Round 2. Should I prepare anything specific?",
    time: "28 Apr · 5:24 PM",
    initials: "MV"
  },
  {
    id: 3,
    sender: "recruiter",
    text: "Yes — focus on micro-frontend architecture, state management at scale. Anand loves real-world system design problems.",
    time: "28 Apr · 5:30 PM",
    initials: "SM"
  },
  {
    id: 4,
    sender: "candidate",
    text: "Perfect, got it. Will the interview link be sent to my registered email?",
    time: "Now",
    initials: "MV"
  }
];

const CandidateTrackingPage = () => {
  // const { jobId, applicationId, candidateId } = useParams();
  // Using mock data for now, so route params are unused
  // const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState(MOCK_CHAT);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: "candidate",
        text: chatMessage,
        time: "Just now",
        initials: "MV"
      }
    ]);
    setChatMessage("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl tracking-tight">
            nxt<span className="text-gray-900">+</span>hyre
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{MOCK_CANDIDATE.name}</h1>
              <p className="text-gray-500 mt-1 text-sm">{MOCK_JOB.title.split(" — ")[0]} · {MOCK_CANDIDATE.email}</p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {MOCK_CANDIDATE.experience}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                  {MOCK_CANDIDATE.location}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                  {MOCK_CANDIDATE.currentCTC} CTC
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  {MOCK_CANDIDATE.noticePeriod}
                </span>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm self-start">
              Message Recruiter
            </button>
          </div>
        </div>

        <div className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 mt-8 px-2">Applied Position</div>
        
        {/* Applied Position Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <h2 className="text-lg font-medium text-gray-800">{MOCK_JOB.title}</h2>
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
              {MOCK_JOB.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Company</div>
              <div className="text-sm font-medium text-gray-900">{MOCK_JOB.company}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Location</div>
              <div className="text-sm font-medium text-gray-900">{MOCK_JOB.location}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Budget</div>
              <div className="text-sm font-medium text-gray-900">{MOCK_JOB.budget}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Applied On</div>
              <div className="text-sm font-medium text-gray-900">{MOCK_JOB.appliedOn}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Employment</div>
              <div className="text-sm font-medium text-gray-900">{MOCK_JOB.employment}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Domain</div>
              <div className="text-sm font-medium text-gray-900">{MOCK_JOB.domain}</div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Skills Required</div>
            <div className="flex flex-wrap gap-2">
              {MOCK_JOB.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium border border-blue-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 mt-8 px-2">Interview Journey</div>

        {/* Pipeline Progress Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-base font-semibold text-gray-900">Pipeline Progress</h2>
            <span className="text-sm text-gray-500 font-medium">Round 2 of 4</span>
          </div>

          <div className="relative pl-4 md:pl-6 space-y-0 before:absolute before:inset-0 before:ml-8 md:before:ml-10 before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
            {MOCK_PIPELINE.map((stage, index) => {
              const isCompleted = stage.status === "completed";
              const isNext = stage.status === "next";
              const isPending = stage.status === "pending";
              
              return (
                <div key={stage.id} className="relative flex items-start group pb-8 last:pb-0">
                  {/* Timeline Node */}
                  <div className={`absolute -left-4 md:-left-4 mt-1.5 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center shrink-0 z-10 
                    ${isCompleted ? "border-green-400 text-green-500" : isNext ? "border-blue-400 border-[3px]" : "border-gray-200"}`}>
                    {isCompleted && <CheckCircle2 className="w-5 h-5 fill-green-50 text-green-500" />}
                    {isNext && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                  </div>

                  <div className="ml-10 w-full">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`text-base font-medium ${isPending ? 'text-gray-400' : 'text-gray-900'}`}>
                        {stage.title}
                      </h3>
                      {isNext && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">Next</span>
                      )}
                    </div>

                    {isCompleted && (
                      <>
                        <p className="text-sm text-gray-500 mb-3">
                          Completed · {stage.date} · {stage.duration} · {stage.interviewer}
                        </p>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-sm text-gray-700 flex items-start gap-2">
                          <span className="font-semibold text-blue-900 shrink-0">{stage.noteStatus}</span>
                          <span className="text-gray-400">—</span>
                          <span>{stage.notes}</span>
                        </div>
                      </>
                    )}

                    {isNext && stage.details && (
                      <>
                        <p className="text-sm text-gray-500 mb-3">Scheduled · {stage.date}</p>
                        <div className="bg-orange-50/50 border border-orange-100/60 rounded-xl p-5 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2.5 text-gray-800 text-sm font-medium">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                {stage.details.dateFull}
                              </div>
                              <div className="flex items-center gap-2.5 text-gray-800 text-sm font-medium">
                                <Clock4 className="w-4 h-4 text-orange-500" />
                                {stage.details.time} <span className="text-gray-400 font-normal ml-1">({stage.details.duration})</span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2.5 text-gray-800 text-sm font-medium">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">AK</div>
                                <span>{stage.details.interviewer} <span className="text-gray-400 font-normal ml-1">, {stage.details.interviewerRole}</span></span>
                              </div>
                              <div className="flex items-center gap-2.5 text-gray-800 text-sm font-medium">
                                <Video className="w-4 h-4 text-orange-500" />
                                <span>{stage.details.platform} <span className="text-gray-400 font-normal ml-1">· {stage.details.platformNotes}</span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {isPending && stage.notes && (
                      <p className="text-sm text-gray-400 mt-1">Pending — {stage.notes}</p>
                    )}
                    {isPending && !stage.notes && (
                      <p className="text-sm text-gray-400 mt-1">Pending</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 mt-8 px-2">My Details</div>

        {/* My Details Form */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Candidate Profile</h2>
            <button className="text-blue-600 text-sm font-medium px-4 py-1.5 rounded-full border border-blue-200 hover:bg-blue-50 transition-colors">
              Edit
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input type="text" readOnly value={MOCK_CANDIDATE.name} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input type="text" readOnly value={MOCK_CANDIDATE.email} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                <input type="text" readOnly value={MOCK_CANDIDATE.phone} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Location</label>
                <input type="text" readOnly value="Bangalore, Karnataka" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Experience</label>
                <input type="text" readOnly value="5 Years" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Current CTC</label>
                <input type="text" readOnly value={MOCK_CANDIDATE.currentCTC} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Expected CTC</label>
                <input type="text" readOnly value={MOCK_CANDIDATE.expectedCTC} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Notice Period</label>
                <input type="text" readOnly value="30 Days" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">LinkedIn / Portfolio URL</label>
                <input type="text" readOnly value={MOCK_CANDIDATE.linkedIn} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 mt-8 px-2">Messages</div>

        {/* Chat Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
            <h2 className="text-base font-semibold text-gray-900">Chat with Recruiter</h2>
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Sana Majid
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
            {messages.map((msg) => {
              const isMe = msg.sender === "candidate";
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mb-5">
                      {msg.initials}
                    </div>
                  )}
                  <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 rounded-2xl text-[15px] ${
                      isMe 
                        ? "bg-blue-600 text-white rounded-br-sm" 
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 mt-1.5 px-1">{msg.time}</span>
                  </div>
                  {isMe && (
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mb-5">
                      {msg.initials}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white shrink-0">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message to recruiter..."
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!chatMessage.trim()}
                className="absolute right-1.5 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                <Send className="w-4 h-4 ml-[-2px] mt-[1px]" />
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
};

export default CandidateTrackingPage;
