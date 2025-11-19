import React, { useState, useEffect, useMemo } from "react";
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
  Circle,
  CircleIcon,
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
import { CompanyHoverCard } from "./CompanyHoverCard";

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
  onUpdateCandidate: (updated: CandidateListItem) => void;
}

const CandidateDetail: React.FC<CandidateDetailProps> = ({
  candidate,
  candidates = [],
  onSendInvite,
  updateCandidateEmail,
  onUpdateCandidate,
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
  const [logos, setLogos] = useState<{ [key: string]: string | undefined }>({});
  const random70to99 = () => Math.floor(Math.random() * 30 + 70);

  // Reset activeTab to "Profile" when candidate changes
  useEffect(() => {
    setActiveTab("Profile");
  }, [candidate?.id]);

  // In ProfileTab or where email/phone shown, update display
  const displayEmail =
    detailedCandidate?.candidate?.premium_data_unlocked &&
    detailedCandidate?.candidate?.premium_data_availability?.email &&
    detailedCandidate?.candidate?.premium_data?.email
      ? detailedCandidate.candidate.premium_data.email
      : `${(detailedCandidate?.candidate?.full_name || "")
          .slice(0, 3)
          .toLowerCase()}***********@gmail.com`;

  // Updated display logic for phone
  const displayPhone =
    detailedCandidate?.candidate?.premium_data_unlocked &&
    detailedCandidate?.candidate?.premium_data_availability?.phone_number &&
    detailedCandidate?.candidate?.premium_data?.phone
      ? detailedCandidate.candidate.premium_data.phone
      : `95********89`;

  const [booleanData, setBooleanData] = useState<string>("");

  useEffect(() => {
    const fetchBooleanSearch = async () => {
      if (candidate?.id) {
        try {
          const data = await candidateService.getCandidateBooleanSearch(
            candidate.id
          );
          setBooleanData(data);
        } catch (error) {
          console.error("Error fetching boolean search:", error);
        }
      }
    };
    fetchBooleanSearch();
  }, [candidate?.id]);

  const tabs = [
    { name: "Boolean-Search" },
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
          });
        } catch (error) {
          console.error("Error fetching candidate details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCandidateDetails();
    }
  }, [candidate]);

  const fetchLogo = async (query: string) => {
    if (!query || logos[query] !== undefined) return;
    try {
      const response = await fetch(
        `https://api.logo.dev/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_LOGO_DEV_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      const logoUrl = data.length > 0 ? data[0].logo_url : null;

      setLogos((prev) => ({ ...prev, [query]: logoUrl }));
    } catch (error) {
      console.error(`Error fetching logo for ${query}:`, error);
      setLogos((prev) => ({ ...prev, [query]: undefined }));
    }
  };

  useEffect(() => {
    if (detailedCandidate?.candidate) {
      detailedCandidate.candidate.education?.forEach((edu) => {
        if (edu?.institution) fetchLogo(edu.institution);
      });
      detailedCandidate.candidate.experience?.forEach((exp) => {
        if (exp?.company) fetchLogo(exp.company);
      });
    }
  }, [detailedCandidate]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-3 lg:p-4">
        <div className="text-center text-gray-500 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-base font-medium">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-white rounded-xl p-3 lg:p-4">
        <div className="text-center text-gray-500 mt-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-base font-medium">No candidates Selected</p>
          <p className="text-sm mt-1">
            Click on candidate card to view the more information
          </p>
        </div>
      </div>
    );
  }

  if (error || !detailedCandidate) {
    return (
      <div className="bg-white rounded-xl p-3 lg:p-4">
        <div className="text-center text-gray-500 mt-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-base font-medium">
            Unable to Load candidate details
          </p>
          <p className="text-sm mt-1">
            {error || "Please select another candidate to view details"}
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
    if (detailedCandidate?.candidate?.premium_data_unlocked) {
      try {
        onSendInvite();
      } catch {
        showToast.error("Failed to deduct credits");
      }
    } else {
      // Show confirmation popup if premium_data_unlocked is false
      setShowConfirm(true);
    }
  };

  const handleReveal = async (candidateId: string) => {
    try {
      const premResponse = await candidateService.revealPremiumData(
        candidateId
      );
      const updated = {
        ...candidate!,
        premium_data_unlocked: true,
        premium_data: premResponse.premium_data,
      };
      onUpdateCandidate(updated);
      return premResponse;
    } catch (e) {
      showToast.error("Failed to reveal premium data");
      throw e;
    }
  };

  const confirmSpend = async () => {
    setShowConfirm(false);
    try {
      await handleReveal(detailedCandidate.candidate.id);
      await deductCredits();
      const updatedDetails = await candidateService.getCandidateDetails(
        detailedCandidate.candidate.id
      );
      setDetailedCandidate(updatedDetails);
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

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word[0]?.toUpperCase())
      .join("")
      .slice(0, 1);
  };

  const BooleanSearchTab = () => {
    return (
      <div className="bg-[#F0F0F0] p-3 rounded-lg">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Boolean Search</h2>
        </div>
      </div>
    );
  };
  const ProfileTab = () => {
    const [showMore, setShowMore] = useState(false);
    const experiences = detailedCandidate?.candidate?.experience || [];
    const [showMoreSummary, setShowMoreSummary] = useState(false);
    const [expandedExperiences, setExpandedExperiences] = useState(new Set());
    const summary = detailedCandidate?.candidate?.profile_summary || "";
    const maxLength = 320; // character limit before truncation

    const toggleExpanded = () => setShowMoreSummary(!showMoreSummary);

    const displayText =
      !showMoreSummary && summary.length > maxLength
        ? summary.slice(0, maxLength) + "..."
        : summary;

    const toggleExperience = (index: number) => {
      setExpandedExperiences((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    };

    return (
      <div className="bg-[#F0F0F0] p-3 rounded-lg relative">
        {detailedCandidate?.candidate?.profile_summary && (
          <div className="mb-4 border-b border-gray-200">
            <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] flex items-center">
              <User className="w-4 h-4 mr-2 text-[#4B5563]" />
              Profile Summary
            </h3>
            <p className="text-sm text-[#818283] leading-normal pt-2 pb-4 pl-6 pr-2 rounded-lg">
              {displayText}
              {summary.length > maxLength && (
                <button
                  onClick={toggleExpanded}
                  className="ml-1 text-blue-500 text-xs mt-1"
                >
                  {showMoreSummary ? "View Less" : "View More"}
                </button>
              )}
            </p>
          </div>
        )}

        <div className="">
          <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
            <Briefcase className="w-4 h-4 mr-2 text-[#4B5563]" />
            Experience
          </h3>
          <div className="relative">
            <div
              className={`relative ${
                !showMore && experiences.length > 1 ? "overflow-hidden" : ""
              }`}
              style={{
                maskImage:
                  !showMore && experiences.length > 1
                    ? "linear-gradient(to bottom, black 96%, transparent 100%)"
                    : "none",
                WebkitMaskImage:
                  !showMore && experiences.length > 1
                    ? "linear-gradient(to bottom, black 96%, transparent 100%)"
                    : "none",
              }}
            >
              {experiences.length > 0 ? (
                (showMore || experiences.length <= 1
                  ? experiences
                  : experiences.slice(0, 1)
                ).map((exp, index) => {
                  const expDescription = exp?.description || "";
                  const isExpanded = expandedExperiences.has(index);
                  const displayExpText =
                    !isExpanded && expDescription.length > maxLength
                      ? expDescription.slice(0, maxLength) + "..."
                      : expDescription;

                  return (
                    <div
                      key={index}
                      className="border-l-2 border-gray-200 ml-2 pl-4 relative pb-2 space-y-1"
                    >
                      <div className="absolute rounded-full -left-[10px] top-1 ">
                        {logos[exp?.company] ? (
                          <img
                            src={logos[exp?.company]}
                            alt={`${exp?.company} logo`}
                            className="w-5 h-5 object-contain rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                            {getInitials(exp?.company || "")}
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-[#111827] text-sm">
                        {exp?.job_title}
                      </h4>
                      {/* <p className="text-sm text-gray-400">{`${exp?.company} | ${exp?.location}`}</p> */}
                      <p className="text-sm text-gray-400">
                        <CompanyHoverCard
                          companyName={exp?.company}
                          description={exp?.description}
                          employeeCount="1001+"
                          location={exp?.location}
                          logoUrl={logos[exp?.company]}
                        >
                          <span className="text-blue-600 hover:text-blue-800 underline cursor-pointer">
                            {exp?.company}
                          </span>
                        </CompanyHoverCard>{" "}
                        | {exp?.location}
                      </p>

                      <p className="text-sm text-gray-400">
                        {exp?.start_date && (
                          <span>
                            {exp?.start_date} - {exp?.end_date || "Present"}
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-sm text-[#4B5563] mt-1 ${
                          !showMore && experiences.length > 1
                            ? "relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-12 after:bg-gradient-to-t after:from-[#F0F0F0] after:to-transparent"
                            : ""
                        }`}
                      >
                        {displayExpText}
                        {expDescription.length > maxLength && (
                          <button
                            onClick={() => toggleExperience(index)}
                            className="ml-1 text-blue-500 text-xs mt-1"
                          >
                            {isExpanded ? "View Less" : "View More"}
                          </button>
                        )}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">
                  No experience details available
                </p>
              )}
            </div>
          </div>
        </div>
        {experiences.length > 1 && !showMore && (
          <div className="mt-1 ml-6 flex space-x-1 items-center">
            <button
              onClick={() => setShowMore(true)}
              className="text-[#0F47F2] text-sm font-medium"
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
        <div className="relative">
          {detailedCandidate?.candidate?.education?.length > 0 ? (
            detailedCandidate?.candidate?.education.map((edu, index) => (
              <div
                key={index}
                className="border-l-2 border-gray-200 ml-2 pl-4 relative pb-2 space-y-1"
              >
                <div className="absolute rounded-full -left-[10px] top-1 ">
                  {edu?.institution && logos[edu.institution] ? (
                    <img
                      src={logos[edu.institution]}
                      alt={`${edu.institution} logo`}
                      className="w-5 h-5 object-contain rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                      {getInitials(edu?.institution || "")}
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-[#111827] text-sm">
                  {edu?.degree}
                </h4>
                <p className="text-sm text-[#4B5563]">{edu?.specialization}</p>
                <p className="text-sm text-[#6B7280]">
                  {edu?.start_date && (
                    <span>
                      {edu?.start_date} - {edu?.end_date}
                    </span>
                  )}
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
      {detailedCandidate?.candidate?.certifications?.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
            <Award className="w-4 h-4 mr-2 text-[#4B5563]" />
            Certifications
          </h3>
          <div className="ml-2">
            {detailedCandidate?.candidate?.certifications?.length > 0 ? (
              detailedCandidate?.candidate?.certifications.map(
                (cert, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-gray-200 pl-4 relative pb-2 space-y-1"
                  >
                    <div className="absolute w-2 h-2 rounded-full -left-[5px] top-1.5"></div>
                    <h4 className="font-medium text-[#111827] text-sm">
                      {cert?.name}
                    </h4>
                    <p className="text-sm text-[#4B5563]">{cert?.issuer}</p>
                    {cert.issued_date && (
                      <p className="text-sm text-[#6B7280]">
                        {cert?.issued_date}
                      </p>
                    )}
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-gray-500">
                No certifications available
              </p>
            )}
          </div>
        </div>
      )}
      {detailedCandidate?.candidate?.recommendations?.length > 0 && (
        <div>
          <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-[#4B5563]" />
            Recommendations
          </h3>
          <div className="space-y-2">
            {detailedCandidate?.candidate?.recommendations.map((rec, index) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const SkillsTab = () => {
    // vetted skills
    const vettedSkills = [
      ...(detailedCandidate?.candidate?.ai_interview_report?.technicalSkills
        ?.strongSkills || []),
      ...(detailedCandidate?.candidate?.ai_interview_report?.technicalSkills
        ?.weakSkills || []),
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
      <div className="bg-blue-50 p-4 rounded-lg shadow-sm space-y-4">
        {detailedCandidate?.candidate?.ai_interview_report?.technicalSkills && (
          // {/* Vetted Skills Subsection */}
          <div>
            <h4 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
              <Star className="w-4 h-4 mr-2" />
              <span className="mr-2">Vetted Skills</span>
              <div className="relative group mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="text-gray-700"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-circle-alert-icon lucide-circle-alert text-gray-700 items-center"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <div className="absolute hidden group-hover:block bg-blue-500 text-white text-xs rounded-md px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 w-max max-w-xs z-10">
                  Vetted skills: Abilities verified through assessments or
                  reviews to ensure proficiency.
                </div>
              </div>
            </h4>
            <div className="flex flex-wrap gap-3 mt-2">
              {vettedSkills.map((skill, index) => (
                <div
                  key={index}
                  className="relative group bg-white rounded-md p-2 flex items-center justify-center space-x-2"
                >
                  <span className="text-xs text-blue-500">{skill.skill}</span>
                  <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />
                  <span className="text-xs text-[#4B5563]">{skill.rating}</span>
                  {skill.reason && (
                    <div className="absolute z-1000 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-white text-gray-600 text-xs rounded-md py-2 px-3 w-64 text-center">
                      {skill.reason}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-600"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
        )}
        {/* Resume Skills Subsection */}
        <div>
          <h3 className="text-sm lg:text-base font-semibold text-[#4B5563] mb-2 flex items-center">
            <IdCard className="w-4 h-4 mr-2" />
            Resume
          </h3>
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

  // Define the type for a reference object
  interface Reference {
    initials: string;
    name: string;
    position: string;
    status: string;
    email: string;
    phone: string;
    linkedin: string;
    description: string;
  }

  interface ReferenceCardProps {
    reference: Reference;
    key?: number; // Optional, as key is passed by React's map
  }

  const ReferencesTab = () => {
    const [references, setReferences] = useState<Reference[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (candidate?.id) {
        setLoading(true);
        candidateService
          .getBackgroundVerifications(candidate.id)
          .then((data) => {
            const mappedReferences = data.map((item) => ({
              initials: getInitials(item.hr_name || ""),
              name: item.hr_name || "Unknown",
              position:
                item.hr_title && item.experience?.company
                  ? `${item.hr_title} at ${item.experience.company}`
                  : "Position not available",
              status: item.is_data_correct ? "positive" : "negative",
              email: item.hr_email || "N/A",
              phone: item.hr_phone_number || "N/A",
              linkedin: item.hr_linkedin_url || "N/A",
              description: item.comments || "No comments provided",
            }));
            setReferences(mappedReferences);
            setLoading(false);
          })
          .catch((err) => {
            setError("Failed to load references");
            setLoading(false);
          });
      }
    }, [candidate?.id]);

    if (loading) {
      return (
        <div className="text-center text-gray-500 mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-base font-medium">Loading references...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-gray-500 mt-6">
          <p className="text-base font-medium">{error}</p>
        </div>
      );
    }

    return (
      <div className="bg-[#F0F0F0] p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <UsersRound className="w-5 h-5 text-[#4B5563] mr-2" />
          <h3 className="text-[17px] text-[#4B5563] font-medium">
            Available References
          </h3>
        </div>
        <div>
          {references.length > 0 ? (
            references.map((reference, index) => (
              <ReferenceCard key={index} reference={reference} />
            ))
          ) : (
            <p className="text-gray-500 pl-7">No references available</p>
          )}
        </div>
      </div>
    );
  };

  const ReferenceCard: React.FC<ReferenceCardProps> = ({ reference }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showPopup, setShowPopup] = useState<
      "email" | "phone" | "linkedin" | null
    >(null);

    const truncateLength = 100;
    const truncatedDescription =
      reference.description.length > truncateLength
        ? reference.description.substring(0, truncateLength) + "..."
        : reference.description;

    const handleMouseEnter = (type: "email" | "phone" | "linkedin") => {
      setShowPopup(type);
    };

    const handleMouseLeave = () => {
      setShowPopup(null);
    };

    return (
      <div className="border-b border-gray-400 mb-4 pb-4">
        <div>
          <div className="flex justify-between items-center w-full mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#4B5563] bg-[#DFFBE2]">
                {reference.initials}
              </div>
              <div>
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
                className="w-6 h-6 bg-[#4B5563] rounded-full flex items-center justify-center cursor-pointer relative hover:bg-blue-500 hover:text-white"
                onMouseEnter={() => handleMouseEnter("email")}
                onMouseLeave={handleMouseLeave}
              >
                <Mail className="w-3 h-3 text-white" />
                {showPopup === "email" && reference.email !== "N/A" && (
                  <div
                    className="absolute bottom-8 left-0 bg-blue-50 p-2 rounded-md shadow-md z-10"
                    onMouseEnter={() => setShowPopup("email")}
                    onMouseLeave={handleMouseLeave}
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
                className="w-6 h-6 bg-[#4B5563] rounded-full flex items-center justify-center cursor-pointer relative hover:bg-blue-500 hover:text-white"
                onMouseEnter={() => handleMouseEnter("phone")}
                onMouseLeave={handleMouseLeave}
              >
                <PhoneIcon className="w-3 h-3 text-white" />
                {showPopup === "phone" && reference.phone !== "N/A" && (
                  <div
                    className="absolute bottom-8 left-0 bg-blue-50 p-2 rounded-md shadow-md z-10"
                    onMouseEnter={() => setShowPopup("phone")}
                    onMouseLeave={handleMouseLeave}
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
                className="w-6 h-6 bg-[#4B5563] rounded-full flex items-center justify-center cursor-pointer relative hover:bg-blue-500 hover:text-white"
                onMouseEnter={() => handleMouseEnter("linkedin")}
                onMouseLeave={handleMouseLeave}
              >
                <Linkedin className="w-3 h-3 text-white" />
                {showPopup === "linkedin" && reference.linkedin !== "N/A" && (
                  <div
                    className="absolute bottom-8 left-0 bg-blue-50 p-2 rounded-md shadow-md z-10"
                    onMouseEnter={() => setShowPopup("linkedin")}
                    onMouseLeave={handleMouseLeave}
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
              <div className="text-gray-500 pl-10">
                No team notes available. You can add a new note below.
              </div>
            ) : (
              <div className="text-gray-500 pl-10">
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
      className={`bg-white rounded-xl p-3 lg:p-3 ${
        showConfirm ? "space-y-0" : "space-y-6"
      } min-h-[81vh] relative`}
    >
      <div className="flex space-x-3 items-center mt-1">
        <div
          className={`w-12 h-12 ${getAvatarColor(
            detailedCandidate?.candidate?.full_name
          )} rounded-full flex items-center justify-center text-white`}
        >
          {detailedCandidate?.candidate?.profile_picture_url ? (
            <img
              src={detailedCandidate?.candidate?.profile_picture_url}
              alt={detailedCandidate?.candidate?.full_name}
              className="w-full h-full rounded-full"
            />
          ) : (
            detailedCandidate?.candidate?.full_name?.slice(0, 2).toUpperCase()
          )}
        </div>
        <div>
          <h2 className="text-base lg:text-[16px] font-bold text-gray-900">
            {detailedCandidate?.candidate?.full_name}
          </h2>
          <div className="relative group">
            <p className="text-sm text-gray-500 max-w-[32ch] truncate">
              {detailedCandidate?.candidate?.headline}
            </p>
            {detailedCandidate.candidate?.headline && (
              <div className="absolute hidden group-hover:block bg-blue-500 text-white text-xs font-[400] rounded-md px-2 py-0.5 -bottom-10 -left-2 w-max max-w-xs z-10">
                {detailedCandidate.candidate?.headline}
              </div>
            )}
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
            <span className="text-sm text-gray-700">{displayPhone}</span>
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
            {booleanData ? (
              tab.name
            ) : tab.name === "Boolean-Search" ? (
              <div className="hidden"></div>
            ) : (
              tab.name
            )}
            {tab.name === "Notes" && (
              <span className="ml-1">
                ({detailedCandidate?.candidate?.notes?.length || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "Boolean-Search" && <BooleanSearchTab />}
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
              <span className="font-semibold">1 credits</span>. Do you want to
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
