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
  Send,
  Trash2,
  RotateCcw,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Link,
  FileText,
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

interface Activity {
  date: string;
  description: string;
  via?: string;
  note?: string;
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
    isTopTier?: boolean;
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
  endorsements: Array<{
    skill_endorsed: string;
    endorser_name: string;
    endorser_title: string;
    endorser_company: string;
    endorser_profile_pic_url: string;
  }>;
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
      technicalScore: number;
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
      technicalScore: number;
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
  activities?: Activity[];
  totalExperience?: number;
  noticePeriodDays?: number;
  currentSalary?: string;
  githubUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  isRecentlyPromoted?: boolean;
  isBackgroundVerified?: boolean;
  isPrevetted?: boolean;
  applicationType?: string;
}

interface StageDetailsProps {
  selectedCandidate: PipelineCandidate | null;
  selectedStage: string;
  setShowComments: (show: boolean) => void;
  stages: Stage[];
  moveCandidate: (applicationId: number, stageId: number) => Promise<void>;
  archiveCandidate: (applicationId: number) => Promise<void>;
  transferredStageData?: PipelineCandidate["stageData"];
}

const StageDetails: React.FC<StageDetailsProps> = ({
  selectedCandidate,
  selectedStage,
  setShowComments,
  stages,
  moveCandidate,
  archiveCandidate,
  transferredStageData,
}) => {
  console.log(
    "Transferred stage data Stage Details :::::::::::::::::::: ",
    transferredStageData
  );
  const [activeTab, setActiveTab] = useState("Profile");
  const [showMoreProfile, setShowMoreProfile] = useState(false);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);
  const [activityReplies, setActivityReplies] = useState<string[]>([]);
  const [viaReplies, setViaReplies] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);

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

  // const externalNotes =
  //   selectedCandidate.external_notes.length > 0 ? (
  //     <div className="space-y-2 mb-4">
  //       <h4 className="font-medium text-gray-900">External Notes</h4>
  //       {selectedCandidate.external_notes.map((note, index) => (
  //         <div key={index} className="bg-gray-50 p-2 rounded">
  //           <div className="flex justify-between items-center mb-1">
  //             <span className="text-xs font-medium text-blue-600">
  //               {note.is_team_note
  //                 ? "Team Note"
  //                 : note.is_community_note
  //                 ? "Community Note"
  //                 : "Note"}
  //             </span>
  //             <span className="text-xs text-gray-500">
  //               {new Date(note.posted_at).toLocaleDateString()}
  //             </span>
  //           </div>
  //           <p className="text-sm text-gray-800">{note.content}</p>
  //           {note.postedBy && (
  //             <p className="text-xs text-gray-500 mt-1">By {note.postedBy}</p>
  //           )}
  //         </div>
  //       ))}
  //     </div>
  //   ) : null;

  const addActivity = () => {
    if (newActivity.trim()) {
      const updatedActivities = [
        ...(selectedCandidate.activities || []),
        {
          date: new Date().toLocaleDateString(),
          description: newActivity,
          via: "via mail",
        },
      ];
      const updatedCandidate = {
        ...selectedCandidate,
        activities: updatedActivities,
      };
      console.log("Activity added:", updatedCandidate);
      setNewActivity("");
    }
  };

  const handleDeleteCandidate = async () => {
    try {
      // Placeholder for API call to delete candidate
      console.log(`Deleting candidate with ID: ${selectedCandidate.id}`);
      // await deleteCandidateAPI(selectedCandidate.id); // Uncomment when API is ready
      // Optionally update local state or context after deletion
      alert("Candidate deleted successfully");
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Failed to delete candidate");
    }
  };

  const handleUnarchiveAndMove = async () => {
    if (selectedStageId) {
      try {
        // Placeholder for API call to unarchive and move candidate
        console.log(
          `Unarchiving and moving candidate ${selectedCandidate.id} to stage ${selectedStageId}`
        );
        await moveCandidate(parseInt(selectedCandidate.id), selectedStageId);
        alert("Candidate unarchived and moved successfully");
      } catch (error) {
        console.error("Error unarchiving and moving candidate:", error);
        alert("Failed to unarchive and move candidate");
      }
    } else {
      alert("Please select a stage");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile":
        const positions = selectedCandidate.positions || [];
        const educations = selectedCandidate.educations || [];
        const certifications = selectedCandidate.certifications || [];
        const skills = selectedCandidate.skills || [];
        const endorsements = selectedCandidate.endorsements || [];
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
                {selectedCandidate.summary ||
                  selectedCandidate.headline ||
                  "No summary available"}
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
                      {edu.isTopTier && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded px-1">
                          Top Tier
                        </span>
                      )}
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
            {endorsements.length > 0 && (
              <div>
                <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                  <Star className="w-4 h-4 mr-2 text-[#4B5563]" />
                  Endorsements
                </h3>
                <div className="space-y-2 ml-4">
                  {endorsements.map((end, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <img
                        src={end.endorser_profile_pic_url}
                        alt={end.endorser_name}
                        className="w-6 h-6 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#4B5563]">
                          {end.endorser_name}
                        </p>
                        <p className="text-xs text-[#818283]">
                          {end.endorser_title} at {end.endorser_company}
                        </p>
                      </div>
                      <p className="text-sm text-[#818283]">
                        endorsed {end.skill_endorsed}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-2 text-[#4B5563]" />
                Additional Info
              </h3>
              <div className="ml-6 space-y-1 text-sm text-[#818283]">
                {selectedCandidate.totalExperience && (
                  <p>
                    Total Experience: {selectedCandidate.totalExperience} years
                  </p>
                )}
                {selectedCandidate.noticePeriodDays && (
                  <p>
                    Notice Period: {selectedCandidate.noticePeriodDays} days
                  </p>
                )}
                {selectedCandidate.currentSalary && (
                  <p>Current Salary: {selectedCandidate.currentSalary} LPA</p>
                )}
                {selectedCandidate.applicationType && (
                  <p>Application Type: {selectedCandidate.applicationType}</p>
                )}
                {selectedCandidate.isRecentlyPromoted && (
                  <p>Recently Promoted</p>
                )}
                {selectedCandidate.isBackgroundVerified && (
                  <p>Background Verified</p>
                )}
                {selectedCandidate.isPrevetted && <p>Pre-vetted</p>}
              </div>
            </div>
            <div>
              <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                <Link className="w-4 h-4 mr-2 text-[#4B5563]" />
                Links
              </h3>
              <div className="ml-6 space-y-1 text-sm">
                {selectedCandidate.linkedinUrl && (
                  <a
                    href={selectedCandidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F47F2] flex items-center"
                  >
                    <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
                  </a>
                )}
                {selectedCandidate.githubUrl && (
                  <a
                    href={selectedCandidate.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F47F2] flex items-center"
                  >
                    <Github className="w-4 h-4 mr-2" /> GitHub
                  </a>
                )}
                {selectedCandidate.twitterUrl && (
                  <a
                    href={selectedCandidate.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F47F2] flex items-center"
                  >
                    <Twitter className="w-4 h-4 mr-2" /> Twitter
                  </a>
                )}
                {selectedCandidate.portfolioUrl && (
                  <a
                    href={selectedCandidate.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F47F2] flex items-center"
                  >
                    <Link className="w-4 h-4 mr-2" /> Portfolio
                  </a>
                )}
                {selectedCandidate.resumeUrl && (
                  <a
                    href={selectedCandidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F47F2] flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" /> Resume
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      case "Assessment":
        const appliedData = transferredStageData?.applied;
        return (
          <div className="bg-[#F5F9FB] p-4 rounded-xl space-y-6">
            <h3 className="text-base font-medium text-[#4B5563]">Assessment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-md p-3 text-center">
                <p className="text-sm text-[#818283]">Resume Score</p>
                <p className="text-xl font-bold text-[#0F47F2]">
                  {appliedData?.resumeScore || "N/A"}%
                </p>
              </div>
              <div className="bg-white rounded-md p-3 text-center">
                <p className="text-sm text-[#818283]">Skills Match</p>
                <p className="text-xl font-bold text-[#16A34A]">
                  {appliedData?.skillsMatch || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#4B5563] mb-2">
                Highlights
              </h4>
              <p className="text-sm text-[#818283] pl-2">
                {appliedData?.highlights || "No highlights available"}
              </p>
            </div>
          </div>
        );
      case "Coding":
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
          transferredStageData?.aiInterview ||
          transferredStageData?.shortlisted;
        const vettedSkills = [
          { name: "Meta Ads", rating: 3.5 },
          { name: "Flutter", rating: 4 },
          { name: "SEO", rating: 4.5 },
          { name: "Meta Ads", rating: 3.5 },
          { name: "Flutter", rating: 4 },
          { name: "SEO", rating: 4.5 },
        ];
        const questions =
          interviewData?.questions?.map((q: any, index: number) => ({
            question: `Q${index + 1}: ${q.question}`,
            answer: q.answer,
            expanded: index === 0,
          })) || [];
        return (
          <div className="space3-y-3">
            <div className="bg-white rounded-xl p-2">
              <h4 className="text-base font-medium text-[#4B5563] mb-4">
                Overall Score
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#ECF1FF] rounded-xl p-4 text-center">
                  <p className="text-base text-[#4B5563]">Resume</p>
                  <p className="text-2xl font-normal text-[#EAB308]">
                    {(interviewData?.resumeScore &&
                      (interviewData?.resumeScore * 10).toFixed(0)) ||
                      "N/A"}
                    %
                  </p>
                </div>
                <div className="bg-[#ECF1FF] rounded-xl p-4 text-center">
                  <p className="text-base text-[#4B5563]">Knowledge</p>
                  <p className="text-2xl font-normal text-[#16A34A]">
                    {(interviewData?.knowledgeScore &&
                      (interviewData?.knowledgeScore * 10).toFixed(0)) ||
                      "N/A"}
                    %
                  </p>
                </div>
                <div className="bg-[#ECF1FF] rounded-xl p-4 text-center">
                  <p className="text-base text-[#4B5563]">Technical</p>
                  <p className="text-2xl font-normal text-[#16A34A]">
                    {(interviewData?.technicalScore &&
                      (interviewData.technicalScore * 10).toFixed(0)) ||
                      "N/A"}
                    %
                  </p>
                </div>
                <div className="bg-[#ECF1FF] rounded-xl p-4 text-center">
                  <p className="text-base text-[#4B5563]">Communication</p>
                  <p className="text-2xl font-normal text-[#0F47F2]">
                    {(interviewData?.communicationScore &&
                      (interviewData.communicationScore * 10).toFixed(0)) ||
                      "N/A"}
                    %
                  </p>
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
                Integrity Scores
              </h4>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Assistance: {interviewData?.proctoring?.assistance || "N/A"}
                <br />
                Device Usage: {interviewData?.proctoring?.deviceUsage || "N/A"}
                <br />
                Reference Materials:{" "}
                {interviewData?.proctoring?.referenceMaterial || "N/A"}
                <br />
                Environmental Assistance:{" "}
                {interviewData?.proctoring?.environment || "N/A"}
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
                {questions.map((q: any, index: number) => (
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
        return (
          <div className="bg-[#F5F9FB] p-4 rounded-xl space-y-4">
            <h3 className="text-base font-medium text-[#4B5563]">Activity</h3>
            <div className="space-y-2">
              <div className="bg-white rounded-md p-3 border-l border-[#818283]">
                <p className="text-xs text-[#818283]">
                  {new Date().toLocaleDateString()}
                </p>
                <p className="text-sm text-[#4B5563]">
                  Moved to {selectedStage}
                </p>
              </div>
              {selectedCandidate.activities &&
                selectedCandidate.activities.map((activity, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-md p-3 ${
                      selectedActivityIndex === index
                        ? "bg-blue-700 text-white"
                        : ""
                    }`}
                  >
                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedActivityIndex(
                          selectedActivityIndex === index ? null : index
                        )
                      }
                    >
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs">
                        Date: {activity.date}{" "}
                        {activity.via && `(${activity.via})`}
                      </p>
                      {activity.note && selectedActivityIndex === index && (
                        <div className="mt-2">
                          <p className="text-xs italic">
                            Note: {activity.note}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedActivityIndex === index && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={activityReplies[index] || ""}
                            onChange={(e) => {
                              const newReplies = [...activityReplies];
                              newReplies[index] = e.target.value;
                              setActivityReplies(newReplies);
                            }}
                            placeholder="Add a reply..."
                            className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                          />
                          <button
                            onClick={() => {
                              const newActivities = [
                                ...(selectedCandidate.activities || []),
                              ];
                              newActivities[index].note =
                                activityReplies[index] || "Replied via input";
                              // You cannot set selectedCandidate directly as it's a prop.
                              // Instead, update the local activityReplies and close the reply box.
                              setActivityReplies([...activityReplies]);
                              setSelectedActivityIndex(null);
                            }}
                            className="bg-blue-500 text-white p-2 rounded-md"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                        {activity.via && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={viaReplies[index] || ""}
                              onChange={(e) => {
                                const newViaReplies = [...viaReplies];
                                newViaReplies[index] = e.target.value;
                                setViaReplies(newViaReplies);
                              }}
                              placeholder="Reply via mail..."
                              className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                            />
                            <button
                              onClick={() => {
                                const newActivities = [
                                  ...(selectedCandidate.activities || []),
                                ];
                                newActivities[index].note = `${
                                  viaReplies[index] || ""
                                } (via ${activity.via})`;
                                // setSelectedCandidate({ ...selectedCandidate, activities: newActivities });
                                setViaReplies([...viaReplies]);
                                setSelectedActivityIndex(null);
                              }}
                              className="bg-blue-500 text-white p-2 rounded-md"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                placeholder="Type your reply"
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={addActivity}
                className="bg-blue-500 text-white p-2 rounded-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      case "Notes":
      // const allNotes = [
      //   // Filter and transform candidateNotes to ensure correct structure
      //   ...selectedCandidate.candidateNotes
      //     .filter((note) => note.comment && note.author && note.date) // Only include valid notes
      //     .map((note) => ({
      //       comment: note.comment,
      //       author: note.author,
      //       date: note.date,
      //     })),
      //   // Map external_notes as before
      //   ...selectedCandidate.external_notes.map((n) => ({
      //     comment: n.content,
      //     author: n.postedBy || "Anonymous",
      //     date: n.posted_at,
      //   })),
      // ];
      // return (
      //   <div className="bg-[#F5F9FB] p-4 rounded-xl space-y-4">
      //     <h3 className="text-base font-medium text-[#4B5563]">Notes</h3>
      //     <div className="space-y-2">
      //       {allNotes.length > 0 ? (
      //         allNotes.map((note, index) => (
      //           <div key={index} className="bg-white rounded-md p-3">
      //             <p className="text-sm text-[#4B5563]">{note.comment}</p>
      //             <p className="text-xs text-[#818283] mt-1">
      //               By {note.author} - {note.date}
      //             </p>
      //           </div>
      //         ))
      //       ) : (
      //         <p className="text-sm text-[#818283]">No notes available</p>
      //       )}
      //     </div>
      //   </div>
      // );
      default:
        return null;
    }
  };

  const buttonControls = () => {
    switch (selectedStage) {
      case "Uncontacted":
        return null;
      case "AI Interview":
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
              className="w-[50%] lg:w-[60%] px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Move to Next Stage
            </button>
            <button className="flex justify-between items-center px-3 py-2 bg-blue-50 text-blue-700 border border-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <span className="mr-1">Resend</span>
              <Send className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteCandidate}
              className="px-3 py-2 bg-gray-50 text-gray-400 border border-gray-400 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        );
      case "Archived":
        return (
          <div className="flex space-x-4 w-full">
            <button
              onClick={handleUnarchiveAndMove}
              className="flex-1 px-3 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5 inline-block mr-2" />
              Retrieve - Salary Negotiation
            </button>
            <select
              value={selectedStageId || ""}
              onChange={(e) => setSelectedStageId(parseInt(e.target.value))}
              className="flex-1 py-3 px-2 border border-gray-300 rounded-lg text-base text-gray-700"
            >
              <option value="" disabled>
                Select Stage
              </option>
              {stages
                .filter((stage) => stage.name !== "Archived")
                .map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
            </select>
          </div>
        );
      case "Invites Sent":
      case "Applied":
      case "Shortlisted":
      case "First Interview":
      case "Other Interviews":
      case "HR Round":
      case "Salary Negotiation":
      case "Offer Sent":
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
              className="flex-1 px-3 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Move to Next Stage
            </button>
            <button
              onClick={() => archiveCandidate(parseInt(selectedCandidate.id))}
              className="flex-1 px-3 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Archive
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden relative h-full">
        {selectedStage === "Uncontacted" && (
          <div className="mb-3">
            <button
              className="flex-1 px-3 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              style={{ width: "100%" }}
            >
              Send Invite & Reveal Info
            </button>
          </div>
        )}
        {buttonControls()}
        <div className="mt-2">
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
                    ({(selectedCandidate?.activities?.length || 0) + 1})
                  </span>
                )}
                {tab === "Notes" && (
                  <span className="ml-1">
                    ({selectedCandidate?.candidateNotes?.length || 0})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="py-2 overflow-y-auto max-h-[60vh]">
          {/* {externalNotes} */}
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default StageDetails;
