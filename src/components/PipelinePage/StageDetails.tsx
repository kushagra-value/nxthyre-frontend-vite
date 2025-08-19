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
  SignalMedium,
  CheckCheck,
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
  type: "stage_move" | "communication_sent";
  date: string;
  job_title: string;
  description: string;
  via?: string;
  note?: string;
  data: {
    id: number;
    // Stage move fields
    from_stage_name?: string;
    to_stage_name?: string;
    moved_at?: string;
    moved_by_name?: string;
    external_mover_email?: string;
    // Communication fields
    mode?: string;
    subject?: string;
    body?: string;
    sent_at?: string;
    sent_by_name?: string;
    replies?: Array<{
      id: number;
      body: string;
      source: string;
      source_display: string;
      received_at: string;
      via: string;
    }>;
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
    {
      name: string;
      question: string;
      language: string;
      difficulty: string;
      status: string;
    }[]
  >([]);
  const [date, setDate] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    setActiveTab("Profile");
  }, [selectedStage]);

  useEffect(() => {
    const fetchData = async () => {
      console.log(
        "Fetching assessment results for candidate:",
        selectedCandidate?.publicIdentifier + " and jobId: " + jobId
      );
      if (selectedCandidate?.publicIdentifier && jobId) {
        try {
          const data = await candidateService.getAssessmentResults(
            jobId,
            selectedCandidate.publicIdentifier
          );

          // console.log("Assessment results data:", data);

          const questions = data.problem_results.map((pr: any) => ({
            name: pr.problem.name,
            question: pr.problem.description,
            language: pr.language || "N/A",
            difficulty: getDifficultyLevel(pr.problem.difficulty),
            status: mapStatus(pr.status),
          }));
          setCodingQuestions(questions);
          const completedDate = new Date(data.completed_at);
          setDate(completedDate.toLocaleDateString("en-GB"));

          const total_questions = data.problem_results.length;
          setTotalQuestions(total_questions);
        } catch (error) {
          console.error("Error fetching assessment results:", error);
        }
      }
    };
    fetchData();
  }, [selectedCandidate?.publicIdentifier, jobId]);

  useEffect(() => {
    const fetchActivity = async () => {
      if (selectedCandidate?.id) {
        try {
          const apiActivities = await candidateService.getCandidateActivity(
            selectedCandidate.publicIdentifier
          );

          const mappedActivities: Activity[] = apiActivities.map(
            (item: any) => {
              const date = new Date(item.timestamp).toLocaleDateString();
              let description = "";
              let via = "";
              let note = "";

              if (item.type === "stage_move") {
                const d = item.data;
                description = `${selectedCandidate.firstName} has been moved from ${d.from_stage_name} to ${d.to_stage_name}`;
                via = "system";
              }

              if (item.type === "communication_sent") {
                const d = item.data;
                description = `${selectedCandidate.firstName} sent you a message `;
                via = d.mode.toLowerCase();
                if (d.replies?.length > 0) {
                  note = d.replies
                    .map((r: any) => `"${r.body}" via ${r.via}`)
                    .join("\n");
                }
              }

              return {
                type: item.type,
                date,
                job_title: item.job_title,
                description,
                via,
                note,
                data: item.data,
              };
            }
          );

          setActivities(mappedActivities);
        } catch (error) {
          console.error("Error fetching candidate activity:", error);
        }
      }
    };
    fetchActivity();
  }, [selectedCandidate?.publicIdentifier]);

  const [isExpanded, setIsExpanded] = React.useState(false);

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
            <div className="flex justify-center items-center bg-[#F5F9FB] rounded-xl">
              <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                <div className="relative inline-block">
                  {/* First SVG (outer shape) */}
                  <svg
                    width="102"
                    height="107"
                    viewBox="0 0 102 107"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M101.056 97.7513L90.3618 81.0519C94.4809 77.6315 97.3464 72.9844 98.5103 67.6711C99.8948 61.3632 98.7376 54.8941 95.2526 49.4568C93.4288 46.6082 91.0719 44.236 88.3437 42.4097V9.40048C88.3437 4.74115 84.5523 0.949914 79.9049 0.949914L11.9709 0.626608C11.9653 0.626608 11.9607 0.625 11.9551 0.625C11.95 0.625 11.9457 0.626608 11.9406 0.626608L11.6104 0.625L11.6102 0.662382C4.39273 0.865369 0.599609 7.06472 0.599609 13.2224V15.9278H17.8995L17.8839 97.718C17.8839 102.377 21.674 106.169 26.3333 106.169H79.8918C84.5523 106.169 88.3437 102.377 88.3437 97.718V91.2884L94.9762 101.645L101.056 97.7513ZM90.6978 52.3735V52.3748C93.4007 56.5955 94.2989 61.6154 93.2262 66.5125C92.159 71.3837 89.2636 75.5485 85.0786 78.2526L84.2829 78.7136C81.5859 80.2747 78.6642 81.092 75.7546 81.2305C75.6745 81.2341 75.5941 81.2349 75.5137 81.2375C75.0363 81.2542 74.5597 81.2517 74.0845 81.2318C73.8927 81.2231 73.7009 81.2064 73.509 81.1918C73.1411 81.165 72.7736 81.1323 72.4085 81.0841C72.0909 81.0408 71.7739 80.9824 71.4566 80.9227C71.2029 80.8758 70.9479 80.8331 70.6963 80.7756C70.3154 80.6883 69.9427 80.5804 69.5709 80.471C69.3654 80.4104 69.1573 80.3583 68.9538 80.2907C68.5912 80.1706 68.2394 80.0273 67.8869 79.8862C67.6767 79.8018 67.4627 79.728 67.2555 79.636C66.945 79.4982 66.6468 79.3381 66.3454 79.1842C66.1089 79.0633 65.8672 78.9534 65.6354 78.8221C65.3909 78.6839 65.1599 78.525 64.9222 78.3758C64.6503 78.2053 64.3733 78.0443 64.1096 77.8593C63.9389 77.7394 63.7808 77.6022 63.6142 77.4765C63.3016 77.2408 62.9854 77.0109 62.6864 76.7542C62.6053 76.6845 62.5328 76.6049 62.4528 76.5339C61.189 75.4113 60.0496 74.108 59.0934 72.6145C58.7506 72.079 58.435 71.5265 58.1479 70.9592C58.1133 70.8912 58.0882 70.82 58.0544 70.7518C54.4801 63.4751 56.0375 54.7316 61.7258 49.1292C61.7534 49.102 61.7774 49.0718 61.8053 49.0448C62.1717 48.6884 62.5655 48.3537 62.9653 48.0245C63.055 47.9506 63.136 47.8688 63.2274 47.7964C63.724 47.4025 64.2401 47.0338 64.7739 46.6919C65.5153 46.2183 66.2887 45.7967 67.0885 45.4301C67.531 45.2271 67.9902 45.0826 68.4433 44.9159C68.8002 44.7842 69.1497 44.6265 69.5128 44.5171C70.0049 44.3695 70.5076 44.2797 71.0077 44.1735C71.3503 44.1006 71.6876 44.0036 72.0337 43.9504C72.5047 43.8779 72.9804 43.8587 73.4548 43.8224C73.8441 43.7928 74.2311 43.7441 74.6228 43.7391C75.4073 43.7285 76.193 43.7585 76.9748 43.8471C77.0098 43.8511 77.0449 43.8599 77.0799 43.8641C77.8406 43.9548 78.5971 44.0959 79.3462 44.2805C79.4699 44.3108 79.5907 44.3475 79.7135 44.3801C80.4445 44.5761 81.1693 44.807 81.88 45.0933C81.9071 45.1041 81.9349 45.1134 81.9619 45.1244C82.7611 45.4503 83.5373 45.8302 84.2852 46.2612L84.555 46.4169C87.0057 47.8862 89.1121 49.8973 90.6978 52.3735ZM6.42273 10.5167C7.09386 8.30462 8.68694 6.0467 11.9362 6.03746L11.9763 6.03759C15.2242 6.04778 16.8167 8.30515 17.4876 10.5167H6.42273ZM82.9327 97.7179C82.9327 99.3943 81.5694 100.758 79.8917 100.758H26.3333C24.6582 100.758 23.2949 99.3943 23.2949 97.7179L23.3105 15.9277H23.3107V13.2223C23.3107 10.7097 22.6531 8.20534 21.4189 6.08261L79.8918 6.3609C81.5696 6.3609 82.9329 7.7242 82.9329 9.40062V39.7024C82.8952 39.689 82.8562 39.6823 82.8184 39.669C82.1038 39.4225 81.3734 39.2117 80.6302 39.0306C80.4914 38.9964 80.355 38.9501 80.2155 38.9183C80.1666 38.9072 80.1204 38.89 80.0715 38.8793C79.2649 38.7031 78.45 38.5677 77.6299 38.4736C77.5243 38.4614 77.4182 38.4624 77.3127 38.4516C76.5557 38.3739 75.7996 38.3282 75.045 38.3221C74.8146 38.3205 74.5852 38.3372 74.3546 38.3422C73.7179 38.3552 73.0835 38.3855 72.452 38.4488C72.1954 38.4747 71.9413 38.5129 71.6856 38.547C71.0815 38.6265 70.4807 38.7293 69.8845 38.8551C69.619 38.9113 69.3555 38.9722 69.0918 39.0376C68.5075 39.1837 67.929 39.352 67.3575 39.542C67.096 39.628 66.8347 39.7102 66.5754 39.8054C65.991 40.0209 65.4177 40.2681 64.8482 40.53C64.6171 40.636 64.3824 40.7291 64.1537 40.8427C63.372 41.2325 62.603 41.6567 61.8571 42.1344C61.1818 42.5668 60.5279 43.032 59.8979 43.5282C59.2748 44.0189 58.6762 44.5399 58.1042 45.0893C54.6881 48.3712 52.3159 52.5872 51.2796 57.3182C49.8964 63.6261 51.0537 70.0951 54.5359 75.5325C54.9482 76.1762 55.3897 76.7894 55.8503 77.3806C56.0107 77.5865 56.1854 77.7768 56.3514 77.9767C56.6624 78.3502 56.9753 78.7214 57.3047 79.0721C57.519 79.3003 57.7439 79.5154 57.9662 79.7344C58.2704 80.0342 58.5771 80.3292 58.8946 80.6103C59.1412 80.8272 59.3922 81.0389 59.6476 81.2454C59.9657 81.5046 60.2905 81.7555 60.6217 81.9978C60.8839 82.1898 61.1469 82.3798 61.4169 82.5611C61.7805 82.8055 62.1523 83.0329 62.5273 83.256C62.7752 83.4035 63.0189 83.5564 63.2723 83.6948C63.7967 83.9819 64.3324 84.2434 64.8749 84.49C64.9905 84.5424 65.1008 84.6045 65.2174 84.655C65.9091 84.9564 66.6145 85.2207 67.3296 85.4556C67.4454 85.4934 67.5649 85.5219 67.6813 85.5581C68.2798 85.7453 68.8854 85.9092 69.4966 86.0494C69.572 86.0667 69.6438 86.0932 69.7197 86.1098C69.84 86.1362 69.9614 86.1447 70.0819 86.1693C70.6704 86.2884 71.2619 86.3855 71.8585 86.4605C72.1204 86.4941 72.3814 86.5296 72.6435 86.5548C73.1814 86.6046 73.7214 86.6288 74.2631 86.6424C74.4897 86.6489 74.7169 86.6793 74.9431 86.6793C75.0639 86.6793 75.1826 86.6553 75.3033 86.6536C76.1004 86.6391 76.8978 86.5773 77.6948 86.483C78.0608 86.4405 78.4251 86.3994 78.7884 86.3402C79.5852 86.2086 80.3748 86.0369 81.1542 85.8258C81.5755 85.7123 81.9887 85.5773 82.404 85.4406C82.5795 85.3826 82.7577 85.3398 82.9325 85.2778V97.7179H82.9327Z"
                      fill="#0F47F2"
                    />
                  </svg>

                  {/* Second SVG (inner, centered) */}
                  <svg
                    width="52"
                    height="83"
                    viewBox="0 0 52 83"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <path
                      d="M-0.0078125 0.304688H41.6383V8.92113H-0.0078125V0.304688ZM-0.0078125 24.719H19.6644V33.3355H-0.0078125V24.719ZM-0.0078125 49.1331H19.6644V57.7495H-0.0078125V49.1331ZM-0.0078125 73.667H8.36919V82.0441H-0.0078125V73.667ZM14.2302 73.667H22.6074V82.0441H14.2302V73.667ZM28.4683 73.667H36.8454V82.0441H28.4683V73.667ZM42.7063 73.667H51.0835V82.0441H42.7063V73.667Z"
                      fill="#60A5FA"
                    />
                  </svg>
                </div>

                <h3 className="text-xl text-center text-gray-400 mt-4">
                  Candidate coding round will shown here once they complete it
                </h3>
              </div>
            </div>
          );
        }

        return (
          <div className="bg-[#F5F9FB] px-4 py-3 rounded-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-medium text-[#4B5563]">
                Questions ({totalQuestions})
              </h3>
              <p className="text-base text-[#818283]">{date}</p>
            </div>
            {codingQuestions.map((q, index) => {
              // Split question into lines
              const lines = q.question.split("\n");
              const visibleLines = isExpanded ? lines : lines.slice(0, 2);
              const hiddenLineCount = Math.max(0, lines.length - 2);

              return (
                <div
                  key={index}
                  className="border border-[#4B5563] bg-[#F5F9FB] rounded-xl overflow-hidden"
                >
                  <div className="p-2 flex items-start space-x-2">
                    <span className="text-sm text-[#4B5563] font-medium">
                      Q{index + 1}.
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-[#4B5563] flex-1 mb-1">
                        {q.name}
                      </h3>
                      <p className="text-sm text-[#818283] flex-1 whitespace-pre-line">
                        {visibleLines.join("\n")}
                        {!isExpanded && hiddenLineCount > 0 && " ..."}
                      </p>
                    </div>
                  </div>
                  <hr className="border-t border-[#818283]/50 rounded-full" />
                  <div className="p-4 flex justify-between items-center text-xs bg-white">
                    <span className="text-[#818283]">{q.language}</span>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center text-[#818283]"
                      >
                        <div className="p-1 border border-[#818283] rounded-md mr-1">
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 8 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 1.00781H5.2M7 1.00781V2.80781M7 1.00781L4.9 3.10781M1 7.00781H2.8M1 7.00781V5.20781M1 7.00781L3.1 4.90781"
                              stroke="#818283"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        {isExpanded ? "Collapse" : "Expand"}{" "}
                      </button>
                      <div className="flex items-center text-[#818283]">
                        <SignalMedium className="w-4 h-4 mr-1 pl-1 pb-1 border border-[#818283] rounded-md" />
                        {q.difficulty}
                      </div>
                      <div className="flex items-center">
                        {q.status === "Pass" && (
                          <CheckCheck className="w-4 h-4 p-1 bg-[#007A5A] text-white mr-1 rounded-xl" />
                        )}
                        {q.status === "Fail" && (
                          <X className="w-4 h-4 p-1 bg-[#ED051C] text-white mr-1 rounded-xl" />
                        )}
                        {q.status === "Skip" && (
                          <Minus className="w-4 h-4 p-1 bg-[#818283] text-white mr-1 rounded-xl" />
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
                  <hr className="mx-auto w-[95%] border-t border-[#818283]/50" />
                  {!isExpanded && hiddenLineCount > 0 && (
                    <p className="px-4 py-3 text-sm text-[#BCBCBC] bg-white">
                      {hiddenLineCount} hidden lines
                    </p>
                  )}
                </div>
              );
            })}
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
            {interviewData?.resumeScore ||
            interviewData?.knowledgeScore ||
            interviewData?.communicationScore ? (
              <>
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
                    Abhishek demonstrates solid domain knowledge and experience
                    in ML engineering, particularly with AWS. However, clarity
                    in communication needs improvement. He covers many
                    questions, but responses sometimes lack depth or are unclear
                    due to noise interference.
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
                        <span className="text-sm text-[#0F47F2]">
                          {skill.name}
                        </span>
                        <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />
                        <span className="text-sm text-[#4B5563]">
                          {skill.rating}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#FDE7E7] rounded-xl py-2 px-3">
                  <h4 className="text-base font-medium text-[#F20A0A] mb-2">
                    Integrity Scores
                  </h4>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    Assistance: {interviewData?.proctoring?.assistance || "N/A"}
                    <br />
                    Device Usage:{" "}
                    {interviewData?.proctoring?.deviceUsage || "N/A"}
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
              </>
            ) : (
              <div className="flex justify-center items-center bg-[#F5F9FB] rounded-xl">
                <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                  <div className="relative inline-block">
                    {/* First SVG (outer shape) */}
                    <svg
                      width="102"
                      height="107"
                      viewBox="0 0 102 107"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M101.056 97.7513L90.3618 81.0519C94.4809 77.6315 97.3464 72.9844 98.5103 67.6711C99.8948 61.3632 98.7376 54.8941 95.2526 49.4568C93.4288 46.6082 91.0719 44.236 88.3437 42.4097V9.40048C88.3437 4.74115 84.5523 0.949914 79.9049 0.949914L11.9709 0.626608C11.9653 0.626608 11.9607 0.625 11.9551 0.625C11.95 0.625 11.9457 0.626608 11.9406 0.626608L11.6104 0.625L11.6102 0.662382C4.39273 0.865369 0.599609 7.06472 0.599609 13.2224V15.9278H17.8995L17.8839 97.718C17.8839 102.377 21.674 106.169 26.3333 106.169H79.8918C84.5523 106.169 88.3437 102.377 88.3437 97.718V91.2884L94.9762 101.645L101.056 97.7513ZM90.6978 52.3735V52.3748C93.4007 56.5955 94.2989 61.6154 93.2262 66.5125C92.159 71.3837 89.2636 75.5485 85.0786 78.2526L84.2829 78.7136C81.5859 80.2747 78.6642 81.092 75.7546 81.2305C75.6745 81.2341 75.5941 81.2349 75.5137 81.2375C75.0363 81.2542 74.5597 81.2517 74.0845 81.2318C73.8927 81.2231 73.7009 81.2064 73.509 81.1918C73.1411 81.165 72.7736 81.1323 72.4085 81.0841C72.0909 81.0408 71.7739 80.9824 71.4566 80.9227C71.2029 80.8758 70.9479 80.8331 70.6963 80.7756C70.3154 80.6883 69.9427 80.5804 69.5709 80.471C69.3654 80.4104 69.1573 80.3583 68.9538 80.2907C68.5912 80.1706 68.2394 80.0273 67.8869 79.8862C67.6767 79.8018 67.4627 79.728 67.2555 79.636C66.945 79.4982 66.6468 79.3381 66.3454 79.1842C66.1089 79.0633 65.8672 78.9534 65.6354 78.8221C65.3909 78.6839 65.1599 78.525 64.9222 78.3758C64.6503 78.2053 64.3733 78.0443 64.1096 77.8593C63.9389 77.7394 63.7808 77.6022 63.6142 77.4765C63.3016 77.2408 62.9854 77.0109 62.6864 76.7542C62.6053 76.6845 62.5328 76.6049 62.4528 76.5339C61.189 75.4113 60.0496 74.108 59.0934 72.6145C58.7506 72.079 58.435 71.5265 58.1479 70.9592C58.1133 70.8912 58.0882 70.82 58.0544 70.7518C54.4801 63.4751 56.0375 54.7316 61.7258 49.1292C61.7534 49.102 61.7774 49.0718 61.8053 49.0448C62.1717 48.6884 62.5655 48.3537 62.9653 48.0245C63.055 47.9506 63.136 47.8688 63.2274 47.7964C63.724 47.4025 64.2401 47.0338 64.7739 46.6919C65.5153 46.2183 66.2887 45.7967 67.0885 45.4301C67.531 45.2271 67.9902 45.0826 68.4433 44.9159C68.8002 44.7842 69.1497 44.6265 69.5128 44.5171C70.0049 44.3695 70.5076 44.2797 71.0077 44.1735C71.3503 44.1006 71.6876 44.0036 72.0337 43.9504C72.5047 43.8779 72.9804 43.8587 73.4548 43.8224C73.8441 43.7928 74.2311 43.7441 74.6228 43.7391C75.4073 43.7285 76.193 43.7585 76.9748 43.8471C77.0098 43.8511 77.0449 43.8599 77.0799 43.8641C77.8406 43.9548 78.5971 44.0959 79.3462 44.2805C79.4699 44.3108 79.5907 44.3475 79.7135 44.3801C80.4445 44.5761 81.1693 44.807 81.88 45.0933C81.9071 45.1041 81.9349 45.1134 81.9619 45.1244C82.7611 45.4503 83.5373 45.8302 84.2852 46.2612L84.555 46.4169C87.0057 47.8862 89.1121 49.8973 90.6978 52.3735ZM6.42273 10.5167C7.09386 8.30462 8.68694 6.0467 11.9362 6.03746L11.9763 6.03759C15.2242 6.04778 16.8167 8.30515 17.4876 10.5167H6.42273ZM82.9327 97.7179C82.9327 99.3943 81.5694 100.758 79.8917 100.758H26.3333C24.6582 100.758 23.2949 99.3943 23.2949 97.7179L23.3105 15.9277H23.3107V13.2223C23.3107 10.7097 22.6531 8.20534 21.4189 6.08261L79.8918 6.3609C81.5696 6.3609 82.9329 7.7242 82.9329 9.40062V39.7024C82.8952 39.689 82.8562 39.6823 82.8184 39.669C82.1038 39.4225 81.3734 39.2117 80.6302 39.0306C80.4914 38.9964 80.355 38.9501 80.2155 38.9183C80.1666 38.9072 80.1204 38.89 80.0715 38.8793C79.2649 38.7031 78.45 38.5677 77.6299 38.4736C77.5243 38.4614 77.4182 38.4624 77.3127 38.4516C76.5557 38.3739 75.7996 38.3282 75.045 38.3221C74.8146 38.3205 74.5852 38.3372 74.3546 38.3422C73.7179 38.3552 73.0835 38.3855 72.452 38.4488C72.1954 38.4747 71.9413 38.5129 71.6856 38.547C71.0815 38.6265 70.4807 38.7293 69.8845 38.8551C69.619 38.9113 69.3555 38.9722 69.0918 39.0376C68.5075 39.1837 67.929 39.352 67.3575 39.542C67.096 39.628 66.8347 39.7102 66.5754 39.8054C65.991 40.0209 65.4177 40.2681 64.8482 40.53C64.6171 40.636 64.3824 40.7291 64.1537 40.8427C63.372 41.2325 62.603 41.6567 61.8571 42.1344C61.1818 42.5668 60.5279 43.032 59.8979 43.5282C59.2748 44.0189 58.6762 44.5399 58.1042 45.0893C54.6881 48.3712 52.3159 52.5872 51.2796 57.3182C49.8964 63.6261 51.0537 70.0951 54.5359 75.5325C54.9482 76.1762 55.3897 76.7894 55.8503 77.3806C56.0107 77.5865 56.1854 77.7768 56.3514 77.9767C56.6624 78.3502 56.9753 78.7214 57.3047 79.0721C57.519 79.3003 57.7439 79.5154 57.9662 79.7344C58.2704 80.0342 58.5771 80.3292 58.8946 80.6103C59.1412 80.8272 59.3922 81.0389 59.6476 81.2454C59.9657 81.5046 60.2905 81.7555 60.6217 81.9978C60.8839 82.1898 61.1469 82.3798 61.4169 82.5611C61.7805 82.8055 62.1523 83.0329 62.5273 83.256C62.7752 83.4035 63.0189 83.5564 63.2723 83.6948C63.7967 83.9819 64.3324 84.2434 64.8749 84.49C64.9905 84.5424 65.1008 84.6045 65.2174 84.655C65.9091 84.9564 66.6145 85.2207 67.3296 85.4556C67.4454 85.4934 67.5649 85.5219 67.6813 85.5581C68.2798 85.7453 68.8854 85.9092 69.4966 86.0494C69.572 86.0667 69.6438 86.0932 69.7197 86.1098C69.84 86.1362 69.9614 86.1447 70.0819 86.1693C70.6704 86.2884 71.2619 86.3855 71.8585 86.4605C72.1204 86.4941 72.3814 86.5296 72.6435 86.5548C73.1814 86.6046 73.7214 86.6288 74.2631 86.6424C74.4897 86.6489 74.7169 86.6793 74.9431 86.6793C75.0639 86.6793 75.1826 86.6553 75.3033 86.6536C76.1004 86.6391 76.8978 86.5773 77.6948 86.483C78.0608 86.4405 78.4251 86.3994 78.7884 86.3402C79.5852 86.2086 80.3748 86.0369 81.1542 85.8258C81.5755 85.7123 81.9887 85.5773 82.404 85.4406C82.5795 85.3826 82.7577 85.3398 82.9325 85.2778V97.7179H82.9327Z"
                        fill="#0F47F2"
                      />
                    </svg>

                    {/* Second SVG (inner, centered) */}
                    <svg
                      width="52"
                      height="83"
                      viewBox="0 0 52 83"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <path
                        d="M-0.0078125 0.304688H41.6383V8.92113H-0.0078125V0.304688ZM-0.0078125 24.719H19.6644V33.3355H-0.0078125V24.719ZM-0.0078125 49.1331H19.6644V57.7495H-0.0078125V49.1331ZM-0.0078125 73.667H8.36919V82.0441H-0.0078125V73.667ZM14.2302 73.667H22.6074V82.0441H14.2302V73.667ZM28.4683 73.667H36.8454V82.0441H28.4683V73.667ZM42.7063 73.667H51.0835V82.0441H42.7063V73.667Z"
                        fill="#60A5FA"
                      />
                    </svg>
                  </div>

                  <h3 className="text-xl text-center text-gray-400 mt-4">
                    Candidate interview round will shown here once they complete
                    it
                  </h3>
                </div>
              </div>
            )}
          </div>
        );
      case "Activity":
        return (
          <div className="bg-[#F5F9FB] p-4 rounded-xl space-y-4">
            <h3 className="text-base font-medium text-[#4B5563]">Activity</h3>
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={index} className="border-l-2 border-gray-400">
                  <div
                    className="flex justify-start space-x-2 cursor-pointer"
                    onClick={() =>
                      setSelectedActivityIndex(
                        selectedActivityIndex === index ? null : index
                      )
                    }
                  >
                    <hr className="w-[10%] border-t-2 mt-2 border-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">{activity.date} </p>
                      <p className="text-sm text-gray-400 font-medium">
                        {activity.description}
                      </p>
                      {activity.note && selectedActivityIndex === index && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-400 whitespace-pre-line">
                            Replies: {activity.note}
                          </p>
                        </div>
                      )}
                    </div>
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
                            const newActivities = [...activities];
                            newActivities[index].note =
                              activityReplies[index] || "Replied via input";
                            setActivities(newActivities);
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
                              const newActivities = [...activities];
                              newActivities[index].note = `${
                                viaReplies[index] || ""
                              } (via ${activity.via})`;
                              setActivities(newActivities);
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
                  <div className="flex justify-center items-center rounded-xl">
                    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                      <div className="relative inline-block">
                        {/* First SVG (outer shape) */}
                        <svg
                          width="102"
                          height="107"
                          viewBox="0 0 102 107"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M101.056 97.7513L90.3618 81.0519C94.4809 77.6315 97.3464 72.9844 98.5103 67.6711C99.8948 61.3632 98.7376 54.8941 95.2526 49.4568C93.4288 46.6082 91.0719 44.236 88.3437 42.4097V9.40048C88.3437 4.74115 84.5523 0.949914 79.9049 0.949914L11.9709 0.626608C11.9653 0.626608 11.9607 0.625 11.9551 0.625C11.95 0.625 11.9457 0.626608 11.9406 0.626608L11.6104 0.625L11.6102 0.662382C4.39273 0.865369 0.599609 7.06472 0.599609 13.2224V15.9278H17.8995L17.8839 97.718C17.8839 102.377 21.674 106.169 26.3333 106.169H79.8918C84.5523 106.169 88.3437 102.377 88.3437 97.718V91.2884L94.9762 101.645L101.056 97.7513ZM90.6978 52.3735V52.3748C93.4007 56.5955 94.2989 61.6154 93.2262 66.5125C92.159 71.3837 89.2636 75.5485 85.0786 78.2526L84.2829 78.7136C81.5859 80.2747 78.6642 81.092 75.7546 81.2305C75.6745 81.2341 75.5941 81.2349 75.5137 81.2375C75.0363 81.2542 74.5597 81.2517 74.0845 81.2318C73.8927 81.2231 73.7009 81.2064 73.509 81.1918C73.1411 81.165 72.7736 81.1323 72.4085 81.0841C72.0909 81.0408 71.7739 80.9824 71.4566 80.9227C71.2029 80.8758 70.9479 80.8331 70.6963 80.7756C70.3154 80.6883 69.9427 80.5804 69.5709 80.471C69.3654 80.4104 69.1573 80.3583 68.9538 80.2907C68.5912 80.1706 68.2394 80.0273 67.8869 79.8862C67.6767 79.8018 67.4627 79.728 67.2555 79.636C66.945 79.4982 66.6468 79.3381 66.3454 79.1842C66.1089 79.0633 65.8672 78.9534 65.6354 78.8221C65.3909 78.6839 65.1599 78.525 64.9222 78.3758C64.6503 78.2053 64.3733 78.0443 64.1096 77.8593C63.9389 77.7394 63.7808 77.6022 63.6142 77.4765C63.3016 77.2408 62.9854 77.0109 62.6864 76.7542C62.6053 76.6845 62.5328 76.6049 62.4528 76.5339C61.189 75.4113 60.0496 74.108 59.0934 72.6145C58.7506 72.079 58.435 71.5265 58.1479 70.9592C58.1133 70.8912 58.0882 70.82 58.0544 70.7518C54.4801 63.4751 56.0375 54.7316 61.7258 49.1292C61.7534 49.102 61.7774 49.0718 61.8053 49.0448C62.1717 48.6884 62.5655 48.3537 62.9653 48.0245C63.055 47.9506 63.136 47.8688 63.2274 47.7964C63.724 47.4025 64.2401 47.0338 64.7739 46.6919C65.5153 46.2183 66.2887 45.7967 67.0885 45.4301C67.531 45.2271 67.9902 45.0826 68.4433 44.9159C68.8002 44.7842 69.1497 44.6265 69.5128 44.5171C70.0049 44.3695 70.5076 44.2797 71.0077 44.1735C71.3503 44.1006 71.6876 44.0036 72.0337 43.9504C72.5047 43.8779 72.9804 43.8587 73.4548 43.8224C73.8441 43.7928 74.2311 43.7441 74.6228 43.7391C75.4073 43.7285 76.193 43.7585 76.9748 43.8471C77.0098 43.8511 77.0449 43.8599 77.0799 43.8641C77.8406 43.9548 78.5971 44.0959 79.3462 44.2805C79.4699 44.3108 79.5907 44.3475 79.7135 44.3801C80.4445 44.5761 81.1693 44.807 81.88 45.0933C81.9071 45.1041 81.9349 45.1134 81.9619 45.1244C82.7611 45.4503 83.5373 45.8302 84.2852 46.2612L84.555 46.4169C87.0057 47.8862 89.1121 49.8973 90.6978 52.3735ZM6.42273 10.5167C7.09386 8.30462 8.68694 6.0467 11.9362 6.03746L11.9763 6.03759C15.2242 6.04778 16.8167 8.30515 17.4876 10.5167H6.42273ZM82.9327 97.7179C82.9327 99.3943 81.5694 100.758 79.8917 100.758H26.3333C24.6582 100.758 23.2949 99.3943 23.2949 97.7179L23.3105 15.9277H23.3107V13.2223C23.3107 10.7097 22.6531 8.20534 21.4189 6.08261L79.8918 6.3609C81.5696 6.3609 82.9329 7.7242 82.9329 9.40062V39.7024C82.8952 39.689 82.8562 39.6823 82.8184 39.669C82.1038 39.4225 81.3734 39.2117 80.6302 39.0306C80.4914 38.9964 80.355 38.9501 80.2155 38.9183C80.1666 38.9072 80.1204 38.89 80.0715 38.8793C79.2649 38.7031 78.45 38.5677 77.6299 38.4736C77.5243 38.4614 77.4182 38.4624 77.3127 38.4516C76.5557 38.3739 75.7996 38.3282 75.045 38.3221C74.8146 38.3205 74.5852 38.3372 74.3546 38.3422C73.7179 38.3552 73.0835 38.3855 72.452 38.4488C72.1954 38.4747 71.9413 38.5129 71.6856 38.547C71.0815 38.6265 70.4807 38.7293 69.8845 38.8551C69.619 38.9113 69.3555 38.9722 69.0918 39.0376C68.5075 39.1837 67.929 39.352 67.3575 39.542C67.096 39.628 66.8347 39.7102 66.5754 39.8054C65.991 40.0209 65.4177 40.2681 64.8482 40.53C64.6171 40.636 64.3824 40.7291 64.1537 40.8427C63.372 41.2325 62.603 41.6567 61.8571 42.1344C61.1818 42.5668 60.5279 43.032 59.8979 43.5282C59.2748 44.0189 58.6762 44.5399 58.1042 45.0893C54.6881 48.3712 52.3159 52.5872 51.2796 57.3182C49.8964 63.6261 51.0537 70.0951 54.5359 75.5325C54.9482 76.1762 55.3897 76.7894 55.8503 77.3806C56.0107 77.5865 56.1854 77.7768 56.3514 77.9767C56.6624 78.3502 56.9753 78.7214 57.3047 79.0721C57.519 79.3003 57.7439 79.5154 57.9662 79.7344C58.2704 80.0342 58.5771 80.3292 58.8946 80.6103C59.1412 80.8272 59.3922 81.0389 59.6476 81.2454C59.9657 81.5046 60.2905 81.7555 60.6217 81.9978C60.8839 82.1898 61.1469 82.3798 61.4169 82.5611C61.7805 82.8055 62.1523 83.0329 62.5273 83.256C62.7752 83.4035 63.0189 83.5564 63.2723 83.6948C63.7967 83.9819 64.3324 84.2434 64.8749 84.49C64.9905 84.5424 65.1008 84.6045 65.2174 84.655C65.9091 84.9564 66.6145 85.2207 67.3296 85.4556C67.4454 85.4934 67.5649 85.5219 67.6813 85.5581C68.2798 85.7453 68.8854 85.9092 69.4966 86.0494C69.572 86.0667 69.6438 86.0932 69.7197 86.1098C69.84 86.1362 69.9614 86.1447 70.0819 86.1693C70.6704 86.2884 71.2619 86.3855 71.8585 86.4605C72.1204 86.4941 72.3814 86.5296 72.6435 86.5548C73.1814 86.6046 73.7214 86.6288 74.2631 86.6424C74.4897 86.6489 74.7169 86.6793 74.9431 86.6793C75.0639 86.6793 75.1826 86.6553 75.3033 86.6536C76.1004 86.6391 76.8978 86.5773 77.6948 86.483C78.0608 86.4405 78.4251 86.3994 78.7884 86.3402C79.5852 86.2086 80.3748 86.0369 81.1542 85.8258C81.5755 85.7123 81.9887 85.5773 82.404 85.4406C82.5795 85.3826 82.7577 85.3398 82.9325 85.2778V97.7179H82.9327Z"
                            fill="#0F47F2"
                          />
                        </svg>

                        {/* Second SVG (inner, centered) */}
                        <svg
                          width="52"
                          height="83"
                          viewBox="0 0 52 83"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                          <path
                            d="M-0.0078125 0.304688H41.6383V8.92113H-0.0078125V0.304688ZM-0.0078125 24.719H19.6644V33.3355H-0.0078125V24.719ZM-0.0078125 49.1331H19.6644V57.7495H-0.0078125V49.1331ZM-0.0078125 73.667H8.36919V82.0441H-0.0078125V73.667ZM14.2302 73.667H22.6074V82.0441H14.2302V73.667ZM28.4683 73.667H36.8454V82.0441H28.4683V73.667ZM42.7063 73.667H51.0835V82.0441H42.7063V73.667Z"
                            fill="#60A5FA"
                          />
                        </svg>
                      </div>

                      <h3 className="text-xl text-center text-gray-400 mt-4">
                        No Team notes available. You can add a new note below.
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center rounded-xl">
                    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
                      <div className="relative inline-block">
                        {/* First SVG (outer shape) */}
                        <svg
                          width="102"
                          height="107"
                          viewBox="0 0 102 107"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M101.056 97.7513L90.3618 81.0519C94.4809 77.6315 97.3464 72.9844 98.5103 67.6711C99.8948 61.3632 98.7376 54.8941 95.2526 49.4568C93.4288 46.6082 91.0719 44.236 88.3437 42.4097V9.40048C88.3437 4.74115 84.5523 0.949914 79.9049 0.949914L11.9709 0.626608C11.9653 0.626608 11.9607 0.625 11.9551 0.625C11.95 0.625 11.9457 0.626608 11.9406 0.626608L11.6104 0.625L11.6102 0.662382C4.39273 0.865369 0.599609 7.06472 0.599609 13.2224V15.9278H17.8995L17.8839 97.718C17.8839 102.377 21.674 106.169 26.3333 106.169H79.8918C84.5523 106.169 88.3437 102.377 88.3437 97.718V91.2884L94.9762 101.645L101.056 97.7513ZM90.6978 52.3735V52.3748C93.4007 56.5955 94.2989 61.6154 93.2262 66.5125C92.159 71.3837 89.2636 75.5485 85.0786 78.2526L84.2829 78.7136C81.5859 80.2747 78.6642 81.092 75.7546 81.2305C75.6745 81.2341 75.5941 81.2349 75.5137 81.2375C75.0363 81.2542 74.5597 81.2517 74.0845 81.2318C73.8927 81.2231 73.7009 81.2064 73.509 81.1918C73.1411 81.165 72.7736 81.1323 72.4085 81.0841C72.0909 81.0408 71.7739 80.9824 71.4566 80.9227C71.2029 80.8758 70.9479 80.8331 70.6963 80.7756C70.3154 80.6883 69.9427 80.5804 69.5709 80.471C69.3654 80.4104 69.1573 80.3583 68.9538 80.2907C68.5912 80.1706 68.2394 80.0273 67.8869 79.8862C67.6767 79.8018 67.4627 79.728 67.2555 79.636C66.945 79.4982 66.6468 79.3381 66.3454 79.1842C66.1089 79.0633 65.8672 78.9534 65.6354 78.8221C65.3909 78.6839 65.1599 78.525 64.9222 78.3758C64.6503 78.2053 64.3733 78.0443 64.1096 77.8593C63.9389 77.7394 63.7808 77.6022 63.6142 77.4765C63.3016 77.2408 62.9854 77.0109 62.6864 76.7542C62.6053 76.6845 62.5328 76.6049 62.4528 76.5339C61.189 75.4113 60.0496 74.108 59.0934 72.6145C58.7506 72.079 58.435 71.5265 58.1479 70.9592C58.1133 70.8912 58.0882 70.82 58.0544 70.7518C54.4801 63.4751 56.0375 54.7316 61.7258 49.1292C61.7534 49.102 61.7774 49.0718 61.8053 49.0448C62.1717 48.6884 62.5655 48.3537 62.9653 48.0245C63.055 47.9506 63.136 47.8688 63.2274 47.7964C63.724 47.4025 64.2401 47.0338 64.7739 46.6919C65.5153 46.2183 66.2887 45.7967 67.0885 45.4301C67.531 45.2271 67.9902 45.0826 68.4433 44.9159C68.8002 44.7842 69.1497 44.6265 69.5128 44.5171C70.0049 44.3695 70.5076 44.2797 71.0077 44.1735C71.3503 44.1006 71.6876 44.0036 72.0337 43.9504C72.5047 43.8779 72.9804 43.8587 73.4548 43.8224C73.8441 43.7928 74.2311 43.7441 74.6228 43.7391C75.4073 43.7285 76.193 43.7585 76.9748 43.8471C77.0098 43.8511 77.0449 43.8599 77.0799 43.8641C77.8406 43.9548 78.5971 44.0959 79.3462 44.2805C79.4699 44.3108 79.5907 44.3475 79.7135 44.3801C80.4445 44.5761 81.1693 44.807 81.88 45.0933C81.9071 45.1041 81.9349 45.1134 81.9619 45.1244C82.7611 45.4503 83.5373 45.8302 84.2852 46.2612L84.555 46.4169C87.0057 47.8862 89.1121 49.8973 90.6978 52.3735ZM6.42273 10.5167C7.09386 8.30462 8.68694 6.0467 11.9362 6.03746L11.9763 6.03759C15.2242 6.04778 16.8167 8.30515 17.4876 10.5167H6.42273ZM82.9327 97.7179C82.9327 99.3943 81.5694 100.758 79.8917 100.758H26.3333C24.6582 100.758 23.2949 99.3943 23.2949 97.7179L23.3105 15.9277H23.3107V13.2223C23.3107 10.7097 22.6531 8.20534 21.4189 6.08261L79.8918 6.3609C81.5696 6.3609 82.9329 7.7242 82.9329 9.40062V39.7024C82.8952 39.689 82.8562 39.6823 82.8184 39.669C82.1038 39.4225 81.3734 39.2117 80.6302 39.0306C80.4914 38.9964 80.355 38.9501 80.2155 38.9183C80.1666 38.9072 80.1204 38.89 80.0715 38.8793C79.2649 38.7031 78.45 38.5677 77.6299 38.4736C77.5243 38.4614 77.4182 38.4624 77.3127 38.4516C76.5557 38.3739 75.7996 38.3282 75.045 38.3221C74.8146 38.3205 74.5852 38.3372 74.3546 38.3422C73.7179 38.3552 73.0835 38.3855 72.452 38.4488C72.1954 38.4747 71.9413 38.5129 71.6856 38.547C71.0815 38.6265 70.4807 38.7293 69.8845 38.8551C69.619 38.9113 69.3555 38.9722 69.0918 39.0376C68.5075 39.1837 67.929 39.352 67.3575 39.542C67.096 39.628 66.8347 39.7102 66.5754 39.8054C65.991 40.0209 65.4177 40.2681 64.8482 40.53C64.6171 40.636 64.3824 40.7291 64.1537 40.8427C63.372 41.2325 62.603 41.6567 61.8571 42.1344C61.1818 42.5668 60.5279 43.032 59.8979 43.5282C59.2748 44.0189 58.6762 44.5399 58.1042 45.0893C54.6881 48.3712 52.3159 52.5872 51.2796 57.3182C49.8964 63.6261 51.0537 70.0951 54.5359 75.5325C54.9482 76.1762 55.3897 76.7894 55.8503 77.3806C56.0107 77.5865 56.1854 77.7768 56.3514 77.9767C56.6624 78.3502 56.9753 78.7214 57.3047 79.0721C57.519 79.3003 57.7439 79.5154 57.9662 79.7344C58.2704 80.0342 58.5771 80.3292 58.8946 80.6103C59.1412 80.8272 59.3922 81.0389 59.6476 81.2454C59.9657 81.5046 60.2905 81.7555 60.6217 81.9978C60.8839 82.1898 61.1469 82.3798 61.4169 82.5611C61.7805 82.8055 62.1523 83.0329 62.5273 83.256C62.7752 83.4035 63.0189 83.5564 63.2723 83.6948C63.7967 83.9819 64.3324 84.2434 64.8749 84.49C64.9905 84.5424 65.1008 84.6045 65.2174 84.655C65.9091 84.9564 66.6145 85.2207 67.3296 85.4556C67.4454 85.4934 67.5649 85.5219 67.6813 85.5581C68.2798 85.7453 68.8854 85.9092 69.4966 86.0494C69.572 86.0667 69.6438 86.0932 69.7197 86.1098C69.84 86.1362 69.9614 86.1447 70.0819 86.1693C70.6704 86.2884 71.2619 86.3855 71.8585 86.4605C72.1204 86.4941 72.3814 86.5296 72.6435 86.5548C73.1814 86.6046 73.7214 86.6288 74.2631 86.6424C74.4897 86.6489 74.7169 86.6793 74.9431 86.6793C75.0639 86.6793 75.1826 86.6553 75.3033 86.6536C76.1004 86.6391 76.8978 86.5773 77.6948 86.483C78.0608 86.4405 78.4251 86.3994 78.7884 86.3402C79.5852 86.2086 80.3748 86.0369 81.1542 85.8258C81.5755 85.7123 81.9887 85.5773 82.404 85.4406C82.5795 85.3826 82.7577 85.3398 82.9325 85.2778V97.7179H82.9327Z"
                            fill="#0F47F2"
                          />
                        </svg>

                        {/* Second SVG (inner, centered) */}
                        <svg
                          width="52"
                          height="83"
                          viewBox="0 0 52 83"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                          <path
                            d="M-0.0078125 0.304688H41.6383V8.92113H-0.0078125V0.304688ZM-0.0078125 24.719H19.6644V33.3355H-0.0078125V24.719ZM-0.0078125 49.1331H19.6644V57.7495H-0.0078125V49.1331ZM-0.0078125 73.667H8.36919V82.0441H-0.0078125V73.667ZM14.2302 73.667H22.6074V82.0441H14.2302V73.667ZM28.4683 73.667H36.8454V82.0441H28.4683V73.667ZM42.7063 73.667H51.0835V82.0441H42.7063V73.667Z"
                            fill="#60A5FA"
                          />
                        </svg>
                      </div>

                      <h3 className="text-xl text-center text-gray-400 mt-4">
                        No community notes available. You can add a new note
                        below.
                      </h3>
                    </div>
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
