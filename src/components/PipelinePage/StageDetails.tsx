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
  Minus,
  MessageSquareText,
} from "lucide-react";
import candidateService from "../../services/candidateService";

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
  postedBy: { userId: string; userName: string; email: string } | null;
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
  jobId: number;
}

const StageDetails: React.FC<StageDetailsProps> = ({
  selectedCandidate,
  selectedStage,
  setShowComments,
  stages,
  moveCandidate,
  archiveCandidate,
  transferredStageData,
  jobId,
}) => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [showMoreProfile, setShowMoreProfile] = useState(false);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<
    number | null
  >(null);
  const [activityReplies, setActivityReplies] = useState<string[]>([]);
  const [viaReplies, setViaReplies] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [expandedIndices, setExpandedIndices] = useState(new Set([0]));

  const [codingQuestions, setCodingQuestions] = useState<
    { question: string; language: string; difficulty: string; status: string }[]
  >([]);
  const [date, setDate] = useState("");

  useEffect(() => {
    setActiveTab("Profile");
  }, [selectedStage]);

  useEffect(() => {
    const fetchData = async () => {
      console.log(
        "Fetching assessment results for candidate:",
        selectedCandidate?.id + " and jobId: " + jobId
      );
      if (selectedCandidate?.id && jobId) {
        try {
          const data = await candidateService.getAssessmentResults(
            jobId,
            selectedCandidate.id
          );

          // console.log("Assessment results data:", data);

          const questions = data.problem_results.map((pr: any) => ({
            question: pr.problem.description,
            language: pr.language || "N/A",
            difficulty: getDifficultyLevel(pr.problem.difficulty),
            status: mapStatus(pr.status),
          }));
          setCodingQuestions(questions);
          const completedDate = new Date(data.completed_at);
          setDate(completedDate.toLocaleDateString("en-GB"));
        } catch (error) {
          console.error("Error fetching assessment results:", error);
        }
      }
    };
    fetchData();
  }, [selectedCandidate?.id, jobId]);

  const getDifficultyLevel = (diff: any) => {
    const num = parseInt(diff);
    if (num < 8) return "Easy";
    if (num < 10) return "Medium";
    return "Hard";
  };

  const mapStatus = (status: any) => {
    if (status === "Accepted") return "Pass";
    if (status === "Wrong Answer") return "Fail";
    return "Skip";
  };

  const getDifficultyDots = (difficulty: any) => {
    let fullCount = 0;
    if (difficulty === "Easy") fullCount = 1;
    else if (difficulty === "Medium") fullCount = 2;
    else if (difficulty === "Hard") fullCount = 3;
    return [...Array(3)].map((_, i) => (
      <div
        key={i}
        className={`w-2 h-2 bg-[#818283] rounded-full ${
          i < fullCount ? "" : "opacity-50"
        }`}
      />
    ));
  };

  const tabs = ["Profile", "Coding", "Interview", "Activity", "Notes"];

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

  const [notes, setNotes] = useState<Note[]>([]);
  const [notesView, setNotesView] = useState<"my" | "community">("my");
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Regex to allow only alphanumeric and spaces
  const validNoteRegex = /^[A-Za-z0-9 ]+$/;
  const isValidNote =
    newComment.trim() !== "" && validNoteRegex.test(newComment.trim());

  // Fetch notes when component mounts or candidateId changes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const fetchedNotes = await candidateService.getCandidateNotes(
          selectedCandidate.publicIdentifier
        );
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        // Optionally set dummy notes on error
        // setNotes(notesView === "my" ? dummyTeamNotes : dummyCommunityNotes);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, [selectedCandidate.publicIdentifier]);

  // Handle adding a new note
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!isValidNote) return;
    try {
      setIsLoading(true);
      const payload =
        notesView === "my"
          ? { teamNotes: newComment }
          : { communityNotes: newComment, is_community_note: true };

      await candidateService.postCandidateNote(
        selectedCandidate.publicIdentifier,
        payload
      );
      setNewComment("");

      // Refetch notes to update the UI
      const updatedNotes = await candidateService.getCandidateNotes(
        selectedCandidate.publicIdentifier
      );
      setNotes(updatedNotes);
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter notes based on current view
  const displayedNotes =
    notesView === "my"
      ? notes.filter((note) => note.is_team_note && !note.is_community_note)
      : notes.filter((note) => note.is_team_note && note.is_community_note);

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
            {selectedCandidate.summary && (
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
            )}
            {positions.length > 0 && (
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
            )}
            {educations.length > 0 && (
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
            )}
            {certifications.length > 0 && (
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
            )}
            {skills.length > 0 && (
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
                    <p className="text-sm text-[#818283]">
                      No skills available
                    </p>
                  )}
                </div>
              </div>
            )}
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
            {(selectedCandidate.totalExperience ||
              selectedCandidate.noticePeriodDays ||
              selectedCandidate.currentSalary ||
              selectedCandidate.applicationType ||
              selectedCandidate.isRecentlyPromoted ||
              selectedCandidate.isBackgroundVerified ||
              selectedCandidate.isPrevetted) && (
              <div>
                <h3 className="text-base font-medium text-[#4B5563] flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 mr-2 text-[#4B5563]" />
                  Additional Info
                </h3>
                <div className="ml-6 space-y-1 text-sm text-[#818283]">
                  {selectedCandidate.totalExperience && (
                    <p>
                      Total Experience: {selectedCandidate.totalExperience}{" "}
                      years
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
            )}
            {(selectedCandidate.githubUrl ||
              selectedCandidate.linkedinUrl ||
              selectedCandidate.twitterUrl ||
              selectedCandidate.portfolioUrl ||
              selectedCandidate.resumeUrl) && (
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
            )}
          </div>
        );
      case "Coding":
        if (codingQuestions.length === 0) {
          return (
            <>
              <div className="flex-col items-start justify-center h-full py-12 px-4">
                <svg
                  width="102"
                  height="107"
                  viewBox="0 0 102 107"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M101.054 97.7513L90.3598 81.0519C94.4789 77.6315 97.3445 72.9844 98.5084 67.6711C99.8929 61.3632 98.7356 54.8941 95.2507 49.4568C93.4269 46.6082 91.0699 44.236 88.3417 42.4097V9.40048C88.3417 4.74115 84.5504 0.949914 79.903 0.949914L11.969 0.626608C11.9633 0.626608 11.9588 0.625 11.9532 0.625C11.9481 0.625 11.9438 0.626608 11.9387 0.626608L11.6084 0.625L11.6083 0.662382C4.39077 0.865369 0.597656 7.06472 0.597656 13.2224V15.9278H17.8975L17.882 97.718C17.882 102.377 21.672 106.169 26.3314 106.169H79.8898C84.5504 106.169 88.3417 102.377 88.3417 97.718V91.2884L94.9743 101.645L101.054 97.7513ZM90.6959 52.3735V52.3748C93.3988 56.5955 94.297 61.6154 93.2243 66.5125C92.1571 71.3837 89.2617 75.5485 85.0767 78.2526L84.2809 78.7136C81.5839 80.2747 78.6623 81.092 75.7526 81.2305C75.6725 81.2341 75.5921 81.2349 75.5117 81.2375C75.0344 81.2542 74.5578 81.2517 74.0825 81.2318C73.8908 81.2231 73.6989 81.2064 73.5071 81.1918C73.1391 81.165 72.7716 81.1323 72.4065 81.0841C72.089 81.0408 71.772 80.9824 71.4547 80.9227C71.2009 80.8758 70.9459 80.8331 70.6943 80.7756C70.3134 80.6883 69.9408 80.5804 69.569 80.471C69.3634 80.4104 69.1554 80.3583 68.9518 80.2907C68.5893 80.1706 68.2374 80.0273 67.8849 79.8862C67.6747 79.8018 67.4607 79.728 67.2536 79.636C66.943 79.4982 66.6449 79.3381 66.3434 79.1842C66.1069 79.0633 65.8652 78.9534 65.6334 78.8221C65.3889 78.6839 65.1579 78.525 64.9202 78.3758C64.6484 78.2053 64.3713 78.0443 64.1076 77.8593C63.9369 77.7394 63.7788 77.6022 63.6123 77.4765C63.2997 77.2408 62.9835 77.0109 62.6844 76.7542C62.6034 76.6845 62.5309 76.6049 62.4509 76.5339C61.187 75.4113 60.0476 74.108 59.0915 72.6145C58.7487 72.079 58.4331 71.5265 58.146 70.9592C58.1114 70.8912 58.0862 70.82 58.0524 70.7518C54.4781 63.4751 56.0356 54.7316 61.7239 49.1292C61.7515 49.102 61.7755 49.0718 61.8033 49.0448C62.1698 48.6884 62.5636 48.3537 62.9634 48.0245C63.053 47.9506 63.1341 47.8688 63.2255 47.7964C63.722 47.4025 64.2382 47.0338 64.7719 46.6919C65.5134 46.2183 66.2868 45.7967 67.0865 45.4301C67.5291 45.2271 67.9882 45.0826 68.4414 44.9159C68.7983 44.7842 69.1477 44.6265 69.5108 44.5171C70.003 44.3695 70.5057 44.2797 71.0057 44.1735C71.3483 44.1006 71.6857 44.0036 72.0318 43.9504C72.5027 43.8779 72.9785 43.8587 73.4528 43.8224C73.8422 43.7928 74.2291 43.7441 74.6209 43.7391C75.4054 43.7285 76.1911 43.7585 76.9729 43.8471C77.0078 43.8511 77.0429 43.8599 77.0779 43.8641C77.8387 43.9548 78.5951 44.0959 79.3443 44.2805C79.4679 44.3108 79.5888 44.3475 79.7115 44.3801C80.4425 44.5761 81.1674 44.807 81.8781 45.0933C81.9051 45.1041 81.933 45.1134 81.9599 45.1244C82.7592 45.4503 83.5354 45.8302 84.2832 46.2612L84.553 46.4169C87.0038 47.8862 89.1102 49.8973 90.6959 52.3735ZM6.42078 10.5167C7.09191 8.30462 8.68499 6.0467 11.9343 6.03746L11.9743 6.03759C15.2223 6.04778 16.8148 8.30515 17.4857 10.5167H6.42078ZM82.9308 97.7179C82.9308 99.3943 81.5675 100.758 79.8897 100.758H26.3314C24.6563 100.758 23.293 99.3943 23.293 97.7179L23.3085 15.9277H23.3088V13.2223C23.3088 10.7097 22.6512 8.20534 21.4169 6.08261L79.8898 6.3609C81.5676 6.3609 82.9309 7.7242 82.9309 9.40062V39.7024C82.8932 39.689 82.8543 39.6823 82.8165 39.669C82.1018 39.4225 81.3714 39.2117 80.6282 39.0306C80.4894 38.9964 80.353 38.9501 80.2135 38.9183C80.1646 38.9072 80.1184 38.89 80.0695 38.8793C79.263 38.7031 78.4481 38.5677 77.6279 38.4736C77.5223 38.4614 77.4162 38.4624 77.3108 38.4516C76.5538 38.3739 75.7977 38.3282 75.0431 38.3221C74.8126 38.3205 74.5832 38.3372 74.3526 38.3422C73.716 38.3552 73.0815 38.3855 72.4501 38.4488C72.1935 38.4747 71.9393 38.5129 71.6837 38.547C71.0795 38.6265 70.4787 38.7293 69.8825 38.8551C69.6171 38.9113 69.3535 38.9722 69.0898 39.0376C68.5056 39.1837 67.9271 39.352 67.3555 39.542C67.094 39.628 66.8327 39.7102 66.5735 39.8054C65.989 40.0209 65.4157 40.2681 64.8463 40.53C64.6152 40.636 64.3804 40.7291 64.1517 40.8427C63.37 41.2325 62.6011 41.6567 61.8552 42.1344C61.1798 42.5668 60.526 43.032 59.8959 43.5282C59.2729 44.0189 58.6743 44.5399 58.1023 45.0893C54.6862 48.3712 52.314 52.5872 51.2776 57.3182C49.8945 63.6261 51.0517 70.0951 54.534 75.5325C54.9463 76.1762 55.3877 76.7894 55.8484 77.3806C56.0088 77.5865 56.1835 77.7768 56.3495 77.9767C56.6605 78.3502 56.9733 78.7214 57.3028 79.0721C57.517 79.3003 57.742 79.5154 57.9643 79.7344C58.2684 80.0342 58.5751 80.3292 58.8927 80.6103C59.1392 80.8272 59.3903 81.0389 59.6456 81.2454C59.9638 81.5046 60.2886 81.7555 60.6197 81.9978C60.8819 82.1898 61.1449 82.3798 61.4149 82.5611C61.7786 82.8055 62.1504 83.0329 62.5254 83.256C62.7733 83.4035 63.017 83.5564 63.2703 83.6948C63.7948 83.9819 64.3304 84.2434 64.8729 84.49C64.9886 84.5424 65.0988 84.6045 65.2154 84.655C65.9072 84.9564 66.6126 85.2207 67.3277 85.4556C67.4434 85.4934 67.563 85.5219 67.6794 85.5581C68.2779 85.7453 68.8834 85.9092 69.4946 86.0494C69.5701 86.0667 69.6419 86.0932 69.7177 86.1098C69.838 86.1362 69.9594 86.1447 70.08 86.1693C70.6684 86.2884 71.26 86.3855 71.8565 86.4605C72.1184 86.4941 72.3794 86.5296 72.6415 86.5548C73.1795 86.6046 73.7194 86.6288 74.2611 86.6424C74.4877 86.6489 74.7149 86.6793 74.9411 86.6793C75.062 86.6793 75.1807 86.6553 75.3014 86.6536C76.0985 86.6391 76.8958 86.5773 77.6929 86.483C78.0588 86.4405 78.4231 86.3994 78.7865 86.3402C79.5832 86.2086 80.3728 86.0369 81.1523 85.8258C81.5735 85.7123 81.9867 85.5773 82.4021 85.4406C82.5776 85.3826 82.7558 85.3398 82.9305 85.2778V97.7179H82.9308Z"
                    fill="#0F47F2"
                  />
                  <svg
                    width="52"
                    height="83"
                    viewBox="0 0 52 83"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M-0.0078125 0.304688H41.6383V8.92113H-0.0078125V0.304688ZM-0.0078125 24.719H19.6644V33.3355H-0.0078125V24.719ZM-0.0078125 49.1331H19.6644V57.7495H-0.0078125V49.1331ZM-0.0078125 73.667H8.36919V82.0441H-0.0078125V73.667ZM14.2302 73.667H22.6074V82.0441H14.2302V73.667ZM28.4683 73.667H36.8454V82.0441H28.4683V73.667ZM42.7063 73.667H51.0835V82.0441H42.7063V73.667Z"
                      fill="#60A5FA"
                    />
                  </svg>
                </svg>
                <h3 className="text-xl font-medium text-[#4B5563] mt-4">
                  Candidate coding round will shown here once they complete it
                </h3>
              </div>
            </>
          );
        }

        return (
          <div className="bg-[#F5F9FB] px-4 py-2 rounded-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium text-[#4B5563]">Questions</h3>
              <p className="text-base text-[#818283]">{date}</p>
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
                        {getDifficultyDots(q.difficulty)}
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
          transferredStageData?.["ai-interview"] ||
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
          })) || [];

        console.log("interviewData Resume score: ", interviewData?.resumeScore);
        return (
          <div className="space-y-3 bg-[#F5F9FB] p-2 rounded-xl">
            <div className="bg-white rounded-xl p-2">
              <h4 className="text-base font-medium text-[#4B5563] mb-4">
                Overall Score
              </h4>
              <div className="flex justify-between w-full">
                <div className="w-[27%] bg-[#ECF1FF] rounded-xl p-4 text-center">
                  <p className="text-base text-[#4B5563]">Resume</p>
                  <p className="text-2xl font-normal text-[#EAB308]">
                    {(interviewData?.resumeScore &&
                      (interviewData?.resumeScore * 10).toFixed(0)) ||
                      "N/A"}
                    %
                  </p>
                </div>
                <div className="w-[27%] bg-[#ECF1FF] rounded-xl p-4 text-center">
                  <p className="text-base text-[#4B5563]">Knowledge</p>
                  <p className="text-2xl font-normal text-[#16A34A]">
                    {(interviewData?.knowledgeScore &&
                      (interviewData?.knowledgeScore * 10).toFixed(0)) ||
                      "N/A"}
                    %
                  </p>
                </div>
                {/* <div className="bg-[#ECF1FF] rounded-xl p-4 text-center">
                  <p className="text-base text-[#4B5563]">Technical</p>
                  <p className="text-2xl font-normal text-[#16A34A]">
                    {(interviewData?.technicalScore &&
                      (interviewData.technicalScore * 10).toFixed(0)) ||
                      "N/A"}
                    %
                  </p>
                </div> */}
                <div className="w-[37%] bg-[#ECF1FF] rounded-xl p-4 text-center">
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
            <div className="bg-white rounded-xl p-4">
              <h4 className="text-base font-medium text-[#4B5563] mb-4">
                Question Analysis
              </h4>
              <div className="space-y-4">
                {questions.map((q: any, index: number) => {
                  const isExpanded = expandedIndices.has(index);
                  return (
                    <div
                      key={index}
                      className={`border ${
                        isExpanded ? "border-[#0F47F2]" : "border-[#818283]"
                      } bg-white rounded-md p-4`}
                    >
                      <div className="flex justify-between items-start">
                        <p
                          className={`text-sm font-medium ${
                            isExpanded ? "text-[#4B5563]" : "text-[#818283]"
                          }`}
                        >
                          {q.question}
                        </p>
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedIndices);
                            if (isExpanded) {
                              newExpanded.delete(index);
                            } else {
                              newExpanded.add(index);
                            }
                            setExpandedIndices(newExpanded);
                          }}
                        >
                          {isExpanded ? (
                            <Minus className="w-4 h-4 text-[#818283]" />
                          ) : (
                            <Plus className="w-4 h-4 text-[#818283]" />
                          )}
                        </button>
                      </div>
                      {isExpanded && (
                        <p className="text-sm text-[#4B5563] mt-2">
                          {q.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
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
        return (
          <>
            <div className="flex flex-col h-full bg-[#F0F0F0] p-3 rounded-lg">
              {/* Header with Heading and Toggle */}
              <div className="flex justify-between items-center mb-3 border-b-2 border-gray-200 px-3 pt-1 pb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquareText className="w-5 h-5 text-[#4B5563] mt-1" />
                  <h3 className="text-base font-medium text-[#4B5563]">
                    Notes about the Person
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#4B5563]">Community</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notesView === "community"}
                      onChange={(e) =>
                        setNotesView(e.target.checked ? "community" : "my")
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </label>
                </div>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto space-y-2 border-gray-200">
                {isLoading ? (
                  <p className="text-gray-500 text-center">Loading notes...</p>
                ) : displayedNotes.length > 0 ? (
                  displayedNotes.map((note: any) => (
                    <div
                      key={note.noteId}
                      className="border-b border-gray-200 pb-2"
                    >
                      <div className="flex flex-col space-y-2 px-3 py-2 mb-0">
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-3 items-center">
                            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-medium text-[#111827] text-sm">
                                {note.postedBy?.userName ||
                                  note.organisation?.orgName ||
                                  "Unknown"}
                              </h4>
                              <p className="text-sm text-[#4B5563]">
                                {note.organisation?.orgName || "Company"}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-[#818283] mt-1">
                            {new Date(note.posted_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-sm text-[#818283] leading-normal">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : notesView === "my" ? (
                  <div>
                    No team notes available. You can add a new note below.
                  </div>
                ) : (
                  <div>
                    No community notes available. You can add a new note below.
                  </div>
                )}
              </div>
            </div>

            {/* Comment Input Section */}
            <div className="mt-4 p-3 bg-white rounded-tr-lg rounded-tl-lg">
              <div className="flex space-x-3 border border-gray-200 rounded-lg p-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Type your ${
                    notesView === "my" ? "team" : "community"
                  } comment!`}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                    newComment && !isValidNote ? "border border-red-500" : ""
                  }`}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        );
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
        <div className="py-2 overflow-y-auto max-h-[90vh]">
          {/* {externalNotes} */}
          {renderTabContent()}
        </div>
      </div>
    </>
  );
};

export default StageDetails;
