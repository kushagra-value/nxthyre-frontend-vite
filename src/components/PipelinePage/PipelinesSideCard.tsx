// PipelinesSideCard.tsx
import React from "react";
import { Mail, Copy, Phone, User, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useAuthContext } from "../../context/AuthContext";

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
  renderStageDetails: () => React.ReactNode;
  showComments: boolean;
  setShowComments: (show: boolean) => void;
  feedbackComments: Comment[];
  candidateComments: Comment[];
  newComment: string;
  setNewComment: (comment: string) => void;
  handleAddComment: () => void;
}

const PipelinesSideCard: React.FC<PipelinesSideCardProps> = ({
  selectedCandidate,
  renderStageDetails,
  showComments,
  setShowComments,
  feedbackComments,
  candidateComments,
  newComment,
  setNewComment,
  handleAddComment,
}) => {
  const { user } = useAuthContext();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4 min-h-[81vh]">
      {selectedCandidate ? (
        <>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {selectedCandidate.firstName[0]}
              {selectedCandidate.lastName[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedCandidate.fullName || "N/A"}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedCandidate.headline || "N/A"}
              </p>
              <p className="text-sm text-gray-500">
                {selectedCandidate.location.city},{" "}
                {selectedCandidate.location.country}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate">
                  {selectedCandidate.email || "N/A"}
                </span>
              </div>
              <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {selectedCandidate.phone?.number || "N/A"}
                </span>
              </div>
              <div className="flex space-x-2">
                <FontAwesomeIcon
                  icon={faWhatsapp}
                  className="w-4 h-4 text-gray-400 hover:text-green-600 cursor-pointer"
                />
                <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
            </div>
          </div>
          {renderStageDetails()}
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
      <div
        className={`absolute top-0 left-0 w-full h-full bg-gray-50 transform transition-all duration-300 ease-in-out z-10 ${
          showComments
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white p-4 h-full flex flex-col shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
            <button
              onClick={() => setShowComments(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Kanban board notes */}
            <h4 className="text-lg font-semibold text-gray-900">
              Kanban board notes
            </h4>
            {feedbackComments.length > 0 ? (
              feedbackComments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 mr-2">
                      <p className="font-medium text-sm text-gray-900">
                        {comment.author}
                      </p>
                      {comment.subject && (
                        <p className="text-sm text-gray-700 mt-1 font-medium">
                          {comment.subject}
                        </p>
                      )}
                      <p className="text-sm text-gray-800 mt-1">
                        {comment.text}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4">
                      {comment.date}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No Kanban board notes</p>
            )}

            {/* Notes */}
            <h4 className="text-lg font-semibold text-gray-900">Notes</h4>
            {candidateComments.length > 0 ? (
              candidateComments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {comment.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2 mr-2">
                      <p className="font-medium text-sm text-gray-900">
                        {comment.author}
                      </p>
                      {comment.subject && (
                        <p className="text-sm text-gray-700 mt-1 font-medium">
                          {comment.subject}
                        </p>
                      )}
                      <p className="text-sm text-gray-800 mt-1">
                        {comment.text}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-4">
                      {comment.date}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No notes</p>
            )}
          </div>
          <div className="mt-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {user?.fullName?.[0] || "U"}
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelinesSideCard;
