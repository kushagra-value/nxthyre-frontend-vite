// PipelinesSideCard.tsx
import React from "react";
import { Mail, Copy, Phone, User, X, Share2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useAuthContext } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";
import StageDetails from "./StageDetails";

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

interface Comment {
  id: string | number;
  avatar: string;
  author: string;
  subject?: string;
  text: string;
  date: string;
}

interface PipelinesSideCardProps {
  selectedCandidate: PipelineCandidate | null;
  showComments: boolean;
  setShowComments: (show: boolean) => void;
  feedbackComments: Comment[];
  candidateComments: Comment[];
  newComment: string;
  setNewComment: (comment: string) => void;
  handleAddComment: () => void;
  selectedStage: string;
  stages: Stage[];
  moveCandidate: (applicationId: number, stageId: number) => Promise<void>;
  archiveCandidate: (applicationId: number) => Promise<void>;
  stageData?: PipelineCandidate["stageData"];
}

const PipelinesSideCard: React.FC<PipelinesSideCardProps> = ({
  selectedCandidate,
  showComments,
  setShowComments,
  feedbackComments,
  candidateComments,
  newComment,
  setNewComment,
  handleAddComment,
  selectedStage,
  stages,
  moveCandidate,
  archiveCandidate,
  stageData,
}) => {
  const { user } = useAuthContext();
  const handleShareProfile = () => {
    window.open(`/candidate-profiles/${selectedCandidate?.id}`, "_blank");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast.success("Copied to clipboard!");
      })
      .catch(() => {
        showToast.error("Failed to copy");
      });
  };

  const handleWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/[^0-9+]/g, "");
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
  };

  const hasContactInfo =
    !!selectedCandidate?.email && !!selectedCandidate?.phone;
  const displayEmail = hasContactInfo
    ? selectedCandidate?.email
    : `${selectedCandidate?.fullName
        ?.toLocaleLowerCase()
        ?.slice(0, 2)}*********@gmail.com`;
  const displayPhone = hasContactInfo
    ? typeof selectedCandidate?.phone === "string"
      ? selectedCandidate?.phone
      : selectedCandidate?.phone?.number || ""
    : "93********45";

  console.log("Stage data PipelinesSideCard :::::::::::::::::::: ", stageData);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-4 min-h-[81vh]">
      {selectedCandidate ? (
        <>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {selectedCandidate.firstName[0]}
              {selectedCandidate.lastName[0]}
            </div>
            <div>
              <h2 className="text-base lg:text-[16px] font-bold text-gray-900">
                {selectedCandidate.fullName}
              </h2>
              <div className="flex">
                <p className="text-sm text-gray-500 max-w-[32ch] truncate">
                  {selectedCandidate.headline}
                </p>
              </div>
              <div className="flex">
                <p className="text-sm text-gray-500">
                  {selectedCandidate.location.city},{" "}
                  {selectedCandidate.location.country}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-400 absolute right-6 top-4">
              <button
                onClick={handleShareProfile}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="border-t border-gray-300 border-b p-3 space-y-2">
            <div className="flex justify-between items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                <span className="text-sm text-gray-500">{displayEmail}</span>
              </div>
              <button
                className={`flex space-x-2 ml-auto p-1 ${
                  hasContactInfo
                    ? "text-gray-400 hover:text-gray-600"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => hasContactInfo && handleCopy(displayEmail)}
                disabled={!hasContactInfo}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-500">{displayPhone}</span>
              </div>
              <div>
                <button
                  className={`p-1 ${
                    hasContactInfo
                      ? "text-gray-400 hover:text-gray-600"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => hasContactInfo && handleWhatsApp(displayPhone)}
                  disabled={!hasContactInfo}
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                </button>
                <button
                  className={`p-1 ${
                    hasContactInfo
                      ? "text-gray-400 hover:text-gray-600"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => hasContactInfo && handleCopy(displayPhone)}
                  disabled={!hasContactInfo}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <StageDetails
            selectedCandidate={selectedCandidate}
            selectedStage={selectedStage} // You need to pass selectedStage as a prop to PipelinesSideCard
            setShowComments={setShowComments}
            stages={stages} // You need to pass stages as a prop to PipelinesSideCard
            moveCandidate={moveCandidate} // You need to pass moveCandidate as a prop to PipelinesSideCard
            archiveCandidate={archiveCandidate} // You need to pass archiveCandidate as a prop to PipelinesSideCard
            stageData={stageData} // You need to pass stageData as a prop to PipelinesSideCard
          />
        </>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-base font-medium">No Candidate Selected</p>
          <p className="text-sm mt-1">
            Select a candidate from the list to view their details
          </p>
        </div>
      )}
    </div>
  );
};

export default PipelinesSideCard;
