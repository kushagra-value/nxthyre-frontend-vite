import React, { useState, useEffect } from "react";
import {
  Copy,
  Mail,
  ArrowLeft,
  User,
  Building2,
  GraduationCap,
  Award,
  Star,
  Phone,
  MapPin,
  Briefcase,
  CalendarSearch,
  ChevronLeft,
  Sparkle,
} from "lucide-react";
import { showToast } from "../../utils/toast";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  candidateService,
  // ShareableProfileSensitiveCandidate,
  ShareableProfileCandidate,
  ReferenceData,
  // CandidateListItem,
} from "../../services/candidateService";

interface ShareableProfileProps {
  candidateId?: string;
  jobId?: string;
  shareOption?: "anonymous_profile" | "full_profile";
  onBack?: () => void;
}

const ShareableProfile: React.FC<ShareableProfileProps> = ({
  candidateId: propCandidateId,
  jobId: propJobId,
  shareOption: propShareOption,
  onBack: propOnBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [references, setReferences] = useState<ReferenceData[]>([]);
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [referencesError, setReferencesError] = useState<string | null>(null);
  // const navigate = useNavigate();
  const [candidateData, setCandidateData] =
    useState<ShareableProfileCandidate | null>(null);

  const { candidateId: paramCandidateId } = useParams<{
    candidateId: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Prioritize URL params over props (for routed usage)
  const candidateId = paramCandidateId || propCandidateId || "";
  const jobId = searchParams.get("job_id") || propJobId || "";

  // Inside component
  const location = useLocation();
  const { shareOption, resumeUrl } = (location.state || {}) as {
    shareOption?: "anonymous_profile" | "full_profile";
    resumeUrl?: string;
  };

  // Default to anonymous if not provided
  const effectiveShareOption = shareOption || "full_profile";
  const effectiveResumeUrl = resumeUrl || "";

  useEffect(() => {
    const fetchShareableProfile = async () => {
      setLoading(true);
      try {
        const data = await candidateService.getShareableProfile(
          candidateId,
          jobId,
        );
        setCandidateData(data);

        console.log("Candidate Data:", data);
      } catch (err) {
        setError("Failed to load candidate profile");
      } finally {
        setLoading(false);
      }
    };

    const fetchReferences = async () => {
      setReferencesLoading(true);
      try {
        const data = await candidateService.getCandidateReferences(candidateId);
        setReferences(data);
      } catch (err) {
        setReferencesError("Failed to load candidate references");
      } finally {
        setReferencesLoading(false);
      }
    };
    fetchShareableProfile();
    fetchReferences();
  }, [candidateId, jobId]);

  // For back navigation (if needed), use history back instead of onBack
  const handleBack = () => {
    if (propOnBack) {
      propOnBack(); // For modal compatibility if you keep both modes
    } else {
      navigate(-1); // Go back in history for routed mode
    }
  };

  const candidateProfileUrl = `https://app.nxthyre.com/candidate-profiles/${candidateId}/?job_id=${jobId}`;

  const handleCopyId = () => {
    showToast.success("Candidate ID copied to clipboard");
    navigator.clipboard.writeText(candidateProfileUrl);
  };

  const handleGoToDashboard = () => {
    navigate("/");
  };

  const [isExpanded, setIsExpanded] = useState(false);

  let data = candidateData?.job_score?.quick_fit_summary || [];

  // Sort data: CRITICAL first, then IMPORTANT, then others (LEADERSHIP, EXPERIENCE)
  const priorityOrder = {
    CRITICAL: 0,
    IMPORTANT: 1,
    LEADERSHIP: 2,
    EXPERIENCE: 3,
  };
  data = data.sort((a, b) => {
    const orderA =
      priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99;
    const orderB =
      priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99;
    return orderA - orderB;
  });

  const keySkills = data.slice(0, 5);
  const moreSkills = data.slice(5);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const getColorClass = (color: string) => {
    switch (color) {
      case "green":
        return "text-green-600";
      case "yellow":
        return "text-yellow-500 font-medium";
      case "red":
        return "text-red-600 font-medium";
      default:
        return "text-gray-600";
    }
  };

  const getIcon = (color: string) => {
    switch (color) {
      case "green":
        return (
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.5 15C11.5376 15 14 12.5376 14 9.5C14 6.46243 11.5376 4 8.5 4C5.46243 4 3 6.46243 3 9.5C3 12.5376 5.46243 15 8.5 15Z"
              stroke="#009951"
            />
            <path
              d="M6.57227 9.775L7.67227 10.875L10.4223 8.125"
              stroke="#009951"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        );
      case "yellow":
        return (
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.5 4.84615C5.92975 4.84615 3.84615 6.92975 3.84615 9.5C3.84615 12.0703 5.92975 14.1538 8.5 14.1538C11.0703 14.1538 13.1538 12.0703 13.1538 9.5C13.1538 6.92975 11.0703 4.84615 8.5 4.84615ZM3 9.5C3 6.46243 5.46243 4 8.5 4C11.5375 4 14 6.46243 14 9.5C14 12.5375 11.5375 15 8.5 15C5.46243 15 3 12.5375 3 9.5Z"
              fill="#CD9B05"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.5 7C8.77613 7 9 7.18315 9 7.40909V9.59088C9 9.81684 8.77613 10 8.5 10C8.22387 10 8 9.81684 8 9.59088V7.40909C8 7.18315 8.22387 7 8.5 7Z"
              fill="#CD9B05"
            />
            <path
              d="M9 11.5C9 11.7761 8.77613 12 8.5 12C8.22387 12 8 11.7761 8 11.5C8 11.2239 8.22387 11 8.5 11C8.77613 11 9 11.2239 9 11.5Z"
              fill="#CD9B05"
            />
          </svg>
        );
      case "red":
        return (
          <svg
            width="17"
            height="17"
            viewBox="0 0 17 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4090_2502)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.5 14.3125C5.84212 14.3125 3.6875 12.1572 3.6875 9.5C3.6875 6.84281 5.84212 4.6875 8.5 4.6875C11.1579 4.6875 13.3125 6.84281 13.3125 9.5C13.3125 12.1572 11.1579 14.3125 8.5 14.3125ZM8.5 4C5.46228 4 3 6.46125 3 9.5C3 12.5387 5.46228 15 8.5 15C11.5377 15 14 12.5387 14 9.5C14 6.46125 11.5377 4 8.5 4ZM10.4652 7.53376C10.3298 7.3997 10.1108 7.3997 9.97537 7.53376L8.49794 9.01186L7.04181 7.55436C6.9074 7.4203 6.68947 7.4203 6.55575 7.55436C6.42134 7.68843 6.42134 7.90844 6.55575 8.0425L8.01188 9.49656L6.54545 10.9644C6.41035 11.0984 6.41035 11.3184 6.54545 11.4559C6.68088 11.59 6.90018 11.59 7.03562 11.4559L8.50206 9.98814L9.95819 11.4456C10.0926 11.5797 10.3105 11.5797 10.4446 11.4456C10.579 11.3116 10.579 11.0916 10.4446 10.9575L8.98812 9.50344L10.4652 8.0253C10.6003 7.8878 10.6003 7.67126 10.4652 7.53376Z"
                fill="#CF272D"
              />
            </g>
            <defs>
              <clipPath id="clip0_4090_2502">
                <rect
                  width="11"
                  height="11"
                  fill="white"
                  transform="translate(3 4)"
                />
              </clipPath>
            </defs>
          </svg>
        );
      default:
        return null; // or a default icon if needed
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-base font-medium">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Candidate Not Found
          </h2>
          <p className="text-gray-600">
            {error || "The requested candidate profile could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-6xl bg-gray-50 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full flex justify-between items-center space-x-4 h-16">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-500"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_4689_3183)">
                  <path
                    d="M12.94 4.6673C12.9405 4.75504 12.9237 4.84201 12.8905 4.92324C12.8573 5.00446 12.8085 5.07834 12.7467 5.14063L5.88667 12.0006L12.7467 18.8606C12.8559 18.9882 12.913 19.1522 12.9065 19.32C12.9 19.4878 12.8304 19.6469 12.7117 19.7657C12.593 19.8844 12.4338 19.954 12.266 19.9604C12.0983 19.9669 11.9342 19.9099 11.8067 19.8006L4 12.0006L11.8067 4.19397C11.9003 4.10223 12.0188 4.04011 12.1475 4.01537C12.2762 3.99064 12.4093 4.00438 12.5303 4.05489C12.6512 4.10539 12.7546 4.19042 12.8274 4.29934C12.9003 4.40827 12.9395 4.53625 12.94 4.6673Z"
                    fill="#4B5563"
                  />
                  <path
                    d="M20.274 4.6673C20.2745 4.75504 20.2577 4.84201 20.2245 4.92324C20.1913 5.00446 20.1424 5.07834 20.0807 5.14063L13.2207 12.0006L20.0807 18.8606C20.1899 18.9882 20.2469 19.1522 20.2405 19.32C20.234 19.4878 20.1644 19.6469 20.0457 19.7657C19.927 19.8844 19.7678 19.954 19.6 19.9604C19.4322 19.9669 19.2682 19.9099 19.1406 19.8006L11.334 12.0006L19.1406 4.19397C19.2342 4.10223 19.3528 4.04011 19.4815 4.01537C19.6102 3.99064 19.7433 4.00438 19.8642 4.05489C19.9852 4.10539 20.0885 4.19042 20.1614 4.29934C20.2343 4.40827 20.2734 4.53625 20.274 4.6673Z"
                    fill="#4B5563"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4689_3183">
                    <rect
                      width="24"
                      height="24"
                      fill="white"
                      transform="matrix(0 -1 1 0 0 24)"
                    />
                  </clipPath>
                </defs>
              </svg>

              <span className="font-[400]">
                {effectiveShareOption === "full_profile"
                  ? "Full Profile View"
                  : "Anonymous Profile View"}
              </span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCopyId}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="Copy ID"
            >
              <Copy className="w-4 h-4 text-gray-500" />
              <span className="font-medium">
                {effectiveShareOption === "full_profile"
                  ? "Copy Full Profile View"
                  : "Copy Anonymous Profile View"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl bg-gray-50 mx-auto sm:px-6 lg:px-8 px-8 pb-8 pt-1">
        <div className="p-2">
          <div className="bg-white p-8 rounded-xl">
            {/* Profile Header */}
            <div className="flex gap-8">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <img
                  src={
                    candidateData?.profile_picture_url ||
                    // "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200"
                    "/profile_dp.jpg"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-gray-600 mb-3">
                    {candidateData?.full_name || "N/A"}
                    {/* {candidateData?.job_score?.candidate_match_score?.score && (
                      <span className="bg-green-50 text-green-500 text-lg ml-3 py-2 px-2.5 font-[400] rounded-lg border border-green-500">
                        {candidateData?.job_score?.candidate_match_score?.score}
                      </span>
                    )} */}
                  </h2>
                  <h4 className="text-lg font-[400] text-gray-500 mb-3">
                    {candidateData?.headline}
                  </h4>
                  <h4 className="text-lg font-[400] text-gray-400 mb-3">
                    {candidateData?.location}
                  </h4>
                  <div className="flex gap-12 items-center">
                    <div className="flex gap-2 items-center">
                      {/* <div className="text-sm text-gray-500">Experience</div> */}
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <div className="font-[400] text-gray-500">
                        {candidateData?.total_experience || "N/A"}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {/* <div className="text-sm text-gray-500">Notice Period</div> */}
                      <CalendarSearch className="w-4 h-4 text-gray-500" />
                      <div className="font-[400] text-gray-500">
                        {candidateData?.notice_period_days || "N/A"}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {/* <div className="text-sm text-gray-500">Current Salary</div> */}
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 17 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M8.0235 8.63168e-07H8.1015C8.77538 -2.16368e-05 9.33728 -3.66122e-05 9.78337 0.0599334C10.2542 0.123241 10.6793 0.262493 11.0209 0.604096C11.3625 0.945698 11.5018 1.3708 11.5651 1.84164C11.6094 2.17134 11.6209 2.56432 11.624 3.019C12.1103 3.03461 12.5439 3.06305 12.9293 3.11486C13.8085 3.23307 14.5203 3.48216 15.0816 4.04343C15.6428 4.60471 15.8919 5.31642 16.0102 6.19574C16.125 7.05015 16.125 8.14185 16.125 9.5202V9.6048C16.125 10.9832 16.125 12.0749 16.0102 12.9293C15.8919 13.8086 15.6428 14.5203 15.0816 15.0816C14.5203 15.6428 13.8085 15.8919 12.9293 16.0102C12.0749 16.125 10.9832 16.125 9.6048 16.125H6.52019C5.14187 16.125 4.05014 16.125 3.19574 16.0102C2.31642 15.8919 1.60471 15.6428 1.04343 15.0816C0.48216 14.5203 0.23307 13.8086 0.114855 12.9293C-2.22065e-05 12.0749 -1.46601e-05 10.9832 3.39902e-07 9.6048V9.5202C-1.46601e-05 8.14185 -2.22065e-05 7.05015 0.114855 6.19574C0.23307 5.31642 0.48216 4.60471 1.04343 4.04343C1.60471 3.48216 2.31642 3.23307 3.19574 3.11486C3.58106 3.06305 4.01466 3.03461 4.50105 3.019C4.50405 2.56432 4.51561 2.17134 4.55993 1.84164C4.62324 1.3708 4.76249 0.945698 5.1041 0.604096C5.4457 0.262493 5.8708 0.123241 6.34164 0.0599334C6.78772 -3.66122e-05 7.34963 -2.16368e-05 8.0235 8.63168e-07ZM5.62635 3.00134C5.90995 2.99999 6.2077 3 6.52018 3H9.6048C9.91733 3 10.2151 2.99999 10.4987 3.00134C10.4955 2.5736 10.485 2.25094 10.4501 1.99154C10.4036 1.64545 10.3231 1.49733 10.2254 1.39959C10.1277 1.30185 9.97958 1.22144 9.63345 1.17491C9.2712 1.1262 8.7855 1.125 8.0625 1.125C7.3395 1.125 6.8538 1.1262 6.49154 1.17491C6.14545 1.22144 5.99732 1.30185 5.89959 1.39959C5.80185 1.49733 5.72144 1.64545 5.67491 1.99154C5.64003 2.25094 5.62951 2.5736 5.62635 3.00134ZM3.34564 4.22982C2.59107 4.33127 2.15633 4.52153 1.83893 4.83893C1.52152 5.15633 1.33127 5.59107 1.22982 6.34564C1.12619 7.11638 1.125 8.1324 1.125 9.5625C1.125 10.9926 1.12619 12.0086 1.22982 12.7794C1.33127 13.5339 1.52152 13.9687 1.83893 14.2861C2.15633 14.6035 2.59107 14.7938 3.34564 14.8952C4.11638 14.9988 5.13238 15 6.5625 15H9.5625C10.9926 15 12.0086 14.9988 12.7794 14.8952C13.5339 14.7938 13.9687 14.6035 14.2861 14.2861C14.6035 13.9687 14.7938 13.5339 14.8952 12.7794C14.9988 12.0086 15 10.9926 15 9.5625C15 8.1324 14.9988 7.11638 14.8952 6.34564C14.7938 5.59107 14.6035 5.15633 14.2861 4.83893C13.9687 4.52153 13.5339 4.33127 12.7794 4.22982C12.0086 4.1262 10.9926 4.125 9.5625 4.125H6.5625C5.13238 4.125 4.11638 4.1262 3.34564 4.22982ZM8.0625 6C8.37315 6 8.625 6.25184 8.625 6.5625V6.57015C9.4416 6.77588 10.125 7.41975 10.125 8.31248C10.125 8.62313 9.87315 8.87498 9.5625 8.87498C9.25185 8.87498 9 8.62313 9 8.31248C9 8.02448 8.68065 7.62503 8.0625 7.62503C7.44435 7.62503 7.125 8.02448 7.125 8.31248C7.125 8.60055 7.44435 9 8.0625 9C9.10118 9 10.125 9.71985 10.125 10.8125C10.125 11.7053 9.4416 12.3491 8.625 12.5549V12.5625C8.625 12.8732 8.37315 13.125 8.0625 13.125C7.75185 13.125 7.5 12.8732 7.5 12.5625V12.5549C6.6834 12.3491 6 11.7053 6 10.8125C6 10.5019 6.25184 10.25 6.5625 10.25C6.87315 10.25 7.125 10.5019 7.125 10.8125C7.125 11.1005 7.44435 11.5 8.0625 11.5C8.68065 11.5 9 11.1005 9 10.8125C9 10.5245 8.68065 10.125 8.0625 10.125C7.02383 10.125 6 9.40523 6 8.31248C6 7.41975 6.6834 6.77588 7.5 6.57015V6.5625C7.5 6.25184 7.75185 6 8.0625 6Z"
                          fill="#4B5563"
                        />
                      </svg>
                      <div className="font-[400] text-gray-500">
                        {candidateData?.current_salary || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex">
                <div className="">
                  <div className="flex flex-col items-end justify-start text-gray-500 gap-3">
                    <div className="flex items-center justify-left gap-2">
                      {effectiveShareOption === "full_profile" ? (
                        <span>
                          {candidateData?.premium_data?.email || "N/A"}
                        </span>
                      ) : (
                        <span>a************@gmail.com</span>
                      )}
                      <Mail className="w-4 h-4 mr-1" />
                    </div>
                    <div className="flex items-center justify-left gap-2">
                      {effectiveShareOption === "full_profile" ? (
                        <span>
                          {candidateData?.premium_data?.phone || "N/A"}
                        </span>
                      ) : (
                        <span>+91 98******57</span>
                      )}
                      <Phone className="w-4 h-4 mr-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Match Description or Profile Summary */}
          <div className="bg-white p-8 rounded-xl mt-6">
            {effectiveShareOption === "anonymous_profile" ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-3">
                  Profile Summary
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {candidateData?.profile_summary || "N/A"}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-3">
                  Profile Match Description
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {candidateData?.job_score?.candidate_match_score
                    ?.description || "N/A"}
                </p>
              </div>
            )}
          </div>

          {effectiveShareOption === "full_profile" && (
            <div className="bg-white p-8 rounded-xl mt-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-3">
                  Quick Fit Summary
                </h3>
                <div className="">
                  {/* Key Skills - Always visible */}
                  <div className="mb-4">
                    {/* <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Key Skills (Top 5)
                    </h4> */}
                    <div className="flex flex-wrap gap-2">
                      {keySkills.map((item, index) => (
                        <div
                          key={index}
                          className={`${getColorClass(item.color)} p-4 border border-gray-200 rounded-lg gap-2 w-full flex flex-col`}
                        >
                          <div
                            className={`flex gap-2 items-center font-semibold ${getColorClass(item.color)}`}
                          >
                            {item.priority === "CRITICAL" ? (
                              <Sparkle
                                className={`w-4 h-4 ${getColorClass(item.color)}`}
                              />
                            ) : null}
                            {item.badge}
                            {getIcon(item.color)}
                          </div>
                          <div className="text-gray-500 pl-1">
                            {item.evidence}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* More Skills - Accordion Style */}
                  {moreSkills.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        onClick={toggleExpanded}
                        className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-600 hover:text-gray-900 mb-2"
                      >
                        <span>
                          {isExpanded
                            ? "Show Less Skills"
                            : `Show More Skills (${moreSkills.length})`}
                        </span>
                        <span
                          className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        >
                          ▼
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="flex flex-wrap gap-2 animate-fade-in">
                          {moreSkills.map((item, index) => (
                            <div
                              key={index}
                              className={`${getColorClass(item.color)} p-4 border border-gray-200 rounded-lg gap-2 w-full flex flex-col`}
                            >
                              <div
                                className={`flex gap-2 items-center font-semibold ${getColorClass(item.color)}`}
                              >
                                {item.priority === "CRITICAL" ? (
                                  <Sparkle
                                    className={`w-4 h-4 ${getColorClass(item.color)}`}
                                  />
                                ) : null}
                                {item.badge}
                                {getIcon(item.color)}
                              </div>
                              <div className="text-gray-500 pl-1">
                                {item.evidence}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {effectiveResumeUrl && (
            <div className="bg-white p-8 rounded-xl mt-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-3">
                Resume
              </h3>

              <embed
                src={effectiveResumeUrl}
                type="application/pdf"
                width="100%"
                height="900px"
                className="border border-gray-200 rounded-lg min-h-[800px]"
              />

              <p className="mt-2 text-sm text-gray-500">
                If the resume doesn't display,{" "}
                <a
                  href={effectiveResumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  open it in a new tab
                </a>
                .
              </p>
            </div>
          )}

          {/* Community Notes Section
          <div className="bg-white p-8 rounded-xl mt-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-3">Notes</h3>
            <div className="space-y-4">
              {candidateData?.notes?.map((note: any, index: any) => (
                <div key={index}>
                  <div className="flex flex-col items-left justify-between mb-2">
                    <div className="font-medium text-gray-500">
                      {note.organization_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(note.posted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{note.content}</p>
                </div>
              ))}
            </div>
          </div> */}

          {/* References Section */}
          <div className="bg-white p-8 rounded-xl mt-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-3">
              References
            </h3>
            <div className="space-y-3">
              {referencesLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Loading references...</p>
                </div>
              ) : referencesError ? (
                <p className="text-sm text-red-600">{referencesError}</p>
              ) : references.length === 0 ? (
                <p className="text-sm text-gray-600">No references available</p>
              ) : (
                <div className="space-y-3">
                  {references.map((ref, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-600">
                          {ref.hr_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ref.hr_title} at *************
                        </div>
                      </div>
                      {ref.is_data_correct ? (
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 30 30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="15" cy="15" r="15" fill="#16A34A" />
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M14.2301 10.2078C14.0801 10.9678 13.8279 12.1078 12.9053 13.0303C12.8212 13.1145 12.7291 13.2033 12.6316 13.2974C11.7752 14.1234 10.5 15.3533 10.5 17.375C10.5 18.4726 10.9722 19.512 11.7007 20.2811C12.4338 21.0548 13.372 21.5 14.25 21.5H18C18.2638 21.5 18.4846 21.4318 18.6152 21.3447C18.7236 21.2725 18.75 21.2091 18.75 21.125C18.75 21.0409 18.7236 20.9775 18.6152 20.9053C18.4846 20.8182 18.2638 20.75 18 20.75H17.25C16.8358 20.75 16.5 20.4142 16.5 20C16.5 19.5858 16.8358 19.25 17.25 19.25H18H18.375C18.6388 19.25 18.8596 19.1818 18.9902 19.0947C19.0986 19.0225 19.125 18.9591 19.125 18.875C19.125 18.7909 19.0986 18.7275 18.9902 18.6553C18.8596 18.5682 18.6388 18.5 18.375 18.5H17.625C17.2108 18.5 16.875 18.1642 16.875 17.75C16.875 17.3358 17.2108 17 17.625 17H18.375H18.75C19.0138 17 19.2346 16.9318 19.3652 16.8447C19.4736 16.7725 19.5 16.7091 19.5 16.625C19.5 16.5409 19.4736 16.4775 19.3652 16.4053C19.2346 16.3182 19.0138 16.25 18.75 16.25H18C17.5858 16.25 17.25 15.9142 17.25 15.5C17.25 15.0858 17.5858 14.75 18 14.75H18.75C19.0138 14.75 19.2346 14.6818 19.3652 14.5947C19.4736 14.5224 19.5 14.4591 19.5 14.375C19.5 14.2909 19.4736 14.2276 19.3652 14.1553C19.2346 14.0682 19.0138 14 18.75 14H15.375C15.1329 14 14.9057 13.8832 14.7649 13.6863C14.6242 13.4895 14.587 13.237 14.6651 13.0081L14.6675 13.0009L14.6776 12.97C14.6867 12.9417 14.7003 12.8984 14.717 12.8423C14.7505 12.7299 14.7962 12.5673 14.8433 12.3717C14.9385 11.9751 15.0336 11.4658 15.0521 10.9719C15.0713 10.4588 15.0032 10.0653 14.866 9.82494C14.7848 9.68273 14.6624 9.5538 14.3778 9.51319C14.3421 9.63652 14.3092 9.80429 14.2611 10.0502C14.2515 10.0995 14.2412 10.1519 14.2301 10.2078ZM16.3526 12.5C16.4439 12.0815 16.531 11.5603 16.551 11.0281C16.5739 10.4162 16.5132 9.6847 16.1687 9.08131C15.7854 8.40976 15.1099 8 14.175 8C13.8889 8 13.6204 8.0947 13.4027 8.28511C13.2049 8.45809 13.0925 8.67234 13.023 8.84466C12.9121 9.12004 12.8435 9.47684 12.7856 9.77796C12.7764 9.82597 12.7674 9.87256 12.7586 9.91718C12.6124 10.6572 12.4221 11.3922 11.8447 11.9697C11.7785 12.0358 11.6981 12.112 11.6069 12.1985C10.7648 12.9969 9 14.6699 9 17.375C9 18.9025 9.65282 20.3005 10.6118 21.3127C11.5662 22.3202 12.878 23 14.25 23H18C18.4862 23 19.0154 22.8807 19.4473 22.5928C19.9014 22.29 20.25 21.7909 20.25 21.125C20.25 20.7735 20.1529 20.4684 19.9943 20.2141C20.3615 19.9068 20.625 19.4539 20.625 18.875C20.625 18.5235 20.5279 18.2184 20.3693 17.9641C20.7365 17.6568 21 17.2039 21 16.625C21 16.1684 20.8361 15.7902 20.5867 15.5C20.8361 15.2098 21 14.8316 21 14.375C21 13.7091 20.6514 13.2099 20.1973 12.9072C19.7654 12.6193 19.2362 12.5 18.75 12.5H16.3526Z"
                            fill="white"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 30 30"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="15"
                            cy="15"
                            r="15"
                            transform="matrix(1 0 0 -1 0 30)"
                            fill="#ED051C"
                          />
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M14.2301 19.7922C14.08 19.0322 13.8279 17.8922 12.9053 16.9697C12.8212 16.8855 12.7291 16.7967 12.6316 16.7026C11.7752 15.8766 10.5 14.6467 10.5 12.625C10.5 11.5274 10.9722 10.488 11.7007 9.7189C12.4338 8.9452 13.372 8.5 14.25 8.5H18C18.2638 8.5 18.4846 8.56818 18.6152 8.65532C18.7236 8.72755 18.75 8.79093 18.75 8.875C18.75 8.95907 18.7236 9.02245 18.6152 9.09468C18.4846 9.18182 18.2638 9.25 18 9.25H17.25C16.8358 9.25 16.5 9.58578 16.5 10C16.5 10.4142 16.8358 10.75 17.25 10.75H18H18.375C18.6388 10.75 18.8596 10.8182 18.9902 10.9053C19.0986 10.9775 19.125 11.0409 19.125 11.125C19.125 11.2091 19.0986 11.2725 18.9902 11.3447C18.8596 11.4318 18.6388 11.5 18.375 11.5H17.625C17.2108 11.5 16.875 11.8358 16.875 12.25C16.875 12.6642 17.2108 13 17.625 13H18.375H18.75C19.0138 13 19.2346 13.0682 19.3652 13.1553C19.4736 13.2275 19.5 13.2909 19.5 13.375C19.5 13.4591 19.4736 13.5225 19.3652 13.5947C19.2346 13.6818 19.0138 13.75 18.75 13.75H18C17.5858 13.75 17.25 14.0858 17.25 14.5C17.25 14.9142 17.5858 15.25 18 15.25H18.75C19.0138 15.25 19.2346 15.3182 19.3652 15.4053C19.4736 15.4776 19.5 15.5409 19.5 15.625C19.5 15.7091 19.4736 15.7724 19.3652 15.8447C19.2346 15.9318 19.0138 16 18.75 16H15.375C15.1329 16 14.9057 16.1168 14.7649 16.3137C14.6242 16.5105 14.587 16.763 14.6651 16.9919L14.6653 16.9927L14.6675 16.9991L14.6776 17.03C14.6866 17.0583 14.7003 17.1016 14.717 17.1577C14.7505 17.2701 14.7962 17.4327 14.8433 17.6283C14.9385 18.0249 15.0336 18.5342 15.0521 19.0281C15.0713 19.5412 15.0032 19.9347 14.866 20.1751C14.7848 20.3173 14.6623 20.4462 14.3778 20.4868C14.3421 20.3635 14.3092 20.1957 14.2611 19.9498C14.2515 19.9005 14.2412 19.8481 14.2301 19.7922ZM16.3526 17.5C16.4439 17.9185 16.531 18.4397 16.551 18.9719C16.5739 19.5838 16.5132 20.3153 16.1687 20.9187C15.7854 21.5902 15.1099 22 14.175 22C13.8889 22 13.6204 21.9053 13.4027 21.7149C13.2049 21.5419 13.0925 21.3277 13.023 21.1553C12.9121 20.88 12.8435 20.5232 12.7856 20.222C12.7764 20.174 12.7674 20.1274 12.7586 20.0828C12.6124 19.3428 12.4221 18.6078 11.8447 18.0303C11.7785 17.9642 11.6981 17.888 11.6069 17.8015C10.7648 17.0031 9 15.3301 9 12.625C9 11.0975 9.65282 9.69955 10.6118 8.68735C11.5662 7.6798 12.878 7 14.25 7H18C18.4862 7 19.0154 7.11932 19.4473 7.40718C19.9014 7.70995 20.25 8.20907 20.25 8.875C20.25 9.22653 20.1529 9.53163 19.9943 9.78588C20.3615 10.0932 20.625 10.5461 20.625 11.125C20.625 11.4765 20.5279 11.7816 20.3693 12.0359C20.7365 12.3432 21 12.7961 21 13.375C21 13.8316 20.8361 14.2098 20.5867 14.5C20.8361 14.7902 21 15.1684 21 15.625C21 16.2909 20.6514 16.7901 20.1973 17.0928C19.7654 17.3807 19.2362 17.5 18.75 17.5H16.3526Z"
                            fill="white"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareableProfile;
