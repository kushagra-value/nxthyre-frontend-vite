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
} from "lucide-react";
import { showToast } from "../../utils/toast";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
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
  const shareOption =
    (searchParams.get("shareOption") as
      | "anonymous_profile"
      | "full_profile"
      | undefined) ||
    propShareOption ||
    "anonymous_profile"; // Default if not provided

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
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="w-full flex justify-between items-center space-x-4 h-16">
            <div className="flex items-center">
              <svg
                width="100"
                height="22"
                viewBox="0 0 100 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-xl lg:text-2xl font-bold text-blue-600 cursor-pointer"
                onClick={handleBack}
              >
                <g clip-path="url(#clip0_1918_2679)">
                  <path
                    d="M0 17.4101V0H3.25043L12.5221 14.2182H12.7353L12.5488 0H14.92V17.4101H11.9626L2.45115 2.8753H2.21136L2.39786 17.4101H0Z"
                    fill="url(#paint0_linear_1918_2679)"
                  />
                  <path
                    d="M17.8619 17.4113L22.5243 10.6056L17.8086 3.77344H20.6593L23.9098 9.26024H24.2561L27.4533 3.77344H30.2774L25.6149 10.6056L30.384 17.4113H27.5333L24.2561 11.8981H23.9098L20.7127 17.4113H17.8619Z"
                    fill="url(#paint1_linear_1918_2679)"
                  />
                  <path
                    d="M37.8223 17.6755C36.5435 17.6755 35.5932 17.3326 34.9715 16.6468C34.3499 15.9609 34.0391 14.9146 34.0391 13.5076V5.77863H31.9609L31.9876 3.77383H33.2931C33.7371 3.77383 34.0568 3.69469 34.2522 3.53642C34.4654 3.37815 34.5897 3.11436 34.6252 2.74506L34.8916 0.6875H36.3836V3.77383H40.3534V5.805H36.3836V13.4549C36.3836 14.1583 36.5435 14.6683 36.8632 14.9849C37.2007 15.2838 37.6803 15.4333 38.3019 15.4333C38.6394 15.4333 38.9858 15.3893 39.341 15.3014C39.714 15.2135 40.0781 15.0376 40.4333 14.7738V17.1743C39.9182 17.3677 39.4386 17.4996 38.9946 17.57C38.5683 17.6404 38.1776 17.6755 37.8223 17.6755Z"
                    fill="url(#paint2_linear_1918_2679)"
                  />
                  <path
                    d="M55.277 17.4101V0H57.7282V17.4101H55.277ZM43.6074 17.4101V0H46.0586V17.4101H43.6074ZM44.833 9.54914V7.46523H56.2627V9.54914H44.833Z"
                    fill="black"
                  />
                  <path
                    d="M66.9526 22.0013C66.2243 22.0013 65.505 21.9133 64.7945 21.7375C64.1018 21.5792 63.4623 21.333 62.8762 20.9989C62.29 20.6647 61.8105 20.2338 61.4375 19.7063L62.6631 17.9653C63.0716 18.5632 63.6489 19.0204 64.3949 19.337C65.1409 19.6535 65.9579 19.8118 66.846 19.8118C67.8407 19.8118 68.6666 19.592 69.3238 19.1523C69.9987 18.7303 70.505 18.0708 70.8424 17.1739C71.1799 16.2594 71.3575 15.1252 71.3753 13.7711L71.6684 11.0277H71.1622C70.9668 12.3114 70.6559 13.3402 70.2296 14.1139C69.8211 14.8702 69.306 15.4153 68.6844 15.7494C68.0805 16.0836 67.3789 16.2506 66.5795 16.2506C65.5849 16.2506 64.7412 16.0045 64.0485 15.5121C63.3736 15.0021 62.8585 14.2634 62.5032 13.2962C62.148 12.3114 61.9704 11.1156 61.9704 9.70871V3.77344H64.3949V9.18112C64.3949 10.8869 64.6346 12.1444 65.1142 12.9533C65.6115 13.7447 66.3486 14.1403 67.3255 14.1403C67.8584 14.1403 68.338 14.0084 68.7643 13.7447C69.1905 13.4809 69.5547 13.0939 69.8567 12.5839C70.1764 12.074 70.425 11.4321 70.6027 10.6583C70.798 9.86695 70.9223 8.95248 70.9756 7.91492V3.77344H73.4001V13.903C73.4001 14.9757 73.3202 15.9429 73.1604 16.8046C73.0005 17.6664 72.7429 18.4137 72.3877 19.0468C72.0502 19.6975 71.624 20.2426 71.1088 20.6823C70.5937 21.122 69.9899 21.4473 69.2972 21.6583C68.6045 21.8869 67.8229 22.0013 66.9526 22.0013Z"
                    fill="black"
                  />
                  <path
                    d="M77.582 17.4105V3.77262H79.7668L79.5536 8.52079H80.0065C80.1664 7.48324 80.4151 6.58636 80.7525 5.83017C81.0901 5.07398 81.5341 4.48485 82.0847 4.06278C82.6528 3.64072 83.3544 3.42969 84.1897 3.42969C84.3667 3.42969 84.5716 3.44728 84.8019 3.48245C85.0331 3.50003 85.2995 3.56158 85.6019 3.6671L85.4683 6.1731C85.2019 6.06758 84.9356 5.99723 84.6692 5.96207C84.4028 5.90931 84.1454 5.88292 83.8962 5.88292C83.2036 5.88292 82.5995 6.10275 82.0847 6.5424C81.5874 6.98205 81.17 7.57997 80.8325 8.33615C80.495 9.07478 80.2197 9.91013 80.0065 10.8422V17.4105H77.582Z"
                    fill="black"
                  />
                  <path
                    d="M93.9048 17.7535C92.8212 17.7535 91.8622 17.5951 91.0269 17.2786C90.2097 16.9445 89.5171 16.4696 88.9491 15.8541C88.3802 15.2386 87.954 14.5089 87.6704 13.6647C87.3859 12.8206 87.2441 11.8709 87.2441 10.8158C87.2441 9.74301 87.3859 8.75823 87.6704 7.86134C87.954 6.96446 88.372 6.18189 88.922 5.51363C89.4728 4.84535 90.1482 4.33536 90.9474 3.98365C91.7466 3.61434 92.6614 3.42969 93.6917 3.42969C94.5974 3.42969 95.4228 3.57917 96.1695 3.87813C96.9155 4.17709 97.5458 4.64312 98.0605 5.27621C98.5933 5.89172 98.9933 6.6743 99.2597 7.62394C99.5261 8.55599 99.6327 9.65509 99.5794 10.9213L88.7622 11.0004V9.36494L98.1138 9.28582L97.2884 10.3937C97.3769 9.28582 97.2704 8.37135 96.9687 7.65031C96.6663 6.92929 96.231 6.38412 95.663 6.01483C95.1122 5.64552 94.4548 5.46087 93.6917 5.46087C92.8745 5.46087 92.1548 5.67189 91.5335 6.09396C90.9113 6.51602 90.4318 7.12274 90.095 7.9141C89.7753 8.70551 89.6146 9.66389 89.6146 10.7894C89.6146 12.4073 89.9794 13.6471 90.7073 14.5089C91.4359 15.3529 92.5187 15.775 93.9581 15.775C94.5081 15.775 94.9884 15.7135 95.3966 15.5904C95.8228 15.4496 96.1777 15.265 96.4622 15.0364C96.7638 14.7902 97.004 14.5089 97.1818 14.1923C97.3769 13.8758 97.5277 13.5328 97.6343 13.1635L99.7663 13.6647C99.6064 14.2978 99.3573 14.8693 99.0204 15.3793C98.6999 15.8717 98.2917 16.2938 97.7941 16.6456C97.3146 16.9972 96.7556 17.2698 96.1163 17.4633C95.4761 17.6567 94.7392 17.7535 93.9048 17.7535Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_1918_2679"
                    x1="0"
                    y1="11"
                    x2="99.7664"
                    y2="11"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#2E62FF" />
                    <stop offset="0.317308" stop-color="#9747FF" />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear_1918_2679"
                    x1="-9.47368e-05"
                    y1="11.0013"
                    x2="99.7663"
                    y2="11.0013"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#2E62FF" />
                    <stop offset="0.317308" stop-color="#9747FF" />
                  </linearGradient>
                  <linearGradient
                    id="paint2_linear_1918_2679"
                    x1="-0.000534999"
                    y1="11.0016"
                    x2="99.7659"
                    y2="11.0016"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#2E62FF" />
                    <stop offset="0.317308" stop-color="#9747FF" />
                  </linearGradient>
                  <clipPath id="clip0_1918_2679">
                    <rect width="100" height="22" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCopyId}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                title="Copy ID"
              >
                <Copy className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Copy Profile ID</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl bg-gray-50 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-2">
          <div className="bg-white p-8 rounded-xl">
            {/* Profile Header */}
            <div className="flex gap-8">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <img
                  src={
                    candidateData?.profile_picture_url ||
                    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-gray-600 mb-3">
                    {candidateData?.full_name || "N/A"}
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
                      {shareOption === "full_profile" ? (
                        <span>
                          {candidateData?.premium_data?.email || "N/A"}
                        </span>
                      ) : (
                        <span>a************@gmail.com</span>
                      )}
                      <Mail className="w-4 h-4 mr-1" />
                    </div>
                    <div className="flex items-center justify-left gap-2">
                      {shareOption === "full_profile" ? (
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
            {shareOption === "anonymous_profile" ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-3">
                  Profile Summary
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {candidateData?.profile_summary}
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

          <div className="pt-6 mt-6 border-t border-gray-200 w-full grid grid-cols-1 lg:grid-cols-3">
            {/* References Section */}
            <div className="mr-8 col-span-1">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">
                References
              </h3>
              <div className="space-y-3">
                {referencesLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">
                      Loading references...
                    </p>
                  </div>
                ) : referencesError ? (
                  <p className="text-sm text-red-600">{referencesError}</p>
                ) : references.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No references available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {references.map((ref, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {ref.hr_name}
                          </div>
                          <div className="text-sm text-gray-600">
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

            {/* Community Notes Section */}
            <div className="ml-8 pl-8 col-span-2">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">
                Community Notes
              </h3>
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
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareableProfile;
