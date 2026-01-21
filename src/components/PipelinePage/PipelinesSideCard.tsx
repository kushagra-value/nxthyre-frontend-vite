// PipelinesSideCard.tsx
import React from "react";
import { Mail, Copy, Phone, User, X, Share2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useAuthContext } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";
import StageDetails from "./StageDetails";
import { PipelineCandidate } from "../../data/pipelineData";

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
  setSelectedCandidate: (candidate: PipelineCandidate | null) => void;
  showComments: boolean;
  setShowComments: (show: boolean) => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  handleAddComment: () => void;
  selectedStage: string;
  stages: Stage[];
  moveCandidate: (applicationId: number, stageId: number) => Promise<void>;
  archiveCandidate: (applicationId: number) => Promise<void>;
  stageData?: PipelineCandidate["candidate"]["stageData"];
  jobId: number; // jobId prop for sharing profile
  onSendInvite: (applicationId: number) => Promise<void>;
  deductCredits: () => Promise<void>;
}

const PipelinesSideCard: React.FC<PipelinesSideCardProps> = ({
  selectedCandidate,
  setSelectedCandidate,
  showComments,
  setShowComments,
  newComment,
  setNewComment,
  handleAddComment,
  selectedStage,
  stages,
  moveCandidate,
  archiveCandidate,
  stageData,
  jobId,
  onSendInvite,
  deductCredits,
}) => {
  const { user } = useAuthContext();

  const handleShareProfile = () => {
    window.open(
      `/candidate-profiles/${selectedCandidate?.candidate.id}`,
      "_blank",
    );
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

  const random70to99 = () => Math.floor(Math.random() * 30 + 70);

  const displayEmail =
    selectedCandidate?.candidate.premium_data_unlocked &&
    selectedCandidate?.candidate.premium_data_availability?.email &&
    selectedCandidate?.candidate.premium_data?.email
      ? selectedCandidate.candidate.premium_data.email
      : `${(selectedCandidate?.candidate.full_name || "")
          .slice(0, 3)
          .toLowerCase()}***********@gmail.com`;

  // Updated display logic for phone
  const displayPhone =
    selectedCandidate?.candidate.premium_data_unlocked &&
    selectedCandidate?.candidate.premium_data_availability?.phone_number &&
    selectedCandidate?.candidate.premium_data?.phone
      ? selectedCandidate.candidate.premium_data.phone
      : `95********89`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-4 min-h-[81vh]">
      {selectedCandidate ? (
        <>
          <div className="flex items-center space-x-3">
            {/* <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              
              {selectedCandidate?.candidate.profilePicture.displayImageUrl ? (
                <img
                  src={
                    selectedCandidate.candidate.profilePicture.displayImageUrl
                  }
                  alt={selectedCandidate.candidate.full_name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                selectedCandidate?.candidate.full_name
                  ?.split(" ")
                  ?.map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  ?.slice(0, 2)
              )}
            </div> */}
            <div>
              <h2 className="text-base lg:text-[16px] font-bold text-gray-900">
                {selectedCandidate.candidate.full_name}
              </h2>
              <div className="flex">
                <p className="text-sm text-gray-500 max-w-[32ch] truncate">
                  {selectedCandidate.candidate.headline}
                </p>
              </div>
              <div className="flex">
                <p className="text-sm text-gray-500">
                  {selectedCandidate.candidate.location}
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
                  displayEmail
                    ? "text-gray-400 hover:text-gray-600"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => displayEmail && handleCopy(displayEmail)}
                disabled={!displayEmail}
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
                    displayPhone
                      ? "text-gray-400 hover:text-gray-600"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => displayPhone && handleWhatsApp(displayPhone)}
                  disabled={!displayPhone}
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                </button>
                <button
                  className={`p-1 ${
                    displayPhone
                      ? "text-gray-400 hover:text-gray-600"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => displayPhone && handleCopy(displayPhone)}
                  disabled={!displayPhone}
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <StageDetails
            selectedCandidate={selectedCandidate}
            setSelectedCandidate={setSelectedCandidate} // You need to pass setSelectedCandidate as a prop to PipelinesSideCard
            selectedStage={selectedStage} // You need to pass selectedStage as a prop to PipelinesSideCard
            setShowComments={setShowComments}
            stages={stages} // You need to pass stages as a prop to PipelinesSideCard
            moveCandidate={moveCandidate} // You need to pass moveCandidate as a prop to PipelinesSideCard
            archiveCandidate={archiveCandidate} // You need to pass archiveCandidate as a prop to PipelinesSideCard
            transferredStageData={stageData} // You need to pass stageData as a prop to PipelinesSideCard
            jobId={jobId}
            onSendInvite={onSendInvite}
            deductCredits={deductCredits}
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
