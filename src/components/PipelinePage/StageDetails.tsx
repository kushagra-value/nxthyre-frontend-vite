// StageDetails.tsx
import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  TrendingUp,
  MessageCircle,
  Clock,
  ChevronDown,
  Mail,
  Phone,
  X,
  CheckCircle,
  XCircle,
  MinusCircle,
  Plus,
  Volume2,
  Maximize,
  Play,
} from "lucide-react";

interface Stage {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  candidate_count: number;
}

interface Note {
  noteId: string;
  content: string;
  is_team_note: boolean;
  is_community_note: boolean;
  postedBy: string | null;
  posted_at: string;
  organisation: {
    orgId: string;
    orgName: string;
  };
}

interface PipelineCandidate {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  publicIdentifier: string;
  headline: string;
  summary: string;
  profilePicture: { displayImageUrl: string; artifacts: any[] };
  location: { country: string; city: string };
  industry: string;
  email: string;
  phone: { type: string; number: string };
  positions: Array<{
    title: string;
    companyName: string;
    companyUrn: string;
    startDate: { month: number; year: number };
    endDate?: { month: number; year: number };
    isCurrent: boolean;
    location: string;
    description: string;
  }>;
  educations: Array<{
    schoolName: string;
    degreeName: string;
    fieldOfStudy: string;
    startDate: { year: number };
    endDate: { year: number };
    activities: string;
    description: string;
  }>;
  certifications: Array<{
    name: string;
    authority: string;
    licenseNumber: string;
    startDate: { month: number; year: number };
    endDate?: { month: number; year: number };
    url: string;
  }>;
  skills: Array<{ name: string; endorsementCount: number }>;
  endorsements: any[];
  recommendations: { received: any[]; given: any[] };
  visibility: {
    profile: "PUBLIC" | "CONNECTIONS" | "PRIVATE";
    email: boolean;
    phone: boolean;
  };
  connections: any[];
  meta: {
    fetchedAt: string;
    dataCompleteness: "full" | "partial";
    source: string;
    scopesGranted: string[];
  };
  external_notes: Note[];
  feedbackNotes: Array<{
    subject: string;
    comment: string;
    author: string;
    date: string;
  }>;
  candidateNotes: Array<{
    comment: string;
    author: string;
    date: string;
  }>;
  stageData: {
    uncontacted?: {
      notes: string[];
    };
    invitesSent?: {
      currentStatus: string;
      notes: string[];
      dateSent: string;
      responseStatus: string;
    };
    applied?: {
      appliedDate: string;
      resumeScore: number;
      skillsMatch: string;
      experienceMatch: string;
      highlights: string;
      notes: string[];
    };
    aiInterview?: {
      interviewedDate: string;
      resumeScore: number;
      knowledgeScore: number;
      communicationScore: number;
      integrityScore: number;
      proctoring: {
        deviceUsage: number;
        assistance: number;
        referenceMaterial: number;
        environment: number;
      };
      questions: string[];
      notes: string[];
    };
    shortlisted?: {
      interviewedDate: string;
      resumeScore: number;
      knowledgeScore: number;
      communicationScore: number;
      integrityScore: number;
      proctoring: {
        deviceUsage: number;
        assistance: number;
        referenceMaterial: number;
        environment: number;
      };
      questions: string[];
      notes: string[];
    };
    firstInterview?: {
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    otherInterviews?: {
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    hrRound?: {
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    salaryNegotiation?: {
      salary: string;
      negotiation: string;
      followups: string[];
      interviewNotes: string[];
      interviewDate: string;
      interviewerName: string;
      interviewerEmail: string;
    };
    offerSent?: {
      offerAcceptanceStatus: string;
      offerSentDate: string;
      followups: string[];
      interviewNotes: string[];
      interviewerName: string;
      interviewerEmail: string;
    };
    archived?: {
      reason: string;
      archivedDate: string;
      notes: string[];
    };
  };
}

interface StageDetailsProps {
  selectedCandidate: PipelineCandidate | null;
  selectedStage: string;
  setShowComments: (show: boolean) => void;
  stages: Stage[];
  moveCandidate: (applicationId: number, stageId: number) => Promise<void>;
  archiveCandidate: (applicationId: number) => Promise<void>;
}

const StageDetails: React.FC<StageDetailsProps> = ({
  selectedCandidate,
  selectedStage,
  setShowComments,
  stages,
  moveCandidate,
  archiveCandidate,
}) => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [showMoreProfile, setShowMoreProfile] = useState(false);

  useEffect(() => {
    setActiveTab("Profile");
  }, [selectedStage]);

  const tabs =
    selectedStage === "Uncontacted"
      ? ["Profile", "Assessment", "Activity", "Notes"]
      : ["Profile", "Coding", "Interview", "Activity", "Notes"];

  if (!selectedCandidate) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
          <User className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-base font-medium">No Candidate Selected</p>
        <p className="text-sm mt-1">
          Select a candidate from the list to view their details
        </p>
      </div>
    );
  }

  const stageData = selectedCandidate.stageData;

