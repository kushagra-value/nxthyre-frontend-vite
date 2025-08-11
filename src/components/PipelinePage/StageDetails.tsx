// StageDetails.tsx
import React, { useState } from "react";
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
  const [showMoreProfile, setShowMoreProfile] = useState(false); // Moved to top level

  const tabs = [
    { name: "Profile" },
    { name: "Education" },
    { name: "Skills" },
    { name: "Recommendations" },
  ];

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
  const stagesWithNotes = [
    "AI Interview",
    "Shortlisted",
    "First Interview",
    "Other Interviews",
    "HR Round",
    "Salary Negotiation",
    "Offer Sent",
    "Archives",
  ];

  const externalNotes =
    stagesWithNotes.includes(selectedStage) &&
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
        return (
          <div className="bg-[#F0F0F0] p-3 rounded-lg">
            <div className="mb-4 border-b border-gray-200">
              <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] flex items-center">
                <User className="w-4 h-4 mr-2 text-[#4B5563]" />
                Profile Summary
              </h3>
              <p className="text-sm text-[#818283] leading-normal pt-2 pb-4 pl-6 pr-2 rounded-lg">
                {selectedCandidate.summary || "No summary available"}
              </p>
            </div>
            <div>
              <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-[#4B5563]" />
                Experience
              </h3>
              <div className="ml-2">
                {positions.length > 0 ? (
                  (showMoreProfile || positions.length <= 1
                    ? positions
                    : positions.slice(0, 1)
                  ).map((exp, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {exp.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {exp.companyName} | {exp.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        {exp.startDate?.month}/{exp.startDate?.year} -{" "}
                        {exp.endDate
                          ? `${exp.endDate?.month}/${exp.endDate?.year}`
                          : "Present"}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {exp.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No experience details available
                  </p>
                )}
              </div>
              {positions.length > 1 && !showMoreProfile && (
                <button
                  onClick={() => setShowMoreProfile(true)}
                  className="text-[#0F47F2] text-sm mt-2 flex items-center"
                >
                  VIEW MORE
                  <ChevronDown className="text-[#0F47F2] ml-1" />
                </button>
              )}
            </div>
          </div>
        );
      case "Education":
        return (
          <div className="bg-[#F0F0F0] p-3 rounded-lg">
            <div className="mb-4">
              <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-[#4B5563]" />
                Education
              </h3>
              <div className="ml-2">
                {selectedCandidate.educations.length > 0 ? (
                  selectedCandidate.educations.map((edu, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {edu.degreeName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {edu.fieldOfStudy}
                      </p>
                      <p className="text-sm text-gray-500">
                        {edu.startDate?.year} - {edu.endDate?.year}
                      </p>
                      <p className="text-sm text-gray-500">{edu.schoolName}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No education details available
                  </p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
                <Award className="w-4 h-4 mr-2 text-[#4B5563]" />
                Certifications
              </h3>
              <div className="ml-2">
                {selectedCandidate.certifications.length > 0 ? (
                  selectedCandidate.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 pl-4 relative pb-2"
                    >
                      <div className="absolute w-2 h-2 bg-gray-500 rounded-full -left-[5px] top-1.5"></div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {cert.name}
                      </h4>
                      <p className="text-sm text-gray-600">{cert.authority}</p>
                      <p className="text-sm text-gray-500">
                        {cert.startDate?.month}/{cert.startDate?.year} -{" "}
                        {cert.endDate
                          ? `${cert.endDate?.month}/${cert.endDate?.year}`
                          : "Present"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No certifications available
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case "Skills":
        return (
          <div className="bg-[#F0F0F0] p-3 rounded-lg">
            <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
              <Star className="w-4 h-4 mr-2 text-[#4B5563]" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedCandidate.skills.length > 0 ? (
                selectedCandidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {skill.name}
                    {skill.endorsementCount > 0 &&
                      ` (${skill.endorsementCount})`}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No skills available</p>
              )}
            </div>
          </div>
        );
      case "Recommendations":
        return (
          <div className="bg-[#F0F0F0] p-3 rounded-lg">
            <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-[#4B5563]" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {selectedCandidate.recommendations.received.length > 0 ? (
                selectedCandidate.recommendations.received.map((rec, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {rec.recommender_name || "Anonymous"}
                        </h4>
                        <p className="text-xs text-gray-700">
                          {rec.recommender_title}
                        </p>
                        <p className="text-sm text-gray-800 mt-1">
                          "{rec.feedback}"
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {rec.date_received}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No recommendations available
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const topContent = () => {
    switch (selectedStage) {
      case "Uncontacted":
        return (
          <div className="flex space-x-2">
            <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Send Invite & Reveal Info
            </button>
          </div>
        );
      case "Invites Sent":
        const invitesSentData = stageData.invitesSent;
        return (
          <>
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            {invitesSentData?.notes?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <div className="space-y-2">
                  {invitesSentData.notes.map((note, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      case "Applied":
        const appliedStageData = stageData.applied;
        return (
          <>
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 text-sm mb-1">
                  Skills Match
                </h5>
                <p className="text-lg font-bold text-blue-600">
                  {appliedStageData?.skillsMatch}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 text-sm mb-1">
                  Experience Match
                </h5>
                <p className="text-lg font-bold text-green-600">
                  {appliedStageData?.experienceMatch}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Resume Highlights
              </h4>
              <div className="flex flex-wrap gap-2">
                {appliedStageData?.highlights
                  ?.split(", ")
                  .map((highlight: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
              </div>
            </div>
          </>
        );
      case "AI Interview":
      case "Shortlisted":
        const interviewData =
          selectedStage === "AI Interview"
            ? stageData.aiInterview
            : stageData.shortlisted;
        return (
          <>
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Resume Score</p>
                <p className="text-lg font-bold text-blue-600">
                  {interviewData?.resumeScore}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Knowledge</p>
                <p className="text-lg font-bold text-green-600">
                  {interviewData?.knowledgeScore}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Communication</p>
                <p className="text-lg font-bold text-yellow-600">
                  {interviewData?.communicationScore}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600">Integrity</p>
                <p className="text-lg font-bold text-purple-600">
                  {interviewData?.integrityScore}
                </p>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <h5 className="font-medium text-red-900 mb-2">
                Proctoring Check
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  Device Usage: {interviewData?.proctoring?.deviceUsage}%
                </div>
                <div>Assistance: {interviewData?.proctoring?.assistance}%</div>
                <div>
                  Reference Material:{" "}
                  {interviewData?.proctoring?.referenceMaterial}%
                </div>
                <div>
                  Environment: {interviewData?.proctoring?.environment}%
                </div>
              </div>
            </div>
          </>
        );
      case "First Interview":
      case "Other Interviews":
      case "HR Round":
        const roundData =
          selectedStage === "First Interview"
            ? stageData.firstInterview
            : selectedStage === "Other Interviews"
            ? stageData.otherInterviews
            : stageData.hrRound;
        return (
          <>
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Follow-ups</h4>
              <div className="space-y-2">
                {roundData?.followups?.map(
                  (followup: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{followup}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        );
      case "Salary Negotiation":
        const salaryData = stageData.salaryNegotiation;
        return (
          <>
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Follow-ups</h4>
              <div className="space-y-2">
                {salaryData?.followups?.map(
                  (followup: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{followup}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        );
      case "Offer Sent":
        const offerData = stageData.offerSent;
        return (
          <>
            <div className="flex space-x-2">
              <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
                Send Invite & Reveal Info
              </button>
              <button
                onClick={() => setShowComments(true)}
                className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Follow-ups</h4>
              <div className="space-y-2">
                {offerData?.followups?.map(
                  (followup: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{followup}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        );
      case "Archives":
        return (
          <div className="flex space-x-2">
            <button className="cursor-not-allowed opacity-50 flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors">
              Send Invite & Reveal Info
            </button>
            <button
              onClick={() => setShowComments(true)}
              className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
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
          <div className="flex justify-between w-full">
            <button
              onClick={() => {
                const currentIndex = stages.findIndex(
                  (s) => s.name === selectedStage
                );
                const nextStage = stages[currentIndex + 1];
                if (nextStage)
                  moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
              }}
              className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Move to Next Stage
            </button>
            <button
              onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
              className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Archive
            </button>
          </div>
        );
      case "Salary Negotiation":
        return (
          <div className="flex justify-between w-full">
            <button
              onClick={() => {
                const currentIndex = stages.findIndex(
                  (s) => s.name === selectedStage
                );
                const nextStage = stages[currentIndex + 1];
                if (nextStage)
                  moveCandidate(parseInt(selectedCandidate.id), nextStage.id);
              }}
              className="w-[63%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Offer
            </button>
            <button
              onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
              className="w-[33%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Archive
            </button>
          </div>
        );
      case "Offer Sent":
        const offerData = stageData.offerSent;
        return (
          <>
            {offerData?.offerAcceptanceStatus === "Pending" && (
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Follow Up on Offer
              </button>
            )}
          </>
        );
      case "Archives":
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {externalNotes}
      <div className="space-y-4">
        {topContent()}
        <div className="flex space-x-4 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`py-2 px-2 text-sm font-medium ${
                activeTab === tab.name
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="mt-4">{renderTabContent()}</div>
        {bottomContent()}
      </div>
    </div>
  );
};

export default StageDetails;
