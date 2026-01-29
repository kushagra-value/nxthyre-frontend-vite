import { Copy } from "lucide-react";
import { useState } from "react";

interface ProjectCardProps {
  isActive?: boolean;
  jobName?: string;
  postedAgo: string;
  companyName: string;
  experience: string; // e.g., "8+ years"
  workApproach: string; // "Hybrid", "Onsite", "Remote"
  joiningTimeline: string; // e.g., "Immediate"
  location: string;
  inboundCount: number; // 556 in image
  shortlistedCount: number; // 21
  totalApplied: number; // 61
  totalReplied: number; // 21
  interviewsCount: number;
  featuredCount: number;
  jobId: number;
  badgeText?: string;
  status?: "DRAFT" | "PUBLISHED";
  visibility?: "PRIVATE" | "PUBLIC";
  onEditJobRole: (jobId: number) => void;
  onArchiveJob?: (jobId: number) => void;
  onSharePipelines: (jobId: number) => void;
  onPublishJob: (jobId: number) => void;
  onUnpublishJob: (jobId: number) => void;
  onSelectCard?: (jobId: number) => void;
  onCopyJobID?: (jobId: number) => void;
  logoUrl?: string | null;
}

export default function ProjectCard({
  isActive = false,
  jobName = "",
  jobId,
  companyName,
  experience,
  workApproach,
  joiningTimeline,
  location,
  inboundCount = 0,
  shortlistedCount = 0,
  totalApplied = 0,
  totalReplied = 0,
  status = "DRAFT",
  visibility = "PRIVATE",
  interviewsCount,
  featuredCount,
  badgeText,
  postedAgo,
  onEditJobRole,
  onArchiveJob,
  onSharePipelines,
  onPublishJob,
  onUnpublishJob,
  onCopyJobID,
  onSelectCard,
  logoUrl,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const borderClass = isHovered
    ? "border-[#0F47F2] shadow-[0px_1px_30px_2px_rgba(15,71,242,0.31)]"
    : "border-[#BCBCBC]";

  const titleClass = isHovered ? "text-[#0F47F2]" : "text-[#181D25]";
  const subtitleClass = isHovered ? "text-[#4B5563]" : "text-[#BCBCBC]";
  const textClass = isHovered ? "text-[#181D25]" : "text-[#4B5563]";
  const avatarBorderClass = isHovered ? "border-[#0F47F2]" : "border-[#4B5563]";
  const iconColor = isHovered ? "#4B5563" : "#818283";
  const isPublished = status === "PUBLISHED" && visibility === "PUBLIC";

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (onSelectCard) {
      onSelectCard(jobId);
    }
  };
  const handleCopyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onCopyJobID?.(jobId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={`w-full h-[300px] bg-white rounded-[10px] border-[0.5px] ${borderClass} cursor-pointer transition-all duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="px-[20px] pt-[20px] pb-[20px] flex flex-col h-full">
        {/* Header: Avatar + Company/Posting time + On Track badge */}
        <div className="w-full flex justify-between items-start mb-[10px]">
          <div className=" w-full flex justify-between items-start">
            {/* Company avatar */}
            <div
              className={`w-[42px] h-[42px] rounded-full ${avatarBorderClass} border-[0.5px] border-[#818283] bg-white flex items-center justify-center transition-colors duration-200`}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="w-full h-full rounded-full object-contain p-1"
                />
              ) : (
                <span className="text-[24px] font-semibold text-[#181D25] ">
                  {companyName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* {badgeText && (
            <div className="flex items-center gap-[5px] px-[10px] py-[7px] bg-[#F4F4F4] rounded-full">
              <div className="w-[18px] h-[18px] bg-[#A8E8CD] rounded-[12px] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="18" height="18" rx="9" fill="#A8E8CD"/>
                <path d="M3 11.1712C3 11.1712 5.36538 7.91788 6.75 7.47363C8.13462 7.02938 9.37847 11.8209 11.7692 11.1712C13.6377 10.6634 15 6.75 15 6.75" stroke="#1CB977" stroke-linecap="round"/>
                </svg>

              </div>
              <span className="text-[14px] font-normal text-[#1CB977]">{badgeText}</span>
            </div>
          )} */}
          </div>
        </div>

        <div className="flex flex-row items-center gap-4 mb-[20px]">
          <h3 className="text-[18px] font-semibold text-[#181D25]">
            {companyName}
          </h3>
          <p className={`text-[16px] ${subtitleClass} mt-[4px]`}>{postedAgo}</p>
        </div>

        {/* Job title */}
        <div className="mb-[24px] flex items-center gap-[8px]">
          <h2
            className={`text-[24px] max-w-[16ch] truncate font-normal ${titleClass}`}
          >
            {jobName}
          </h2>

          {/* <button
            type="button"
            onClick={handleCopyClick}
            className={`shrink-0 rounded p-1 -m-1 transition ${isCopied ? "bg-green-100" : "hover:bg-gray-100"
              }`}
            title={isCopied ? "Copied!" : "Copy Job ID"}
            aria-label={isCopied ? "Copied!" : "Copy Job ID"}
          >
            {isCopied ? (
              // Success icon (copy + checkmark)
              <svg
                className="w-[20px] h-[20px] transition-colors"
                viewBox="0 0 800 800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity="0.4"
                  d="M733.333 370V230C733.333 113.333 686.667 66.6667 570 66.6667H430C313.333 66.6667 266.667 113.333 266.667 230V266.667H370C486.667 266.667 533.333 313.333 533.333 430V533.333H570C686.667 533.333 733.333 486.667 733.333 370Z"
                  stroke="currentColor"
                  strokeWidth="50"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M533.333 570V430C533.333 313.333 486.667 266.667 370 266.667H230C113.333 266.667 66.6667 313.333 66.6667 430V570C66.6667 686.667 113.333 733.333 230 733.333H370C486.667 733.333 533.333 686.667 533.333 570Z"
                  stroke="currentColor"
                  strokeWidth="50"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M202.669 499.993L267.669 564.993L397.337 434.993"
                  stroke="currentColor"
                  strokeWidth="50"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              // Normal copy icon
              <svg
                className="w-[20px] h-[20px] transition-colors"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_4467_2105)">
                  <path
                    d="M13.3327 10.7513V14.2513C13.3327 17.168 12.166 18.3346 9.24935 18.3346H5.74935C2.83268 18.3346 1.66602 17.168 1.66602 14.2513V10.7513C1.66602 7.83464 2.83268 6.66797 5.74935 6.66797H9.24935C12.166 6.66797 13.3327 7.83464 13.3327 10.7513Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    opacity="0.4"
                    d="M18.3327 5.7513V9.2513C18.3327 12.168 17.166 13.3346 14.2493 13.3346H13.3327V10.7513C13.3327 7.83463 12.166 6.66797 9.24935 6.66797H6.66602V5.7513C6.66602 2.83464 7.83268 1.66797 10.7493 1.66797H14.2493C17.166 1.66797 18.3327 2.83464 18.3327 5.7513Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_4467_2105">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            )}
          </button> */}
        </div>

        {/* Tag pills – plain, no prefix icons */}
        <div className="flex gap-3 mb-[18px]">
          <div className="flex items-center justify-center px-[10px] h-[38px] bg-[#F0F0F0] rounded-[5px]">
            <span className={`text-[16px] ${textClass}`}>{experience}</span>
          </div>
          {/* <div className="flex items-center justify-center px-[10px] h-[38px] bg-[#F0F0F0] rounded-[5px]">
            <span className={`text-[16px] ${textClass}`}>{workApproach}</span>
          </div> */}
          <div className="flex items-center justify-center px-[10px] h-[38px] bg-[#F0F0F0] rounded-[5px]">
            <span className={`text-[16px] ${textClass}`}>{location}</span>
          </div>
          <div className="flex items-center justify-center px-[10px] h-[38px] bg-[#F0F0F0] rounded-[5px]">
            <span className={`text-[16px] ${textClass}`}>Job ID: {jobId}</span>
            <Copy
              onClick={(e) => {
                e.stopPropagation();
                onCopyJobID?.(jobId);
              }}
              className="w-2 h-2"
            />
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t-[0.5px] border-[#818283] mb-[16px]" />

        {/* Bottom stats row */}
        <div className="w-5/6 flex justify-between items-center">
          {/*Candidates Inbound applicants */}
          <div className="group relative flex items-center gap-[8px] cursor-help">
            <div className="w-[24px] h-[24px] rounded-full bg-[#4B5563] flex items-center justify-center transition-colors group-hover:bg-[#0F47F2]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.00065 7.0013C8.61147 7.0013 9.91732 5.69546 9.91732 4.08464C9.91732 2.47381 8.61147 1.16797 7.00065 1.16797C5.38982 1.16797 4.08398 2.47381 4.08398 4.08464C4.08398 5.69546 5.38982 7.0013 7.00065 7.0013Z"
                  stroke="#F5F9FB"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.98828 12.8333C1.98828 10.5758 4.23411 8.75 6.99911 8.75C7.55911 8.75 8.10161 8.82583 8.60911 8.96583"
                  stroke="#F5F9FB"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.8327 10.5013C12.8327 10.688 12.8093 10.8688 12.7627 11.0438C12.7102 11.2771 12.6168 11.5046 12.4943 11.703C12.0918 12.3796 11.351 12.8346 10.4993 12.8346C9.89852 12.8346 9.35602 12.6071 8.94768 12.2338C8.77268 12.0821 8.62102 11.9013 8.50435 11.703C8.28852 11.353 8.16602 10.9388 8.16602 10.5013C8.16602 9.8713 8.41685 9.2938 8.82518 8.8738C9.25102 8.4363 9.84602 8.16797 10.4993 8.16797C11.1877 8.16797 11.8118 8.46547 12.2318 8.9438C12.6052 9.35797 12.8327 9.9063 12.8327 10.5013Z"
                  stroke="#F5F9FB"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.3692 10.4883H9.63086"
                  stroke="#F5F9FB"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.5 9.63672V11.3809"
                  stroke="#F5F9FB"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className={`text-[20px] ${textClass} transition-colors group-hover:text-[#0F47F2]`}
            >
              {inboundCount}
            </span>
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#181D25] text-white text-[12px] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Candidates Inbound
            </span>
          </div>

          {/* Candidates Shortlisted */}
          <div className="group relative flex items-center gap-[8px] cursor-help">
            <div className="w-[24px] h-[24px] rounded-full bg-[#4B5563] flex items-center justify-center transition-colors group-hover:bg-[#0F47F2]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.00065 7.0013C8.61147 7.0013 9.91732 5.69546 9.91732 4.08464C9.91732 2.47381 8.61147 1.16797 7.00065 1.16797C5.38982 1.16797 4.08398 2.47381 4.08398 4.08464C4.08398 5.69546 5.38982 7.0013 7.00065 7.0013Z"
                  stroke="#F5F9FB"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.98828 12.8333C1.98828 10.5758 4.23411 8.75 6.9991 8.75C7.5591 8.75 8.1016 8.82583 8.6091 8.96583"
                  stroke="#F5F9FB"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.8327 10.5013C12.8327 10.9388 12.7102 11.353 12.4943 11.703C12.3718 11.913 12.2143 12.0996 12.0335 12.2513C11.6252 12.6188 11.0885 12.8346 10.4993 12.8346C9.64768 12.8346 8.90685 12.3796 8.50435 11.703C8.28852 11.353 8.16602 10.9388 8.16602 10.5013C8.16602 9.7663 8.50435 9.10714 9.04102 8.6813C9.44352 8.36047 9.95102 8.16797 10.4993 8.16797C11.7885 8.16797 12.8327 9.21214 12.8327 10.5013Z"
                  stroke="#F5F9FB"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.58984 10.5014L10.1673 11.0789L11.4098 9.92969"
                  stroke="#F5F9FB"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className={`text-[20px] ${textClass} transition-colors group-hover:text-[#0F47F2]`}
            >
              {shortlistedCount}
            </span>
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#181D25] text-white text-[12px] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Candidates Shortlisted
            </span>
          </div>

          {/* Interviews Scheduled Today */}
          <div className="group relative flex items-center gap-[8px] cursor-help">
            <div className="w-[24px] h-[24px] rounded-full bg-[#4B5563] flex items-center justify-center transition-colors group-hover:bg-[#0F47F2]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.5 6.19844C0.5 3.93569 0.5 2.80433 1.20294 2.10138C1.90589 1.39844 3.03726 1.39844 5.3 1.39844H7.7C9.96272 1.39844 11.0941 1.39844 11.797 2.10138C12.5 2.80433 12.5 3.93569 12.5 6.19844V7.39844C12.5 9.66116 12.5 10.7926 11.797 11.4955C11.0941 12.1984 9.96272 12.1984 7.7 12.1984H5.3C3.03726 12.1984 1.90589 12.1984 1.20294 11.4955C0.5 10.7926 0.5 9.66116 0.5 7.39844V6.19844Z"
                  stroke="white"
                />
                <path d="M3.5 1.4V0.5" stroke="white" strokeLinecap="round" />
                <path d="M9.5 1.4V0.5" stroke="white" strokeLinecap="round" />
                <path
                  d="M0.798828 4.39844H12.1988"
                  stroke="white"
                  strokeLinecap="round"
                />
                <path
                  d="M10.1004 9.20156C10.1004 9.53294 9.83177 9.80156 9.50039 9.80156C9.16901 9.80156 8.90039 9.53294 8.90039 9.20156C8.90039 8.87018 9.16901 8.60156 9.50039 8.60156C9.83177 8.60156 10.1004 8.87018 10.1004 9.20156Z"
                  fill="white"
                />
                <path
                  d="M10.1004 6.79922C10.1004 7.1306 9.83177 7.39922 9.50039 7.39922C9.16901 7.39922 8.90039 7.1306 8.90039 6.79922C8.90039 6.46784 9.16901 6.19922 9.50039 6.19922C9.83177 6.19922 10.1004 6.46784 10.1004 6.79922Z"
                  fill="white"
                />
                <path
                  d="M7.10039 9.20156C7.10039 9.53294 6.83177 9.80156 6.50039 9.80156C6.16901 9.80156 5.90039 9.53294 5.90039 9.20156C5.90039 8.87018 6.16901 8.60156 6.50039 8.60156C6.83177 8.60156 7.10039 8.87018 7.10039 9.20156Z"
                  fill="white"
                />
                <path
                  d="M7.10039 6.79922C7.10039 7.1306 6.83177 7.39922 6.50039 7.39922C6.16901 7.39922 5.90039 7.1306 5.90039 6.79922C5.90039 6.46784 6.16901 6.19922 6.50039 6.19922C6.83177 6.19922 7.10039 6.46784 7.10039 6.79922Z"
                  fill="white"
                />
                <path
                  d="M4.10039 9.20156C4.10039 9.53294 3.83176 9.80156 3.50039 9.80156C3.16902 9.80156 2.90039 9.53294 2.90039 9.20156C2.90039 8.87018 3.16902 8.60156 3.50039 8.60156C3.83176 8.60156 4.10039 8.87018 4.10039 9.20156Z"
                  fill="white"
                />
                <path
                  d="M4.10039 6.79922C4.10039 7.1306 3.83176 7.39922 3.50039 7.39922C3.16902 7.39922 2.90039 7.1306 2.90039 6.79922C2.90039 6.46784 3.16902 6.19922 3.50039 6.19922C3.83176 6.19922 4.10039 6.46784 4.10039 6.79922Z"
                  fill="white"
                />
              </svg>
            </div>
            <span
              className={`text-[20px] ${textClass} transition-colors group-hover:text-[#0F47F2]`}
            >
              {interviewsCount}
            </span>
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#181D25] text-white text-[12px] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Interviews Scheduled Today
            </span>
          </div>

          {/* Candidates Sourced by Autopilot */}
          <div className="group relative flex items-center gap-[8px] cursor-help">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform group-hover:scale-110"
            >
              <circle
                cx="12"
                cy="12"
                r="12"
                fill="url(#paint0_linear_4472_2148)"
              />
              <path
                d="M12 4L14 9.42857L20 12L14 14L12 20L10 14L4 12L10 9.42857L12 4Z"
                fill="white"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_4472_2148"
                  x1="12"
                  y1="0"
                  x2="12"
                  y2="24"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#2B60FF" />
                  <stop offset="1" stopColor="#15E8CC" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[20px] text-[#0F47F2] transition-colors group-hover:text-[#0B3AB0]">
              {featuredCount}
            </span>
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#181D25] text-white text-[12px] px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Candidates Sourced by Autopilot
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
