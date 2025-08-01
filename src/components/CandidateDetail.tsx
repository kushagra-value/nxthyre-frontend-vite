import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Copy,
  Briefcase,
  GraduationCap,
  Award,
  Star,
  TrendingUp,
  User,
  Share2,
  ChevronDown,
  FileText,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { showToast } from "../utils/toast";
import {
  candidateService,
  CandidateDetailData,
  CandidateListItem,
} from "../services/candidateService";

interface CandidateDetailProps {
  candidate: CandidateListItem | null;
  candidates: CandidateListItem[];
  onSendInvite: () => void;
  updateCandidateEmail: (
    candidateId: string,
    candidate_email: string,
    candidate_phone: string
  ) => void;
  deductCredits: () => Promise<void>;
}

const CandidateDetail: React.FC<CandidateDetailProps> = ({
  candidate,
  candidates = [],
  onSendInvite,
  updateCandidateEmail,
  deductCredits,
}) => {
  const [newComment, setNewComment] = useState("");
  const [detailedCandidate, setDetailedCandidate] =
    useState<CandidateDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [notesView, setNotesView] = useState("my");

  const tabs = [
    { name: "Profile" },
    { name: "Education" },
    { name: "Skills" },
    { name: "Notes" },
  ];

  useEffect(() => {
    if (candidate?.id) {
      const fetchCandidateDetails = async () => {
        setLoading(true);
        try {
          const data = await candidateService.getCandidateDetails(candidate.id);
          setDetailedCandidate({
            ...data,
            candidate: {
              ...data.candidate,
              candidate_email: candidate.candidate_email,
              candidate_phone: candidate.candidate_phone,
            },
          });
        } catch (error) {
          console.error("Error fetching candidate details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCandidateDetails();
    }
  }, [candidate?.id, candidate?.candidate_email, candidate?.candidate_phone]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4">
        <div className="text-center text-gray-500 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-base font-medium">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4">
        <div className="text-center text-gray-500 mt-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-base font-medium">No candidates Selected</p>
          <p className="text-sm mt-1">
            Click and view the candidates information
          </p>
        </div>
      </div>
    );
  }

  if (error || !detailedCandidate) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-4">
        <div className="text-center text-gray-500 mt-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-base font-medium">
            Unable to Load candidate details
          </p>
          <p className="text-sm mt-1">
            {error || "Please select a candidate to view details"}
          </p>
        </div>
      </div>
    );
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log("Adding comment:", newComment);
      setNewComment("");
    }
  };

  const handleShareProfile = () => {
    window.open(
      `/candidate-profiles/${detailedCandidate.candidate.id}`,
      "_blank"
    );
  };

  const getAvatarColor = (name: string) => {
    return "bg-blue-500";
  };

  const handleSendInviteClick = async () => {
    await deductCredits();
    onSendInvite();
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
    !!detailedCandidate.candidate.candidate_email &&
    !!detailedCandidate.candidate.candidate_phone;
  const displayEmail = hasContactInfo
    ? detailedCandidate.candidate.candidate_email
    : `${detailedCandidate.candidate.full_name?.slice(
        0,
        2
      )}***************.****`;
  const displayPhone = hasContactInfo
    ? detailedCandidate.candidate.candidate_phone
    : "+91-**********";

  const ProfileTab = () => {
    const [showMore, setShowMore] = useState(false);

    return (
      <div className="relative bg-[#F0F0F0] p-3 rounded-lg">
        <div
          className={`overflow-hidden ${showMore ? "" : "min-h-[50vh]"}`}
          style={{ transition: "max-height 0.3s ease" }}
        >
          <div className="mb-4 border-b border-gray-200">
            <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] flex items-center">
              <User className="w-4 h-4 mr-2 text-[#4B5563]" />
              Profile Summary
            </h3>
            <p className="text-sm text-[#818283] leading-normal pt-2 pb-4 pl-6 pr-2 rounded-lg">
              {detailedCandidate?.candidate?.profile_summary ||
                "I am a Machine Learning Engineer with a strong passion for AI, deep learning, and large language models (LLMs). I hold a B.E/B.Tech in Computer Science & Engineering from HKBK College of Engineering. My experience includes developing AI models for NLP, computer vision, and Retrieval-Augmented Generation (RAG) based applications across various industries"}
            </p>
          </div>
          <div>
            <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-[#4B5563]" />
              Experience
            </h3>
            <div className="ml-2">
              {detailedCandidate?.candidate?.experience?.length > 0 ? (
                detailedCandidate?.candidate?.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-gray-200 pl-4 relative pb-2 space-y-1"
                  >
                    <div className="absolute w-2 h-2 rounded-full -left-[5px] top-1.5"></div>
                    <h4 className="font-medium text-[#111827] text-sm">
                      {exp?.job_title}
                    </h4>
                    <p className="text-sm text-[#4B5563]">{`${exp?.company} | ${exp?.location}`}</p>
                    <p className="text-sm text-[#6B7280]">
                      {exp?.start_date} - {exp?.end_date || "Present"}
                    </p>
                    <p className="text-sm text-[#4B5563] mt-1">
                      {exp?.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No experience details available
                </p>
              )}
            </div>
          </div>
        </div>
        {!showMore && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent p-4 ml-6 flex space-x-1 items-center">
            <button
              onClick={() => setShowMore(true)}
              className="text-[#0F47F2] text-sm"
            >
              VIEW MORE
            </button>
            <ChevronDown
              className="text-[#0F47F2] cursor-pointer mt-[2px]"
              onClick={() => setShowMore(true)}
            />
          </div>
        )}
      </div>
    );
  };

  const EducationTab = () => (
    <div className="bg-[#F0F0F0] p-3 rounded-lg">
      <div className="mb-4">
        <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
          <GraduationCap className="w-4 h-4 mr-2 text-[#4B5563]" />
          Education
        </h3>
        <div className="ml-2">
          {detailedCandidate?.candidate?.education?.length > 0 ? (
            detailedCandidate?.candidate?.education.map((edu, index) => (
              <div
                key={index}
                className="border-l-2 border-gray-200 pl-4 relative pb-2 space-y-1"
              >
                <div className="absolute w-2 h-2 rounded-full -left-[5px] top-1.5"></div>
                <h4 className="font-medium text-[#111827] text-sm">
                  {edu?.degree}
                </h4>
                <p className="text-sm text-[#4B5563]">{edu?.specialization}</p>
                <p className="text-sm text-[#6B7280]">
                  {edu?.start_date} - {edu?.end_date}
                </p>
                {edu?.institution && (
                  <p className="text-sm text-[#4B5563]">{edu?.institution}</p>
                )}
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
          {detailedCandidate?.candidate?.certifications?.length > 0 ? (
            detailedCandidate?.candidate?.certifications.map((cert, index) => (
              <div
                key={index}
                className="border-l-2 border-gray-200 pl-4 relative pb-2 space-y-1"
              >
                <div className="absolute w-2 h-2 rounded-full -left-[5px] top-1.5"></div>
                <h4 className="font-medium text-[#111827] text-sm">
                  {cert?.name}
                </h4>
                <p className="text-sm text-[#4B5563]">{cert?.issuer}</p>
                <p className="text-sm text-[#6B7280]">{cert?.issued_date}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No certifications available</p>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-[#4B5563]" />
          Recommendations
        </h3>
        <div className="space-y-2">
          {detailedCandidate?.candidate?.recommendations?.length > 0 ? (
            detailedCandidate?.candidate?.recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start space-x-2 space-y-1">
                  <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[#111827] text-sm">
                      {rec?.recommender_name}
                    </h4>
                    <p className="text-xs text-[#4B5563]">
                      {rec?.recommender_title}
                    </p>
                    <p className="text-sm text-[#4B5563] mt-1">
                      "{rec?.feedback}"
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1">
                      {rec?.date_received}
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
    </div>
  );

  const SkillsTab = () => (
    <div className="bg-[#F0F0F0] p-3 rounded-lg pb-6">
      <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-3 flex items-center">
        <Star className="w-4 h-4 mr-2 text-[#4B5563]" />
        Skills
      </h3>
      <div className="flex flex-wrap gap-3">
        {detailedCandidate?.candidate?.skills_data?.skills_mentioned?.length >
        0 ? (
          detailedCandidate?.candidate?.skills_data.skills_mentioned.map(
            (skill, index) => (
              <span
                key={index}
                className="px-3 py-[5px] bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {skill?.skill}
              </span>
            )
          )
        ) : (
          <p className="text-sm text-gray-500">No skills listed</p>
        )}
      </div>
    </div>
  );

  const NotesTab = () => {
    // Define dummy notes to display when no actual notes are available
    const dummyNotes = [
      {
        noteId: "dummy1",
        postedBy: { userName: "Sample User" },
        organisation: { orgName: "Sample Company" },
        content:
          "This is a sample note to demonstrate the layout. lorem ipsum dolor sit amet, consectetur adipiscing elit. ipsum dolor sit amet, consectetur adipiscing elit.",
        posted_at: new Date().toISOString(),
      },
      {
        noteId: "dummy2",
        postedBy: { userName: "Another User" },
        organisation: { orgName: "Another Company" },
        content:
          "Another sample note for illustration. lorem ipsum dolor sit amet, consectetur adipiscing elit. pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
        posted_at: new Date().toISOString(),
      },
    ];

    return (
      <div className="bg-[#F0F0F0] p-3 rounded-lg">
        {/* Header with Heading and Toggle */}
        <div className="flex justify-between items-center mb-2 border-b-2 border-gray-200 px-3 pt-1 pb-2">
          {/* Notes about the Person Heading */}
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">
              Notes about the Person
            </h3>
          </div>
          {/* Community Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Community</span>
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
        <div className="space-y-2 border-gray-200">
          {notesView === "my" ? (
            (detailedCandidate?.candidate?.notes?.length > 0
              ? detailedCandidate.candidate.notes
              : dummyNotes
            ).map((note) => (
              <div key={note.noteId} className="border-b border-gray-200 pb-2">
                <div className="flex flex-col space-y-2 px-3 py-2 mb-0">
                  <div className="flex justify-between items-center ">
                    {/* User Avatar and Info */}
                    <div className="flex space-x-3 items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {note?.postedBy?.userName ||
                            note?.organisation?.orgName}
                        </h4>
                        <p className="text-xs text-gray-700">
                          {note?.organisation?.orgName || "Company"}
                        </p>
                      </div>
                    </div>
                    {/* Posted Date */}
                    <div>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(note?.posted_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-800">{note?.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              Community notes will be displayed here
            </p>
          )}
        </div>

        {/* Comment Input Section */}
        <div className="mt-4 flex space-x-3">
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            J
          </div>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type your team comment"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
            onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-3 space-y-6 min-h-[81vh] relative overflow-hidden">
      <div className="flex space-x-3 items-center mt-1">
        <div
          className={`w-12 h-12 ${getAvatarColor(
            detailedCandidate?.candidate?.full_name
          )} rounded-full flex items-center justify-center text-white`}
        >
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base lg:text-[16px] font-bold text-gray-900">
            {detailedCandidate?.candidate?.full_name}
          </h2>
          <div className="flex">
            <p className="text-sm text-gray-500 max-w-[32ch] truncate">
              {detailedCandidate?.candidate?.headline}
            </p>
          </div>
          <div className="flex">
            <p className="text-sm text-gray-500">
              {detailedCandidate?.candidate?.location}
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
            <span className="text-sm text-gray-700 truncate">
              {displayEmail}
            </span>
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
            <span className="text-sm text-gray-700">{displayPhone}</span>
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

      <div className="space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={handleSendInviteClick}
            className="flex-1 px-3 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            style={{ width: "100%" }}
          >
            Send Invite & Reveal Info
          </button>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === tab.name
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.name}
            {tab.name === "Notes" && (
              <span className="ml-1">
                ({detailedCandidate?.candidate?.notes?.length || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "Profile" && <ProfileTab />}
        {activeTab === "Education" && <EducationTab />}
        {activeTab === "Skills" && <SkillsTab />}
        {activeTab === "Notes" && <NotesTab />}
      </div>
    </div>
  );
};

export default CandidateDetail;
