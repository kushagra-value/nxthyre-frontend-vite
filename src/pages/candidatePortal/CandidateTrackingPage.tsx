import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import candidateService from "../../services/candidateService";
import { jobPostService } from "../../services/jobPostService";
import apiClient from "../../services/api";
import { showToast } from "../../utils/toast";
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
  const { jobId, applicationId, candidateId } = useParams();
  
  const [jobData, setJobData] = useState<any>(null);
  const [candidateData, setCandidateData] = useState<any>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState(MOCK_CHAT);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const promises: Promise<any>[] = [];

        // Fetch candidate details
        if (candidateId) {
          promises.push(
            candidateService.getCandidateDetails(candidateId)
              .then(res => setCandidateData(res))
              .catch(err => console.error("Error fetching candidate:", err))
          );
        }

        // Fetch job details
        if (jobId) {
          promises.push(
            jobPostService.getJob(parseInt(jobId))
              .then(res => setJobData(res))
              .catch(err => console.error("Error fetching job:", err))
          );
        }

        // Fetch application details
        if (applicationId) {
          promises.push(
            apiClient.get(`/jobs/applications/${applicationId}/`)
              .then(res => setApplicationData(res.data))
              .catch(err => console.error("Error fetching application:", err))
          );
        }

        await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching portal data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [jobId, candidateId, applicationId]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  // Candidate API response nests data under `candidate` key
  const rawCandidate = candidateData?.candidate || candidateData || {};
  const cName = rawCandidate.full_name || MOCK_CANDIDATE.name;
  const cEmail = rawCandidate.email || rawCandidate.premium_data?.email || MOCK_CANDIDATE.email;
  const cPhone = rawCandidate.phone || rawCandidate.premium_data?.phone || MOCK_CANDIDATE.phone;
  const cExp = rawCandidate.total_experience != null ? `${rawCandidate.total_experience} yrs exp` : MOCK_CANDIDATE.experience;
  const cLoc = rawCandidate.location || MOCK_CANDIDATE.location;
  const cCurrentSalary = rawCandidate.current_salary ? `₹${rawCandidate.current_salary} LPA` : MOCK_CANDIDATE.currentCTC;
  const cExpectedCTC = rawCandidate.expected_ctc ? `₹${rawCandidate.expected_ctc} LPA` : MOCK_CANDIDATE.expectedCTC;
  const cNotice = rawCandidate.notice_period_days != null ? `${rawCandidate.notice_period_days} days notice` : MOCK_CANDIDATE.noticePeriod;
  const cLinked = rawCandidate.premium_data?.linkedin_url || MOCK_CANDIDATE.linkedIn;
  const cHeadline = rawCandidate.headline || "";

  // Job API response is flat
  const displayJob = jobData || MOCK_JOB;
  const jTitle = displayJob.title || MOCK_JOB.title;
  const jCompany = displayJob.organization_details?.name || displayJob.company || MOCK_JOB.company;
  const jLoc = Array.isArray(displayJob.location) ? displayJob.location.join(", ") : (displayJob.location || MOCK_JOB.location);
  // Salary values from API are raw numbers (e.g. 100000.00) — convert to LPA
  const formatSalaryLPA = (val: string | number | null) => {
    if (!val) return null;
    const num = typeof val === "string" ? parseFloat(val) : val;
    return (num / 100000).toFixed(1);
  };
  const jBudget = displayJob.salary_max
    ? `₹${formatSalaryLPA(displayJob.salary_min)}-${formatSalaryLPA(displayJob.salary_max)} LPA`
    : MOCK_JOB.budget;
  const jEmployment = displayJob.work_approach || MOCK_JOB.employment;
  const jDomain = displayJob.department_name || MOCK_JOB.domain;
  const jSkills = displayJob.skills || MOCK_JOB.skills;

  return (
    <div className="h-screen bg-[#F8FAFC] font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0 z-50">
        <div className="max-w-7xl mx-10 flex items-center">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl tracking-tight">
            <svg width="96" height="38" viewBox="0 0 96 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_94_1417" fill="white">
                <path d="M0 22C0 9.84974 9.90333 0 22.1197 0H48.2612V14C48.2612 27.2548 37.4576 38 24.1306 38H0V22Z" />
                <path d="M13.7031 14.0907C15.2112 14.0907 16.4052 14.4961 17.285 15.4414C18.1647 16.3867 18.6046 17.6758 18.6046 19.3086V26H15.9064V19.6367C15.9064 18.7148 15.6433 17.9766 15.117 17.4219C14.5985 16.8672 13.9112 16.5898 13.055 16.5898C12.1674 16.5898 11.4565 16.8672 10.9224 17.4219C10.3961 17.9766 10.133 18.7148 10.133 19.6367V26H7.45833L7.45833 14.0907H10.133L10.133 16.1094C10.51 15.4453 11.0049 14.9336 11.6176 14.5742C12.2303 14.207 12.9254 14.0907 13.7031 14.0907Z" />
                <path d="M31.8835 26H28.6551L25.9333 22.2031L23.2233 26H20.0185L24.3309 19.9531L20.2329 14.0825H23.5218L25.9569 17.6914L28.3892 14.0866H31.5942L27.5711 19.9297L31.8835 26Z" />
                <path d="M40.6143 16.8125H37.5155V21.5352C37.5155 22.2461 37.7119 22.7734 38.1047 23.1172C38.5053 23.4531 39.0512 23.6211 39.7424 23.6211C40.0802 23.6211 40.3708 23.5898 40.6143 23.5273V26C40.198 26.0938 39.7149 26.1406 39.1651 26.1406C37.8376 26.1406 36.7811 25.7461 35.9956 24.957C35.2101 24.168 34.8173 23.043 34.8173 21.582V16.8125H32.5787L32.6213 14.0866H34.8173L34.8173 11.1172H37.5155L37.5155 14.0866H40.6143V16.8125Z" />
                <path d="M57.7304 14.0938C59.2464 14.0938 60.4482 14.5625 61.3358 15.5C62.2313 16.4297 62.6791 17.6914 62.6791 19.2852V26.1515H60.9117L60.9117 19.4492C60.9117 18.332 60.5857 17.4375 59.9337 16.7656C59.2896 16.0938 58.4334 15.7578 57.3652 15.7578C56.2654 15.7578 55.3818 16.0977 54.7141 16.7773C54.0543 17.4492 53.7243 18.3398 53.7243 19.4492L53.7244 26.1434H51.957L51.957 11.1172H53.7244L53.7243 16.6133C54.1014 15.8164 54.6355 15.1992 55.3268 14.7617C56.018 14.3164 56.8192 14.0938 57.7304 14.0938Z" />
                <path d="M82.7093 14.0938C83.0157 14.0938 83.381 14.1406 83.8051 14.2344V15.875C83.4202 15.7422 83.0393 15.6758 82.6622 15.6758C81.7432 15.6758 80.9695 16 80.3411 16.6484C79.7205 17.2891 79.4102 18.1016 79.4102 19.0859V26H77.6429V14.0866H79.3732L79.4102 16.2031C79.7558 15.5469 80.2154 15.0312 80.7888 14.6562C81.3622 14.2812 82.0024 14.0938 82.7093 14.0938Z" />
                <path d="M96 19.8125C96 20.1641 95.9921 20.3867 95.9764 20.4805H86.1498C86.2362 21.7305 86.6683 22.7383 87.4459 23.5039C88.2235 24.2695 89.2251 24.6523 90.4505 24.6523C91.3931 24.6523 92.2021 24.4414 92.8776 24.0195C93.561 23.5898 93.9813 23.0195 94.1384 22.3086H95.9058C95.678 23.4883 95.0574 24.4375 94.0441 25.1562C93.0308 25.875 91.8172 26.2344 90.4033 26.2344C88.6988 26.2344 87.2731 25.6484 86.1263 24.4766C84.9873 23.3047 84.4178 21.8438 84.4178 20.0938C84.4178 18.4141 84.9951 16.9961 86.1498 15.8398C87.3045 14.6758 88.7145 14.0938 90.3798 14.0938C91.4245 14.0938 92.3749 14.3398 93.2311 14.832C94.0873 15.3164 94.7629 15.9961 95.2577 16.8711C95.7526 17.7461 96 18.7266 96 19.8125ZM86.2323 18.9922H94.1148C94.0284 18.0234 93.6317 17.2305 92.9248 16.6133C92.2257 15.9883 91.3538 15.6758 90.3091 15.6758C89.2722 15.6758 88.3846 15.9766 87.6462 16.5781C86.9078 17.1797 86.4365 17.9844 86.2323 18.9922Z" />
              </mask>
              <path d="M0 22C0 9.84974 9.90333 0 22.1197 0H48.2612V14C48.2612 27.2548 37.4576 38 24.1306 38H0V22Z" fill="#0F47F2" />
              <path d="M13.7031 14.0907C15.2112 14.0907 16.4052 14.4961 17.285 15.4414C18.1647 16.3867 18.6046 17.6758 18.6046 19.3086V26H15.9064V19.6367C15.9064 18.7148 15.6433 17.9766 15.117 17.4219C14.5985 16.8672 13.9112 16.5898 13.055 16.5898C12.1674 16.5898 11.4565 16.8672 10.9224 17.4219C10.3961 17.9766 10.133 18.7148 10.133 19.6367V26H7.45833L7.45833 14.0907H10.133L10.133 16.1094C10.51 15.4453 11.0049 14.9336 11.6176 14.5742C12.2303 14.207 12.9254 14.0907 13.7031 14.0907Z" fill="white" />
              <path d="M31.8835 26H28.6551L25.9333 22.2031L23.2233 26H20.0185L24.3309 19.9531L20.2329 14.0825H23.5218L25.9569 17.6914L28.3892 14.0866H31.5942L27.5711 19.9297L31.8835 26Z" fill="white" />
              <path d="M40.6143 16.8125H37.5155V21.5352C37.5155 22.2461 37.7119 22.7734 38.1047 23.1172C38.5053 23.4531 39.0512 23.6211 39.7424 23.6211C40.0802 23.6211 40.3708 23.5898 40.6143 23.5273V26C40.198 26.0938 39.7149 26.1406 39.1651 26.1406C37.8376 26.1406 36.7811 25.7461 35.9956 24.957C35.2101 24.168 34.8173 23.043 34.8173 21.582V16.8125H32.5787L32.6213 14.0866H34.8173L34.8173 11.1172H37.5155L37.5155 14.0866H40.6143V16.8125Z" fill="white" />
              <path d="M57.7304 14.0938C59.2464 14.0938 60.4482 14.5625 61.3358 15.5C62.2313 16.4297 62.6791 17.6914 62.6791 19.2852V26.1515H60.9117L60.9117 19.4492C60.9117 18.332 60.5857 17.4375 59.9337 16.7656C59.2896 16.0938 58.4334 15.7578 57.3652 15.7578C56.2654 15.7578 55.3818 16.0977 54.7141 16.7773C54.0543 17.4492 53.7243 18.3398 53.7243 19.4492L53.7244 26.1434H51.957L51.957 11.1172H53.7244L53.7243 16.6133C54.1014 15.8164 54.6355 15.1992 55.3268 14.7617C56.018 14.3164 56.8192 14.0938 57.7304 14.0938Z" fill="#4B5563" />
              <path d="M82.7093 14.0938C83.0157 14.0938 83.381 14.1406 83.8051 14.2344V15.875C83.4202 15.7422 83.0393 15.6758 82.6622 15.6758C81.7432 15.6758 80.9695 16 80.3411 16.6484C79.7205 17.2891 79.4102 18.1016 79.4102 19.0859V26H77.6429V14.0866H79.3732L79.4102 16.2031C79.7558 15.5469 80.2154 15.0312 80.7888 14.6562C81.3622 14.2812 82.0024 14.0938 82.7093 14.0938Z" fill="#4B5563" />
              <path d="M96 19.8125C96 20.1641 95.9921 20.3867 95.9764 20.4805H86.1498C86.2362 21.7305 86.6683 22.7383 87.4459 23.5039C88.2235 24.2695 89.2251 24.6523 90.4505 24.6523C91.3931 24.6523 92.2021 24.4414 92.8776 24.0195C93.561 23.5898 93.9813 23.0195 94.1384 22.3086H95.9058C95.678 23.4883 95.0574 24.4375 94.0441 25.1562C93.0308 25.875 91.8172 26.2344 90.4033 26.2344C88.6988 26.2344 87.2731 25.6484 86.1263 24.4766C84.9873 23.3047 84.4178 21.8438 84.4178 20.0938C84.4178 18.4141 84.9951 16.9961 86.1498 15.8398C87.3045 14.6758 88.7145 14.0938 90.3798 14.0938C91.4245 14.0938 92.3749 14.3398 93.2311 14.832C94.0873 15.3164 94.7629 15.9961 95.2577 16.8711C95.7526 17.7461 96 18.7266 96 19.8125ZM86.2323 18.9922H94.1148C94.0284 18.0234 93.6317 17.2305 92.9248 16.6133C92.2257 15.9883 91.3538 15.6758 90.3091 15.6758C89.2722 15.6758 88.3846 15.9766 87.6462 16.5781C86.9078 17.1797 86.4365 17.9844 86.2323 18.9922Z" fill="#4B5563" />
              <path d="M0 22C0 9.84974 9.90333 0 22.1197 0H48.2612V14C48.2612 27.2548 37.4576 38 24.1306 38H0V22Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
              <path d="M13.7031 14.0907C15.2112 14.0907 16.4052 14.4961 17.285 15.4414C18.1647 16.3867 18.6046 17.6758 18.6046 19.3086V26H15.9064V19.6367C15.9064 18.7148 15.6433 17.9766 15.117 17.4219C14.5985 16.8672 13.9112 16.5898 13.055 16.5898C12.1674 16.5898 11.4565 16.8672 10.9224 17.4219C10.3961 17.9766 10.133 18.7148 10.133 19.6367V26H7.45833L7.45833 14.0907H10.133L10.133 16.1094C10.51 15.4453 11.0049 14.9336 11.6176 14.5742C12.2303 14.207 12.9254 14.0907 13.7031 14.0907Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
              <path d="M31.8835 26H28.6551L25.9333 22.2031L23.2233 26H20.0185L24.3309 19.9531L20.2329 14.0825H23.5218L25.9569 17.6914L28.3892 14.0866H31.5942L27.5711 19.9297L31.8835 26Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
              <path d="M40.6143 16.8125H37.5155V21.5352C37.5155 22.2461 37.7119 22.7734 38.1047 23.1172C38.5053 23.4531 39.0512 23.6211 39.7424 23.6211C40.0802 23.6211 40.3708 23.5898 40.6143 23.5273V26C40.198 26.0938 39.7149 26.1406 39.1651 26.1406C37.8376 26.1406 36.7811 25.7461 35.9956 24.957C35.2101 24.168 34.8173 23.043 34.8173 21.582V16.8125H32.5787L32.6213 14.0866H34.8173L34.8173 11.1172H37.5155L37.5155 14.0866H40.6143V16.8125Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
              <path d="M57.7304 14.0938C59.2464 14.0938 60.4482 14.5625 61.3358 15.5C62.2313 16.4297 62.6791 17.6914 62.6791 19.2852V26.1515H60.9117L60.9117 19.4492C60.9117 18.332 60.5857 17.4375 59.9337 16.7656C59.2896 16.0938 58.4334 15.7578 57.3652 15.7578C56.2654 15.7578 55.3818 16.0977 54.7141 16.7773C54.0543 17.4492 53.7243 18.3398 53.7243 19.4492L53.7244 26.1434H51.957L51.957 11.1172H53.7244L53.7243 16.6133C54.1014 15.8164 54.6355 15.1992 55.3268 14.7617C56.018 14.3164 56.8192 14.0938 57.7304 14.0938Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
              <path d="M82.7093 14.0938C83.0157 14.0938 83.381 14.1406 83.8051 14.2344V15.875C83.4202 15.7422 83.0393 15.6758 82.6622 15.6758C81.7432 15.6758 80.9695 16 80.3411 16.6484C79.7205 17.2891 79.4102 18.1016 79.4102 19.0859V26H77.6429V14.0866H79.3732L79.4102 16.2031C79.7558 15.5469 80.2154 15.0312 80.7888 14.6562C81.3622 14.2812 82.0024 14.0938 82.7093 14.0938Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
              <path d="M96 19.8125C96 20.1641 95.9921 20.3867 95.9764 20.4805H86.1498C86.2362 21.7305 86.6683 22.7383 87.4459 23.5039C88.2235 24.2695 89.2251 24.6523 90.4505 24.6523C91.3931 24.6523 92.2021 24.4414 92.8776 24.0195C93.561 23.5898 93.9813 23.0195 94.1384 22.3086H95.9058C95.678 23.4883 95.0574 24.4375 94.0441 25.1562C93.0308 25.875 91.8172 26.2344 90.4033 26.2344C88.6988 26.2344 87.2731 25.6484 86.1263 24.4766C84.9873 23.3047 84.4178 21.8438 84.4178 20.0938C84.4178 18.4141 84.9951 16.9961 86.1498 15.8398C87.3045 14.6758 88.7145 14.0938 90.3798 14.0938C91.4245 14.0938 92.3749 14.3398 93.2311 14.832C94.0873 15.3164 94.7629 15.9961 95.2577 16.8711C95.7526 17.7461 96 18.7266 96 19.8125ZM86.2323 18.9922H94.1148C94.0284 18.0234 93.6317 17.2305 92.9248 16.6133C92.2257 15.9883 91.3538 15.6758 90.3091 15.6758C89.2722 15.6758 88.3846 15.9766 87.6462 16.5781C86.9078 17.1797 86.4365 17.9844 86.2323 18.9922Z" stroke="white" stroke-opacity="0.26" stroke-width="0.2" mask="url(#path-1-inside-1_94_1417)" />
              <path d="M42.3634 1.2453L43.5063 4.41568L46.9348 5.91743L43.5063 7.08546L42.3634 10.5896L41.2206 7.08546L37.792 5.91743L41.2206 4.41568L42.3634 1.2453Z" fill="white" />
              <path d="M64.0648 14.0927C64.0796 15.6067 64.6713 17.3466 65.7292 18.4064C66.7871 19.4663 68.2137 20.0532 69.695 20.0381C71.1763 20.023 72.5911 19.407 73.6281 18.3258C74.6651 17.2446 75.2531 15.6108 75.2383 14.0968L73.5799 14.0968C73.5903 15.1696 73.2004 16.3951 72.4656 17.1612C71.7308 17.9273 70.7284 18.3637 69.6787 18.3744C68.6291 18.3852 67.6183 17.9693 66.8687 17.2183C66.1191 16.4673 65.7018 15.1654 65.6913 14.0927L64.0648 14.0927Z" fill="#4B5563" />
              <path d="M65.3006 24.323C66.1184 25.2748 67.2303 25.9265 68.4602 26.175C69.6902 26.4235 70.9679 26.2546 72.0911 25.695C73.2142 25.1354 74.1185 24.2171 74.6609 23.0856C75.2032 21.954 75.3526 20.6738 75.0853 19.4478L73.4477 19.8049C73.6355 20.6664 73.5306 21.566 73.1495 22.3612C72.7683 23.1563 72.1329 23.8016 71.3436 24.1949C70.5544 24.5881 69.6565 24.7068 68.7922 24.5322C67.9279 24.3575 67.1465 23.8995 66.5719 23.2307L65.3006 24.323Z" fill="#0F47F2" />
            </svg>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto px-4 sm:px-8 lg:px-12 pt-6 pb-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

          {/* Left Column (Profile, Job Info, My Details) */}
          <div className="lg:col-span-5 relative rounded-xl h-full flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-8 pb-4 pr-2">
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{cName}</h1>
                    <p className="text-gray-500 mt-1 text-sm">{jTitle.split(" — ")[0]} · {cEmail}</p>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {cExp}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                        {cLoc}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                        {cCurrentSalary} CTC
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        {cNotice}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm self-start w-full md:w-auto text-center"
                    >
                      Message Recruiter
                    </button>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm self-start w-full md:w-auto text-center"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 px-2">Applied Position</div>

              {/* Applied Position Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <h2 className="text-lg font-medium text-gray-800">{jTitle}</h2>
                  <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                    {displayJob.status || MOCK_JOB.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Company</div>
                    <div className="text-sm font-medium text-gray-900">{jCompany}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Location</div>
                    <div className="text-sm font-medium text-gray-900">{jLoc}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Budget</div>
                    <div className="text-sm font-medium text-gray-900">{jBudget}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Applied On</div>
                    <div className="text-sm font-medium text-gray-900">{displayJob.created_at ? new Date(displayJob.created_at).toLocaleDateString() : MOCK_JOB.appliedOn}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Employment</div>
                    <div className="text-sm font-medium text-gray-900">{jEmployment}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Domain</div>
                    <div className="text-sm font-medium text-gray-900">{jDomain}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Key Skills Required</div>
                  <div className="flex flex-wrap gap-2">
                    {jSkills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium border border-blue-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sliding Chat Overlay (75% height) */}
            <div className={`absolute bottom-0 left-0 right-0 h-[75%] bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border border-gray-200 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-30 ${isChatOpen ? "translate-y-0" : "translate-y-[105%]"}`}>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-gray-900">Chat with Recruiter</h2>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Sana Majid
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
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
                        <div className={`px-4 py-3 rounded-2xl text-[15px] ${isMe
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
          </div>

          {/* Right Column (Interview Journey) */}
          <div className="lg:col-span-7 h-full flex flex-col overflow-hidden">
            <div className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 px-2 shrink-0">Interview Journey</div>

            {/* Pipeline Progress Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                <h2 className="text-base font-semibold text-gray-900">Pipeline Progress</h2>
                <span className="text-sm text-gray-500 font-medium">Round 2 of 4</span>
              </div>

              <div className="p-6 overflow-y-auto flex-1 pr-4">
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
                                <div className="grid grid-cols-1 gap-4">
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
            </div>
          </div>

        </div>
      </main>
      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900">Edit Profile Details</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input type="text" defaultValue={cName} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input type="text" defaultValue={cEmail} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <input type="text" defaultValue={cPhone} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Location</label>
                  <input type="text" defaultValue={cLoc} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Experience</label>
                  <input type="text" defaultValue={cExp} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Current CTC</label>
                  <input type="text" defaultValue={cCurrentSalary} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Expected CTC</label>
                  <input type="text" defaultValue={cExpectedCTC} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Notice Period</label>
                  <input type="text" defaultValue={cNotice} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">LinkedIn / Portfolio URL</label>
                  <input type="text" defaultValue={cLinked} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors" />
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  showToast.success("Feature coming soon!");
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateTrackingPage;
