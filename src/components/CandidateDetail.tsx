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
  Share,
  Send,
  MessageCircle,
  MessageSquareTextIcon,
  MessageSquareText,
  Info,
  CheckIcon,
  XIcon,
  PhoneIcon,
  UsersRound,
  ThumbsDown,
  ThumbsUp,
  ChevronUp,
  Linkedin,
} from "lucide-react";

// Custom SVG Icon for IdCard
const IdCard: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || 24}
    height={props.height || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-id-card-icon lucide-id-card ${
      props.className || ""
    }`}
    {...props}
  >
    <path d="M16 10h2" />
    <path d="M16 14h2" />
    <path d="M6.17 15a3 3 0 0 1 5.66 0" />
    <circle cx="9" cy="11" r="2" />
    <rect x="2" y="5" width="20" height="14" rx="2" />
  </svg>
);
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { showToast } from "../utils/toast";
import {
  candidateService,
  CandidateDetailData,
  CandidateListItem,
  Note,
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
  const [showConfirm, setShowConfirm] = useState(false);

  const tabs = [
    { name: "Profile" },
    { name: "Education" },
    { name: "Skills" },
    { name: "References" },
    { name: "Notes" },
  ];

  interface NotesTabProps {
    candidateId: string;
  }

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
    setShowConfirm(true);
  };

  const confirmSpend = async () => {
    setShowConfirm(false);
    try {
      await deductCredits();
      onSendInvite();
    } catch {
      showToast.error("Failed to deduct credits");
    }
  };

  const cancelSpend = () => {
    setShowConfirm(false);
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
    : `${detailedCandidate.candidate.full_name
        ?.toLocaleLowerCase()
        ?.slice(0, 2)}*********@gmail.com`;
  const displayPhone = hasContactInfo
    ? detailedCandidate.candidate.candidate_phone
    : "93********45";

  const ProfileTab = () => {
    const [showMore, setShowMore] = useState(false);
    const experiences = detailedCandidate?.candidate?.experience || [];

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
              {experiences.length > 0 ? (
                (showMore || experiences.length <= 1
                  ? experiences
                  : experiences.slice(0, 1)
                ).map((exp, index) => (
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
        {experiences.length > 1 && !showMore && (
          <div className="absolute bottom-0 left-0 right-0 p-4 ml-6 flex space-x-1 items-center">
            <button
              onClick={() => setShowMore(true)}
              className="text-[#0F47F2] text-sm font-medium bg-gradient-to-r from-white to-gray-100 hover:from-gray-50 hover:to-gray-200 py-2 px-4 rounded-md shadow-sm z-10 transition-colors duration-200"
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

  const SkillsTab = () => {
    // Dummy data for vetted skills
    const vettedSkills = [
      { skill: "Meta Ads", rating: 3.5 },
      { skill: "Flutter", rating: 4 },
      { skill: "SEO", rating: 4.5 },
    ];

    // Extract resume skills from detailedCandidate
    const resumeSkills =
      detailedCandidate?.candidate?.skills_data?.skills_mentioned?.map(
        (skill) => skill.skill
      ) || [];

    // State to manage expansion
    const [isVettedExpanded, setIsVettedExpanded] = useState(false);
    const [isResumeExpanded, setIsResumeExpanded] = useState(false);

    return (
      <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
        {/* Vetted Skills Subsection */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 flex items-center">
            <Star className="w-4 h-4 mr-2" />
            Vetted Skills
            <Info className="w-4 h-4 ml-2" />
          </h4>
          {vettedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-4 mt-2">
              {vettedSkills
                .slice(0, isVettedExpanded ? vettedSkills.length : 6)
                .map((skill) => (
                  <div
                    key={skill.skill}
                    className="flex items-center bg-white p-2 rounded-lg"
                  >
                    <span className="text-sm text-blue-500 mr-2">
                      {skill.skill}
                    </span>
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="ml-2 text-sm text-gray-600">
                      {skill.rating}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No vetted skills available</p>
          )}
          {!isVettedExpanded && vettedSkills.length > 6 && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsVettedExpanded(true);
              }}
              className="text-blue-500 text-sm mt-2 flex items-center"
            >
              View More
              <span className="ml-1">
                <ChevronDown className="text-blue-500" />
              </span>
            </a>
          )}
        </div>
        {/* Resume Skills Subsection */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 flex items-center">
            <IdCard className="w-4 h-4 mr-2" />
            Resume
          </h4>
          {resumeSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {resumeSkills
                .slice(0, isResumeExpanded ? resumeSkills.length : 10)
                .map((skill, index) => (
                  <span
                    key={index}
                    className="p-2 bg-white text-blue-500 text-xs rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No skills listed in resume</p>
          )}
          {!isResumeExpanded && resumeSkills.length > 10 && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsResumeExpanded(true);
              }}
              className="text-blue-500 text-sm mt-2 flex items-center"
            >
              View More
              <span className="ml-1">
                <ChevronDown className="text-blue-500" />
              </span>
            </a>
          )}
        </div>
      </div>
    );
  };

  const ReferencesTab = () => {
    const dummyReferences = [
      {
        initials: "SV",
        name: "Suchandni Verma",
        position: "HR Manager at Augnito",
        status: "positive",
        email: "suchandni.verma@augnito",
        phone: "9876543210",
        linkedin: "https://www.linkedin.com/in/suchandni-verma",
        description:
          "Exceptional digital marketer whose strategic campaigns and data-driven approach have significantly boosted our brand's online presence and conversions! Creative, proactive, and a pleasure to work with!",
      },
      {
        initials: "AA",
        name: "Ana De Armas",
        position: "HR Manager at Augnito",
        status: "negative",
        email: "ana.dearmas@augnito",
        phone: "9876543210",
        linkedin: "https://www.linkedin.com/in/ana-de-armas",
        description:
          "I am a Machine Learning Engineer with a strong passion for AI, deep learning, and large language models (LLMs). I hold a degree in Computer Science and have experience in developing and deploying machine learning models. My expertise includes natural language processing, computer vision, and reinforcement learning. I am proficient in Python, TensorFlow, and PyTorch.",
      },
    ];

    return (
      <div className="bg-[#F0F0F0] p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <UsersRound className="w-5 h-5 text-[#4B5563] mr-2" />
          <h3 className="text-[17px] text-[#4B5563] font-medium">
            Available References
          </h3>
        </div>
        <div>
          {dummyReferences.map((reference, index) => (
            <ReferenceCard key={index} reference={reference} />
          ))}
        </div>
      </div>
    );
  };

  const ReferenceCard = ({ reference }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showPopup, setShowPopup] = useState<
      "email" | "phone" | "linkedin" | null
    >(null);

    const truncateLength = 100;
    const truncatedDescription =
      reference.description.length > truncateLength
        ? reference.description.substring(0, truncateLength) + "..."
        : reference.description;

    const handleMouseEnter = (type) => {
      setShowPopup(type);
    };

    const handleMouseLeave = () => {
      setShowPopup(null);
    };

    return (
      <div className="border-b border-gray-400 mb-4 pb-4">
        <div className="">
          <div className="flex justify-between items-center w-full mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#4B5563] bg-[#DFFBE2]">
                {reference.initials}
              </div>
              <div className="">
                <h4 className="text-lg text-[#4B5563] font-semibold">
                  {reference.name}
                </h4>
                <p className="text-sm text-gray-600">{reference.position}</p>
              </div>
            </div>
            <div>
              {reference.status === "positive" ? (
                <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
                  <ThumbsUp className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-5 h-5 bg-red-500 rounded-full">
                  <ThumbsDown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
          <div className="ml-[52px] flex-1">
            <p className="text-[#818283] text-sm leading-snug mt-2 mb-2">
              {isExpanded ? reference.description : truncatedDescription}
            </p>
            <div className="flex mt-3 space-x-3">
              <div
                className="w-6 h-6 bg-[#4B5563] rounded-full flex items-center justify-center cursor-pointer relative"
                onMouseEnter={() => handleMouseEnter("email")}
                onMouseLeave={handleMouseLeave}
              >
                <Mail className="w-3 h-3 text-white" />
                {showPopup === "email" && (
                  <div
                    className="absolute bottom-8 left-0 bg-blue-50 p-2 rounded-md shadow-md z-10"
                    onMouseEnter={() => setShowPopup("email")} // Keep popup visible
                    onMouseLeave={handleMouseLeave} // Allow it to hide when leaving popup
                  >
                    <p
                      className="text-sm text-blue-700 select-text"
                      style={{ userSelect: "text" }}
                    >
                      {reference.email}
                    </p>
                  </div>
                )}
              </div>
              <div
                className="w-6 h-6 bg-[#4B5563] rounded-full flex items-center justify-center cursor-pointer relative"
                onMouseEnter={() => handleMouseEnter("phone")}
                onMouseLeave={handleMouseLeave}
              >
                <PhoneIcon className="w-3 h-3 text-white" />
                {showPopup === "phone" && (
                  <div
                    className="absolute bottom-8 left-0 bg-blue-50 p-2 rounded-md shadow-md z-10"
                    onMouseEnter={() => setShowPopup("phone")} // Keep popup visible
                    onMouseLeave={handleMouseLeave} // Allow it to hide when leaving popup
                  >
                    <p
                      className="text-sm text-blue-700 select-text"
                      style={{ userSelect: "text" }}
                    >
                      {reference.phone}
                    </p>
                  </div>
                )}
              </div>
              <div
                className="w-6 h-6 bg-[#4B5563] rounded-full flex items-center justify-center cursor-pointer relative"
                onMouseEnter={() => handleMouseEnter("linkedin")}
                onMouseLeave={handleMouseLeave}
              >
                <Linkedin className="w-3 h-3 text-white" />
                {showPopup === "linkedin" && (
                  <div
                    className="absolute bottom-8 left-0 bg-blue-50 p-2 rounded-md shadow-md z-10"
                    onMouseEnter={() => setShowPopup("linkedin")} // Keep popup visible
                    onMouseLeave={handleMouseLeave} // Allow it to hide when leaving popup
                  >
                    <p
                      className="text-sm text-blue-700 select-text"
                      style={{ userSelect: "text" }}
                    >
                      {reference.linkedin}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {reference.description.length > truncateLength && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-500 text-sm mt-2 flex items-center focus:outline-none"
              >
                {isExpanded ? "View Less" : "View More"}
                <span className="ml-1">
                  {isExpanded ? (
                    <ChevronUp className="text-blue-500 text-sm mt-[2px]" />
                  ) : (
                    <ChevronDown className="text-blue-500 text-sm mt-[2px]" />
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const NotesTab: React.FC<NotesTabProps> = ({ candidateId }) => {
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
            candidateId
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
    }, [candidateId]);

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

        await candidateService.postCandidateNote(candidateId, payload);
        setNewComment("");

        // Refetch notes to update the UI
        const updatedNotes = await candidateService.getCandidateNotes(
          candidateId
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
                              note.postedBy?.email ||
                              "Unknown"}
                          </h4>
                          <p className="text-sm text-[#4B5563]">
                            {note.organisation?.orgName || "Company"}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[#818283] mt-1">
                        {new Date(note.posted_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
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
              <div>No team notes available. You can add a new note below.</div>
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
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-3 lg:p-3 ${
        showConfirm ? "space-y-0" : "space-y-6"
      } min-h-[81vh] relative overflow-hidden`}
    >
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
            <span className="text-sm text-gray-700">{displayEmail}</span>
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
            className={`py-2 px-2 text-sm font-medium ${
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
        {activeTab === "References" && <ReferencesTab />}
        {activeTab === "Notes" && <NotesTab candidateId={candidate.id} />}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-80 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Usage
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This will cost you{" "}
              <span className="font-semibold">3 credits</span>. Do you want to
              proceed?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelSpend}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmSpend}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDetail;