  const externalNotes =
    selectedCandidate.external_notes.length > 0 ? (
      <div className="space-y-2 mb-4">
        <h4 className="font-medium text-gray-900">External Notes</h4>
        {selectedCandidate.external_notes.map((note, index) => (
          <div key={index} className="bg-gray-50 p-2 rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-blue-600">
                {note.is_team_note
                  ? "Team Note"
                  : note.is_community_note
                  ? "Community Note"
                  : "Note"}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(note.posted_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-800">{note.content}</p>
            {note.postedBy && (
              <p className="text-xs text-gray-500 mt-1">By {note.postedBy}</p>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile":
        const positions = selectedCandidate.positions || [];
        const educations = selectedCandidate.educations || [];
        const certifications = selectedCandidate.certifications || [];
        const skills = selectedCandidate.skills || [];
        const recommendations =
          selectedCandidate.recommendations.received || [];
        return (
          <div className="bg-[#F5F9FB] py-4 px-2 rounded-xl space-y-6">
            <div>
              <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                <User className="w-4 h-4 mr-2 text-[#4B5563]" />
                Profile Summary
              </h3>
              <p className="text-sm pl-6 text-[#818283]">
                {selectedCandidate.summary || "No summary available"}
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                <Briefcase className="w-4 h-4 mr-2 text-[#4B5563]" />
                Experience
              </h3>
              {positions.length > 0 ? (
                (showMoreProfile ? positions : positions.slice(0, 1)).map(
                  (exp, index) => (
                    <div
                      key={index}
                      className="ml-2 border-l-2 border-gray-200 pl-4 mb-4"
                    >
                      <h4 className="text-sm font-medium text-[#4B5563]">
                        {exp.title}
                      </h4>
                      <p className="text-sm text-[#818283]">
                        {exp.companyName} | {exp.location}
                      </p>
                      <p className="text-sm text-[#818283]">
                        {exp.startDate?.month}/{exp.startDate?.year} -{" "}
                        {exp.isCurrent
                          ? "Present"
                          : `${exp.endDate?.month}/${exp.endDate?.year}`}
                      </p>
                      <p className="text-sm text-[#818283] mt-1">
                        {exp.description}
                      </p>
                    </div>
                  )
                )
              ) : (
                <p className="text-sm text-[#818283] ml-4">
                  No experience details available
                </p>
              )}
              {positions.length > 1 && !showMoreProfile && (
                <button
                  onClick={() => setShowMoreProfile(true)}
                  className="text-[#0F47F2] text-sm flex items-center ml-4"
                >
                  View More <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
            <div>
              <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                <GraduationCap className="w-4 h-4 mr-2 text-[#4B5563]" />
                Education
              </h3>
              {educations.length > 0 ? (
                educations.map((edu, index) => (
                  <div
                    key={index}
                    className="ml-2 border-l-2 border-gray-200 pl-4 mb-4"
                  >
                    <h4 className="text-sm font-medium text-[#4B5563]">
                      {edu.degreeName} in {edu.fieldOfStudy}
                    </h4>
                    <p className="text-sm text-[#818283]">{edu.schoolName}</p>
                    <p className="text-sm text-[#818283]">
                      {edu.startDate?.year} - {edu.endDate?.year}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#818283] ml-4">
                  No education details available
                </p>
              )}
            </div>
            <div>
              <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                <Award className="w-4 h-4 mr-2 text-[#4B5563]" />
                Certifications
              </h3>
              {certifications.length > 0 ? (
                certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="ml-2 border-l-2 border-gray-200 pl-4 mb-4"
                  >
                    <h4 className="text-sm font-medium text-[#4B5563]">
                      {cert.name}
                    </h4>
                    <p className="text-sm text-[#818283]">{cert.authority}</p>
                    <p className="text-sm text-[#818283]">
                      {cert.startDate?.month}/{cert.startDate?.year} -{" "}
                      {cert.endDate
                        ? `${cert.endDate?.month}/${cert.endDate?.year}`
                        : "Present"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#818283] ml-4">
                  No certifications available
                </p>
              )}
            </div>
            <div>
              <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                <Star className="w-4 h-4 mr-2 text-[#4B5563]" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2 ml-4">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-[#ECF1FF] text-[#0F47F2] text-sm rounded-md"
                    >
                      {skill.name}{" "}
                      {skill.endorsementCount > 0
                        ? `(${skill.endorsementCount})`
                        : ""}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-[#818283]">No skills available</p>
                )}
              </div>
            </div>
            {/* Recommendations */}
            {/* <div>
              <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-2 text-[#4B5563]" />
                Recommendations
              </h3>
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <div key={index} className="bg-white rounded-md p-3 mb-2">
                    <p className="text-sm text-[#4B5563]">{rec.feedback}</p>
                    <p className="text-xs text-[#818283] mt-1">
                      - {rec.recommender_name || "Anonymous"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#818283] ml-4">
                  No recommendations available
                </p>
              )}
            </div> */}
          </div>
        );
      case "Assessment":
        // Placeholder for Assessment tab (using applied data as example)
        const appliedData = stageData.applied || {};
        return (
          <div className="bg-[#F5F9FB] p-4 rounded-xl space-y-6">
            <h3 className="text-base font-medium text-[#4B5563]">Assessment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-md p-3 text-center">
                <p className="text-sm text-[#818283]">Resume Score</p>
                <p className="text-xl font-bold text-[#0F47F2]">
                  {appliedData.resumeScore || "N/A"}%
                </p>
              </div>
              <div className="bg-white rounded-md p-3 text-center">
                <p className="text-sm text-[#818283]">Skills Match</p>
                <p className="text-xl font-bold text-[#16A34A]">
                  {appliedData.skillsMatch || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#4B5563] mb-2">
                Highlights
              </h4>
              <p className="text-sm text-[#818283] pl-2">
                {appliedData.highlights || "No highlights available"}
              </p>
            </div>
          </div>
        );
      case "Coding":
        // Hardcoded example questions to match CSS reference
        const codingQuestions = [
          {
            question:
              'Write a function to reverse a given string. For example, if the input is "hello", the output should be "olleh".',
            language: "Python",
            difficulty: "Easy",
            status: "Pass",
          },
          {
            question:
              'Write a function to reverse a given string. For example, if the input is "hello", the output should be "olleh".',
            language: "Python",
            difficulty: "Medium",
            status: "Fail",
          },
          {
            question:
              'Write a function to reverse a given string. For example, if the input is "hello", the output should be "olleh".',
            language: "Python",
            difficulty: "Medium",
            status: "Skip",
          },
        ];
        return (
          <div className="bg-[#F5F9FB] px-4 py-2 rounded-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium text-[#4B5563]">Questions</h3>
              <p className="text-base text-[#818283]">02/08/2024</p>
            </div>
            {codingQuestions.map((q, index) => (
              <div
                key={index}
                className="border border-[#4B5563] bg-[#F5F9FB] rounded-xl overflow-hidden"
              >
                <div className="p-2 flex items-start space-x-2">
                  <span className="text-sm text-[#4B5563] font-medium">
                    Q{index + 1}.
                  </span>
                  <p className="text-sm text-[#818283] flex-1">{q.question}</p>
                </div>
                <hr className="border-t border-[#818283]/50" />
                <div className="p-4 flex justify-between items-center text-xs">
                  <span className="text-[#818283]">{q.language}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-[#818283]">
                      {q.difficulty}
                      {/* Placeholder for difficulty icons */}
                      <div className="ml-2 flex space-x-1">
                        <div className="w-2 h-2 bg-[#818283] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#818283] rounded-full opacity-50"></div>
                        <div className="w-2 h-2 bg-[#818283] rounded-full opacity-50"></div>
                      </div>
                    </div>
                    <button className="flex items-center text-[#818283]">
                      Expand <ChevronDown className="w-4 h-4 ml-1" />
                    </button>
                    <div className="flex items-center">
                      {q.status === "Pass" && (
                        <CheckCircle className="w-4 h-4 text-[#007A5A] mr-1" />
                      )}
                      {q.status === "Fail" && (
                        <XCircle className="w-4 h-4 text-[#ED051C] mr-1" />
                      )}
                      {q.status === "Skip" && (
                        <MinusCircle className="w-4 h-4 text-[#818283] mr-1" />
                      )}
                      <span
                        className={`${
                          q.status === "Pass"
                            ? "text-[#007A5A]"
                            : q.status === "Fail"
                            ? "text-[#ED051C]"
                            : "text-[#818283]"
                        } font-medium`}
                      >
                        {q.status}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="px-4 pb-4 text-sm text-[#BCBCBC]">
                  7 hidden lines
                </p>
              </div>
            ))}
          </div>
        );
      case "Interview":
        const interviewData =
          stageData.aiInterview || stageData.shortlisted || {};
        // Hardcoded examples to match CSS
        const vettedSkills = [
          { name: "Meta Ads", rating: 3.5 },
          { name: "Flutter", rating: 4 },
          { name: "SEO", rating: 4.5 },
          { name: "Meta Ads", rating: 3.5 },
          { name: "Flutter", rating: 4 },
          { name: "SEO", rating: 4.5 },
        ];
        const questions = [
          {
            question:
              "Q1: Can you describe a project where you implemented a machine learning model using AWS SageMaker? What was your role, and what were the key challenges you faced?",
            answer:
              "Abhishek discussed building a video summarization pipeline using AWS, focusing on extracting key video events. He cited challenges with data handling and optimization, describing the implementation of auto-scaling in SageMaker.",
            expanded: true,
          },
          {
            question:
              "Q2: Explain how you would approach to implement a Natural Language Processing model for text classification. What techniques would you consider?",
            answer: "",
            expanded: false,
          },
          {
            question: "Q3: How do you handle class imbalance in your dataset?",
            answer: "",
            expanded: false,
          },
          {
            question:
              "Q4: Can you design a simple API endpoint for this model?",
            answer: "",
            expanded: false,
          },
        ];
        return (
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-2">
              <h4 className="text-base font-medium text-[#4B5563] mb-4">
                Overall Score
              </h4>
              <div className="w-[100%] flex justify-between items-center space-x-4">
                <div className="w-[30%] bg-[#ECF1FF] rounded-xl p-4 text-center">
                  <p className="text-base text-[#4B5563]">Resume</p>
                  <p className="text-2xl font-normal text-[#EAB308]">72%</p>
                </div>
                <div className="w-[30%] bg-[#ECF1FF] rounded-xl p-4 text-center">
                  <p className="text-base text-[#4B5563]">Knowledge</p>
                  <p className="text-2xl font-normal text-[#16A34A]">80%</p>
                </div>
                <div className="w-[40%] bg-[#ECF1FF] rounded-xl p-6 text-center">
                  <p className="text-base text-[#4B5563]">Communication</p>
                  <p className="text-2xl font-normal text-[#0F47F2]">92%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-2">
              <h4 className="text-base font-medium text-[#4B5563] mb-2">
                General Summary
              </h4>
              <p className="text-sm text-[#818283]">
                Abhishek demonstrates solid domain knowledge and experience in
                ML engineering, particularly with AWS. However, clarity in
                communication needs improvement. He covers many questions, but
                responses sometimes lack depth or are unclear due to noise
                interference.
              </p>
            </div>
            <div className="bg-white rounded-xl p-2">
              <h4 className="text-base font-medium text-[#4B5563] mb-4">
                Vetted Skills
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {vettedSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-[#ECF1FF] rounded-md p-2 flex items-center justify-center space-x-2"
                  >
                    <span className="text-sm text-[#0F47F2]">{skill.name}</span>
                    <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />
                    <span className="text-sm text-[#4B5563]">
                      {skill.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#FDE7E7] rounded-xl p-2">
              <h4 className="text-base font-medium text-[#F20A0A] mb-2">
                Potential Red Flags
              </h4>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Tab switch count: 1<br />
                Casual attire
                <br />
                Slightly low eye contact
                <br />
                Sub-optimal background
              </p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <h4 className="text-base font-medium text-[#4B5563] mb-4">
                Interview Recording
              </h4>
              <div className="bg-[#F5F9FB] rounded-xl p-4 flex items-center space-x-4">
                <Play className="w-4 h-4 ml-1" />
                <div className="flex-1">
                  <div className="h-0.5 bg-[#F0F0F0] rounded-full">
                    <div className="w-1/3 h-0.5 bg-[#0F47F2] rounded-full"></div>
                  </div>
                </div>
                <span className="text-sm text-[#4B5563]">1.01 / 5.40</span>
                <Volume2 className="w-5 h-5 text-[#4B5563]" />
                <Maximize className="w-5 h-5 text-[#4B5563]" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-medium text-[#4B5563] mb-4">
                Question Analysis
              </h4>
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div
                    key={index}
                    className={`border ${
                      q.expanded ? "border-[#0F47F2]" : "border-[#818283]"
                    } bg-white rounded-md p-4`}
                  >
                    <div className="flex justify-between items-start">
                      <p
                        className={`text-sm font-medium ${
                          q.expanded ? "text-[#4B5563]" : "text-[#818283]"
                        }`}
                      >
                        {q.question}
                      </p>
                      {q.expanded ? null : (
                        <Plus className="w-4 h-4 text-[#818283]" />
                      )}
                    </div>
                    {q.expanded && (
                      <p className="text-sm text-[#4B5563] mt-2">{q.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "Activity":
        // Placeholder for Activity tab
        return (
          <div className="bg-[#F5F9FB] p-4 rounded-xl space-y-4">
            <h3 className="text-base font-medium text-[#4B5563]">Activity</h3>
            <div className="space-y-2">
              <div className="bg-white rounded-md p-3">
                <p className="text-sm text-[#4B5563]">
                  Moved to {selectedStage}
                </p>
                <p className="text-xs text-[#818283]">
                  Date: {new Date().toLocaleDateString()}
                </p>
              </div>
              {/* Add more activity items as needed */}
            </div>
          </div>
        );
      case "Notes":
        const allNotes = [
          ...selectedCandidate.candidateNotes,
          ...selectedCandidate.external_notes.map((n) => ({
            comment: n.content,
            author: n.postedBy || "Anonymous",
            date: n.posted_at,
          })),
        ];
        return (
          <div className="bg-[#F5F9FB] p-4 rounded-xl space-y-4">
            <h3 className="text-base font-medium text-[#4B5563]">Notes</h3>
            <div className="space-y-2">
              {allNotes.length > 0 ? (
                allNotes.map((note, index) => (
                  <div key={index} className="bg-white rounded-md p-3">
                    <p className="text-sm text-[#4B5563]">
                      {note.comment || note.content}
                    </p>
                    <p className="text-xs text-[#818283] mt-1">
                      By {note.author} - {note.date}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#818283]">No notes available</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const bottomContent = () => {
    switch (selectedStage) {
      case "Uncontacted":
      case "Invites Sent":
      case "Applied":
      case "AI Interview":
      case "Shortlisted":
      case "First Interview":
      case "Other Interviews":
      case "HR Round":
        return (
          <div className="flex space-x-4 w-full">
            <button
              onClick={() => {
                const currentIndex = stages.findIndex(
                  (s) => s.name === selectedStage
                );
                const nextStage = stages[currentIndex + 1];
                if (nextStage)
                  moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
              }}
              className="flex-1 py-3 bg-[#0F47F2] text-white text-base font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Move to Next Stage
            </button>
            <button
              onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
              className="flex-1 py-3 bg-[#0F47F2] text-white text-base font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Archive
            </button>
          </div>
        );
      case "Salary Negotiation":
        return (
          <div className="flex space-x-4 w-full">
            <button
              onClick={() => {
                const currentIndex = stages.findIndex(
                  (s) => s.name === selectedStage
                );
                const nextStage = stages[currentIndex + 1];
                if (nextStage)
                  moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
              }}
              className="flex-1 py-3 bg-[#0F47F2] text-white text-base font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Send Offer
            </button>
            <button
              onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
              className="flex-1 py-3 bg-[#0F47F2] text-white text-base font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Archive
            </button>
          </div>
        );
      case "Offer Sent":
        return (
          <button className="w-full py-3 bg-[#0F47F2] text-white text-base font-medium rounded-xl hover:bg-blue-700 transition-colors">
            Follow Up on Offer
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden relative h-full">
        {selectedStage === "Uncontacted" && (
          <div className="">
            <button
              // onClick={handleSendInviteClick}
              className="flex-1 px-3 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              style={{ width: "100%" }}
            >
              Send Invite & Reveal Info
            </button>
          </div>
        )}
        <div className="">
          <div className="flex space-x-3 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-2 text-sm font-medium ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                {tab === "Activity" && (
                  <span className="ml-1">
                    ({selectedCandidate?.candidateNotes?.length || 0})
                  </span>
                )}
                {tab === "Notes" && (
                  <span className="ml-1">
                    ({selectedCandidate?.candidateNotes?.length || 0})
                  </span>
                )}
                {/* {activeTab === tab && (
                <div className="absolute -bottom-[1px] left-0 right-0 h-1 bg-[#0F47F2] rounded-t-xl" />
              )} */}
              </button>
            ))}
          </div>
        </div>
        <div className="py-2 overflow-y-auto max-h-[60vh]">
          {externalNotes}
          {renderTabContent()}
        </div>
      </div>
      {bottomContent() && (
        <div className="sticky bottom-0 bg-white p-2 shadow-[0_-2px_3px_rgba(0,0,0,0.1)]">
          {bottomContent()}
        </div>
      )}
    </>
  );
};

export default StageDetails;

// // StageDetails.tsx
// import React, { useState } from "react";
// import {
//   User,
//   Briefcase,
//   GraduationCap,
//   Award,
//   Star,
//   TrendingUp,
//   MessageCircle,
//   Clock,
//   ChevronDown,
// } from "lucide-react";

// interface Stage {
//   id: number;
//   name: string;
//   slug: string;
//   sort_order: number;
//   candidate_count: number;
// }

// interface Note {
//   noteId: string;
//   content: string;
//   is_team_note: boolean;
//   is_community_note: boolean;
//   postedBy: string | null;
//   posted_at: string;
//   organisation: {
//     orgId: string;
//     orgName: string;
//   };
// }

// interface PipelineCandidate {
//   id: string;
//   firstName: string;
//   lastName: string;
//   fullName: string;
//   publicIdentifier: string;
//   headline: string;
//   summary: string;
//   profilePicture: { displayImageUrl: string; artifacts: any[] };
//   location: { country: string; city: string };
//   industry: string;
//   email: string;
//   phone: { type: string; number: string };
//   positions: Array<{
//     title: string;
//     companyName: string;
//     companyUrn: string;
//     startDate: { month: number; year: number };
//     endDate?: { month: number; year: number };
//     isCurrent: boolean;
//     location: string;
//     description: string;
//   }>;
//   educations: Array<{
//     schoolName: string;
//     degreeName: string;
//     fieldOfStudy: string;
//     startDate: { year: number };
//     endDate: { year: number };
//     activities: string;
//     description: string;
//   }>;
//   certifications: Array<{
//     name: string;
//     authority: string;
//     licenseNumber: string;
//     startDate: { month: number; year: number };
//     endDate?: { month: number; year: number };
//     url: string;
//   }>;
//   skills: Array<{ name: string; endorsementCount: number }>;
//   endorsements: any[];
//   recommendations: { received: any[]; given: any[] };
//   visibility: {
//     profile: "PUBLIC" | "CONNECTIONS" | "PRIVATE";
//     email: boolean;
//     phone: boolean;
//   };
//   connections: any[];
//   meta: {
//     fetchedAt: string;
//     dataCompleteness: "full" | "partial";
//     source: string;
//     scopesGranted: string[];
//   };
//   external_notes: Note[];
//   feedbackNotes: Array<{
//     subject: string;
//     comment: string;
//     author: string;
//     date: string;
//   }>;
//   candidateNotes: Array<{
//     comment: string;
//     author: string;
//     date: string;
//   }>;
//   stageData: {
//     uncontacted?: {
//       notes: string[];
//     };
//     invitesSent?: {
//       currentStatus: string;
//       notes: string[];
//       dateSent: string;
//       responseStatus: string;
//     };
//     applied?: {
//       appliedDate: string;
//       resumeScore: number;
//       skillsMatch: string;
//       experienceMatch: string;
//       highlights: string;
//       notes: string[];
//     };
//     aiInterview?: {
//       interviewedDate: string;
//       resumeScore: number;
//       knowledgeScore: number;
//       communicationScore: number;
//       integrityScore: number;
//       proctoring: {
//         deviceUsage: number;
//         assistance: number;
//         referenceMaterial: number;
//         environment: number;
//       };
//       questions: string[];
//       notes: string[];
//     };
//     shortlisted?: {
//       interviewedDate: string;
//       resumeScore: number;
//       knowledgeScore: number;
//       communicationScore: number;
//       integrityScore: number;
//       proctoring: {
//         deviceUsage: number;
//         assistance: number;
//         referenceMaterial: number;
//         environment: number;
//       };
//       questions: string[];
//       notes: string[];
//     };
//     firstInterview?: {
//       followups: string[];
//       interviewNotes: string[];
//       interviewDate: string;
//       interviewerName: string;
//       interviewerEmail: string;
//     };
//     otherInterviews?: {
//       followups: string[];
//       interviewNotes: string[];
//       interviewDate: string;
//       interviewerName: string;
//       interviewerEmail: string;
//     };
//     hrRound?: {
//       followups: string[];
//       interviewNotes: string[];
//       interviewDate: string;
//       interviewerName: string;
//       interviewerEmail: string;
//     };
//     salaryNegotiation?: {
//       salary: string;
//       negotiation: string;
//       followups: string[];
//       interviewNotes: string[];
//       interviewDate: string;
//       interviewerName: string;
//       interviewerEmail: string;
//     };
//     offerSent?: {
//       offerAcceptanceStatus: string;
//       offerSentDate: string;
//       followups: string[];
//       interviewNotes: string[];
//       interviewerName: string;
//       interviewerEmail: string;
//     };
//     archived?: {
//       reason: string;
//       archivedDate: string;
//       notes: string[];
//     };
//   };
// }

// interface StageDetailsProps {
//   selectedCandidate: PipelineCandidate | null;
//   selectedStage: string;
//   setShowComments: (show: boolean) => void;
//   stages: Stage[];
//   moveCandidate: (applicationId: number, stageId: number) => Promise<void>;
//   archiveCandidate: (applicationId: number) => Promise<void>;
// }

// const StageDetails: React.FC<StageDetailsProps> = ({
//   selectedCandidate,
//   selectedStage,
//   setShowComments,
//   stages,
//   moveCandidate,
//   archiveCandidate,
// }) => {
//   const [activeTab, setActiveTab] = useState("Profile");
//   const [showMoreProfile, setShowMoreProfile] = useState(false); // Moved to top level

//   const tabs = [
//     { name: "Profile" },
//     { name: "Education" },
//     { name: "Skills" },
//     { name: "Recommendations" },
//   ];

//   if (!selectedCandidate) {
//     return (
//       <div className="text-center text-gray-500 mt-8">
//         <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
//           <User className="w-6 h-6 text-gray-400" />
//         </div>
//         <p className="text-base font-medium">No Candidate Selected</p>
//         <p className="text-sm mt-1">
//           Select a candidate from the list to view their details
//         </p>
//       </div>
//     );
//   }

//   const stageData = selectedCandidate.stageData;
//   const stagesWithNotes = [
//     "AI Interview",
//     "Shortlisted",
//     "First Interview",
//     "Other Interviews",
//     "HR Round",
//     "Salary Negotiation",
//     "Offer Sent",
//     "Archives",
//   ];

//   const externalNotes =
//     stagesWithNotes.includes(selectedStage) &&
//     selectedCandidate.external_notes.length > 0 ? (
//       <div className="space-y-2 mb-4">
//         <h4 className="font-medium text-gray-900">External Notes</h4>
//         {selectedCandidate.external_notes.map((note, index) => (
//           <div key={index} className="bg-gray-50 p-2 rounded">
//             <div className="flex justify-between items-center mb-1">
//               <span className="text-xs font-medium text-blue-600">
//                 {note.is_team_note
//                   ? "Team Note"
//                   : note.is_community_note
//                   ? "Community Note"
//                   : "Note"}
//               </span>
//               <span className="text-xs text-gray-500">
//                 {new Date(note.posted_at).toLocaleDateString()}
//               </span>
//             </div>
//             <p className="text-sm text-gray-800">{note.content}</p>
//             {note.postedBy && (
//               <p className="text-xs text-gray-500 mt-1">By {note.postedBy}</p>
//             )}
//           </div>
//         ))}
//       </div>
//     ) : null;

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "Profile":
//         const positions = selectedCandidate.positions || [];
//         return (
//           <div className="bg-[#F0F0F0] p-3 rounded-lg">
//             <div className="mb-4 border-b border-gray-200">
//               <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] flex items-center">
//                 <User className="w-4 h-4 mr-2 text-[#4B5563]" />
//                 Profile Summary
//               </h3>
//               <p className="text-sm text-[#818283] leading-normal pt-2 pb-4 pl-6 pr-2 rounded-lg">
//                 {selectedCandidate.summary || "No summary available"}
//               </p>
//             </div>
//             <div>
//               <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
//                 <Briefcase className="w-4 h-4 mr-2 text-[#4B5563]" />
//                 Experience
//               </h3>
//               <div className="ml-2">
//                 {positions.length > 0 ? (
//                   (showMoreProfile || positions.length <= 1
//                     ? positions
//                     : positions.slice(0, 1)
//                   ).map((exp, index) => (
//                     <div
//                       key={index}
//                       className="border-l-2 border-gray-200 pl-4 relative pb-2"
//                     >
//                       <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
//                       <h4 className="font-medium text-gray-900 text-sm">
//                         {exp.title}
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         {exp.companyName} | {exp.location}
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         {exp.startDate?.month}/{exp.startDate?.year} -{" "}
//                         {exp.endDate
//                           ? `${exp.endDate?.month}/${exp.endDate?.year}`
//                           : "Present"}
//                       </p>
//                       <p className="text-sm text-gray-700 mt-1">
//                         {exp.description}
//                       </p>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-sm text-gray-500">
//                     No experience details available
//                   </p>
//                 )}
//               </div>
//               {positions.length > 1 && !showMoreProfile && (
//                 <button
//                   onClick={() => setShowMoreProfile(true)}
//                   className="text-[#0F47F2] text-sm mt-2 flex items-center"
//                 >
//                   VIEW MORE
//                   <ChevronDown className="text-[#0F47F2] ml-1" />
//                 </button>
//               )}
//             </div>
//           </div>
//         );
//       case "Education":
//         return (
//           <div className="bg-[#F0F0F0] p-3 rounded-lg">
//             <div className="mb-4">
//               <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
//                 <GraduationCap className="w-4 h-4 mr-2 text-[#4B5563]" />
//                 Education
//               </h3>
//               <div className="ml-2">
//                 {selectedCandidate.educations.length > 0 ? (
//                   selectedCandidate.educations.map((edu, index) => (
//                     <div
//                       key={index}
//                       className="border-l-2 border-gray-200 pl-4 relative pb-2"
//                     >
//                       <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
//                       <h4 className="font-medium text-gray-900 text-sm">
//                         {edu.degreeName}
//                       </h4>
//                       <p className="text-sm text-gray-600">
//                         {edu.fieldOfStudy}
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         {edu.startDate?.year} - {edu.endDate?.year}
//                       </p>
//                       <p className="text-sm text-gray-500">{edu.schoolName}</p>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-sm text-gray-500">
//                     No education details available
//                   </p>
//                 )}
//               </div>
//             </div>
//             <div className="mb-4">
//               <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
//                 <Award className="w-4 h-4 mr-2 text-[#4B5563]" />
//                 Certifications
//               </h3>
//               <div className="ml-2">
//                 {selectedCandidate.certifications.length > 0 ? (
//                   selectedCandidate.certifications.map((cert, index) => (
//                     <div
//                       key={index}
//                       className="border-l-2 border-gray-200 pl-4 relative pb-2"
//                     >
//                       <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
//                       <h4 className="font-medium text-gray-900 text-sm">
//                         {cert.name}
//                       </h4>
//                       <p className="text-sm text-gray-600">{cert.authority}</p>
//                       <p className="text-sm text-gray-500">
//                         {cert.startDate?.month}/{cert.startDate?.year} -{" "}
//                         {cert.endDate
//                           ? `${cert.endDate?.month}/${cert.endDate?.year}`
//                           : "Present"}
//                       </p>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-sm text-gray-500">
//                     No certifications available
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       case "Skills":
//         return (
//           <div className="bg-[#F0F0F0] p-3 rounded-lg">
//             <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
//               <Star className="w-4 h-4 mr-2 text-[#4B5563]" />
//               Skills
//             </h3>
//             <div className="flex flex-wrap gap-2">
//               {selectedCandidate.skills.length > 0 ? (
//                 selectedCandidate.skills.map((skill, index) => (
//                   <span
//                     key={index}
//                     className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
//                   >
//                     {skill.name}
//                     {skill.endorsementCount > 0 &&
//                       ` (${skill.endorsementCount})`}
//                   </span>
//                 ))
//               ) : (
//                 <p className="text-sm text-gray-500">No skills available</p>
//               )}
//             </div>
//           </div>
//         );
//       case "Recommendations":
//         return (
//           <div className="bg-[#F0F0F0] p-3 rounded-lg">
//             <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
//               <TrendingUp className="w-4 h-4 mr-2 text-[#4B5563]" />
//               Recommendations
//             </h3>
//             <div className="space-y-2">
//               {selectedCandidate.recommendations.received.length > 0 ? (
//                 selectedCandidate.recommendations.received.map((rec, index) => (
//                   <div key={index} className="bg-gray-50 rounded-lg p-3">
//                     <div className="flex items-start space-x-2">
//                       <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
//                         <User className="w-3 h-3 text-white" />
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="font-medium text-gray-900 text-sm">
//                           {rec.recommender_name || "Anonymous"}
//                         </h4>
//                         <p className="text-xs text-gray-700">
//                           {rec.recommender_title}
//                         </p>
//                         <p className="text-sm text-gray-800 mt-1">
//                           "{rec.feedback}"
//                         </p>
//                         <p className="text-xs text-gray-600 mt-1">
//                           {rec.date_received}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-sm text-gray-500">
//                   No recommendations available
//                 </p>
//               )}
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   const topContent = () => {
//     switch (selectedStage) {
//       case "Uncontacted":
//         return (
//           <div className="flex space-x-2">
//             <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
//               Send Invite & Reveal Info
//             </button>
//           </div>
//         );
//       case "Invites Sent":
//         const invitesSentData = stageData.invitesSent;
//         return (
//           <>
//             <div className="flex space-x-2">
//               <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
//                 Send Invite & Reveal Info
//               </button>
//               <button
//                 onClick={() => setShowComments(true)}
//                 className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 <MessageCircle className="w-4 h-4" />
//               </button>
//             </div>
//             {invitesSentData?.notes?.length > 0 && (
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
//                 <div className="space-y-2">
//                   {invitesSentData.notes.map((note, index) => (
//                     <div key={index} className="bg-gray-50 p-2 rounded">
//                       {note}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </>
//         );
//       case "Applied":
//         const appliedStageData = stageData.applied;
//         return (
//           <>
//             <div className="flex space-x-2">
//               <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
//                 Send Invite & Reveal Info
//               </button>
//               <button
//                 onClick={() => setShowComments(true)}
//                 className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 <MessageCircle className="w-4 h-4" />
//               </button>
//             </div>
//             <div className="grid grid-cols-2 gap-3">
//               <div className="bg-gray-50 rounded-lg p-3">
//                 <h5 className="font-medium text-gray-900 text-sm mb-1">
//                   Skills Match
//                 </h5>
//                 <p className="text-lg font-bold text-blue-600">
//                   {appliedStageData?.skillsMatch}
//                 </p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-3">
//                 <h5 className="font-medium text-gray-900 text-sm mb-1">
//                   Experience Match
//                 </h5>
//                 <p className="text-lg font-bold text-green-600">
//                   {appliedStageData?.experienceMatch}
//                 </p>
//               </div>
//             </div>
//             <div>
//               <h4 className="font-medium text-gray-900 mb-3">
//                 Resume Highlights
//               </h4>
//               <div className="flex flex-wrap gap-2">
//                 {appliedStageData?.highlights
//                   ?.split(", ")
//                   .map((highlight: string, index: number) => (
//                     <span
//                       key={index}
//                       className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
//                     >
//                       {highlight}
//                     </span>
//                   ))}
//               </div>
//             </div>
//           </>
//         );
//       case "AI Interview":
//       case "Shortlisted":
//         const interviewData =
//           selectedStage === "AI Interview"
//             ? stageData.aiInterview
//             : stageData.shortlisted;
//         return (
//           <>
//             <div className="flex space-x-2">
//               <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
//                 Send Invite & Reveal Info
//               </button>
//               <button
//                 onClick={() => setShowComments(true)}
//                 className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 <MessageCircle className="w-4 h-4" />
//               </button>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <div className="bg-gray-50 rounded-lg p-2 text-center">
//                 <p className="text-xs text-gray-600">Resume Score</p>
//                 <p className="text-lg font-bold text-blue-600">
//                   {interviewData?.resumeScore}
//                 </p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-2 text-center">
//                 <p className="text-xs text-gray-600">Knowledge</p>
//                 <p className="text-lg font-bold text-green-600">
//                   {interviewData?.knowledgeScore}
//                 </p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-2 text-center">
//                 <p className="text-xs text-gray-600">Communication</p>
//                 <p className="text-lg font-bold text-yellow-600">
//                   {interviewData?.communicationScore}
//                 </p>
//               </div>
//               <div className="bg-gray-50 rounded-lg p-2 text-center">
//                 <p className="text-xs text-gray-600">Integrity</p>
//                 <p className="text-lg font-bold text-purple-600">
//                   {interviewData?.integrityScore}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-red-50 rounded-lg p-3">
//               <h5 className="font-medium text-red-900 mb-2">
//                 Proctoring Check
//               </h5>
//               <div className="grid grid-cols-2 gap-2 text-xs">
//                 <div>
//                   Device Usage: {interviewData?.proctoring?.deviceUsage}%
//                 </div>
//                 <div>Assistance: {interviewData?.proctoring?.assistance}%</div>
//                 <div>
//                   Reference Material:{" "}
//                   {interviewData?.proctoring?.referenceMaterial}%
//                 </div>
//                 <div>
//                   Environment: {interviewData?.proctoring?.environment}%
//                 </div>
//               </div>
//             </div>
//           </>
//         );
//       case "First Interview":
//       case "Other Interviews":
//       case "HR Round":
//         const roundData =
//           selectedStage === "First Interview"
//             ? stageData.firstInterview
//             : selectedStage === "Other Interviews"
//             ? stageData.otherInterviews
//             : stageData.hrRound;
//         return (
//           <>
//             <div className="flex space-x-2">
//               <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
//                 Send Invite & Reveal Info
//               </button>
//               <button
//                 onClick={() => setShowComments(true)}
//                 className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 <MessageCircle className="w-4 h-4" />
//               </button>
//             </div>
//             <div>
//               <h4 className="font-medium text-gray-900 mb-2">Follow-ups</h4>
//               <div className="space-y-2">
//                 {roundData?.followups?.map(
//                   (followup: string, index: number) => (
//                     <div
//                       key={index}
//                       className="flex items-center space-x-2 text-sm"
//                     >
//                       <Clock className="w-4 h-4 text-gray-400" />
//                       <span className="text-gray-700">{followup}</span>
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           </>
//         );
//       case "Salary Negotiation":
//         const salaryData = stageData.salaryNegotiation;
//         return (
//           <>
//             <div className="flex space-x-2">
//               <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
//                 Send Invite & Reveal Info
//               </button>
//               <button
//                 onClick={() => setShowComments(true)}
//                 className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 <MessageCircle className="w-4 h-4" />
//               </button>
//             </div>
//             <div>
//               <h4 className="font-medium text-gray-900 mb-2">Follow-ups</h4>
//               <div className="space-y-2">
//                 {salaryData?.followups?.map(
//                   (followup: string, index: number) => (
//                     <div
//                       key={index}
//                       className="flex items-center space-x-2 text-sm"
//                     >
//                       <Clock className="w-4 h-4 text-gray-400" />
//                       <span className="text-gray-700">{followup}</span>
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           </>
//         );
//       case "Offer Sent":
//         const offerData = stageData.offerSent;
//         return (
//           <>
//             <div className="flex space-x-2">
//               <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
//                 Send Invite & Reveal Info
//               </button>
//               <button
//                 onClick={() => setShowComments(true)}
//                 className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 <MessageCircle className="w-4 h-4" />
//               </button>
//             </div>
//             <div>
//               <h4 className="font-medium text-gray-900 mb-2">Follow-ups</h4>
//               <div className="space-y-2">
//                 {offerData?.followups?.map(
//                   (followup: string, index: number) => (
//                     <div
//                       key={index}
//                       className="flex items-center space-x-2 text-sm"
//                     >
//                       <Clock className="w-4 h-4 text-gray-400" />
//                       <span className="text-gray-700">{followup}</span>
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           </>
//         );
//       case "Archives":
//         return (
//           <div className="flex space-x-2">
//             <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
//               Send Invite & Reveal Info
//             </button>
//             <button
//               onClick={() => setShowComments(true)}
//               className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
//             >
//               <MessageCircle className="w-4 h-4" />
//             </button>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   const bottomContent = () => {
//     switch (selectedStage) {
//       case "Uncontacted":
//       case "Invites Sent":
//       case "Applied":
//       case "AI Interview":
//       case "Shortlisted":
//       case "First Interview":
//       case "Other Interviews":
//       case "HR Round":
//         return (
//           <div className="flex justify-between w-full">
//             <button
//               onClick={() => {
//                 const currentIndex = stages.findIndex(
//                   (s) => s.name === selectedStage
//                 );
//                 const nextStage = stages[currentIndex + 1];
//                 if (nextStage)
//                   moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
//               }}
//               className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Move to Next Stage
//             </button>
//             <button
//               onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
//               className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Archive
//             </button>
//           </div>
//         );
//       case "Salary Negotiation":
//         return (
//           <div className="flex justify-between w-full">
//             <button
//               onClick={() => {
//                 const currentIndex = stages.findIndex(
//                   (s) => s.name === selectedStage
//                 );
//                 const nextStage = stages[currentIndex + 1];
//                 if (nextStage)
//                   moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
//               }}
//               className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Send Offer
//             </button>
//             <button
//               onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
//               className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Archive
//             </button>
//           </div>
//         );
//       case "Offer Sent":
//         const offerData = stageData.offerSent;
//         return (
//           <>
//             {offerData?.offerAcceptanceStatus === "Pending" && (
//               <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                 Follow Up on Offer
//               </button>
//             )}
//           </>
//         );
//       case "Archives":
//         return null;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {externalNotes}
//       <div className="space-y-4">
//         {topContent()}
//         <div className="flex space-x-4 border-b border-gray-200">
//           {tabs.map((tab) => (
//             <button
//               key={tab.name}
//               onClick={() => setActiveTab(tab.name)}
//               className={`py-2 px-2 text-sm font-medium ${
//                 activeTab === tab.name
//                   ? "text-blue-600 border-b-2 border-blue-600"
//                   : "text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               {tab.name}
//             </button>
//           ))}
//         </div>
//         <div className="mt-4">{renderTabContent()}</div>
//         {bottomContent()}
//       </div>
//     </div>
//   );
// };

// export default StageDetails;
