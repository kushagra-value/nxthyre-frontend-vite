// Updated candidateDetail.tsx
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

const BooleanSearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M26.9287 16.2847C26.9287 21.1752 22.9642 25.1397 18.0737 25.1397C13.1833 25.1397 9.21875 21.1752 9.21875 16.2847C9.21875 11.3942 13.1833 7.42969 18.0737 7.42969C22.9642 7.42969 26.9287 11.3942 26.9287 16.2847Z"
      stroke="#4B5563"
      stroke-width="1.5"
    />
    <path
      d="M21.6172 16.2842C21.6172 18.2404 20.0314 19.8262 18.0752 19.8262C16.119 19.8262 14.5332 18.2404 14.5332 16.2842C14.5332 14.3279 16.119 12.7422 18.0752 12.7422C20.0314 12.7422 21.6172 14.3279 21.6172 16.2842Z"
      stroke="#4B5563"
      stroke-width="1.5"
    />
    <path
      d="M5.66406 16.2969H9.20606"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M26.916 16.2969H28.687"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M18.0664 7.44287V5.67188"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M18.0664 26.896V25.125"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
);

const ProfileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="34" height="34" rx="7" fill="none" />
    <path
      d="M17.8314 17.174C17.7558 17.1635 17.6586 17.1635 17.5723 17.174C15.6719 17.1105 14.1602 15.5857 14.1602 13.7114C14.1602 11.7949 15.7367 10.2383 17.7018 10.2383C19.6562 10.2383 21.2435 11.7949 21.2435 13.7114C21.2327 15.5857 19.7318 17.1105 17.8314 17.174Z"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M24.9392 24.1326C23.0491 25.8547 20.543 26.9006 17.7821 26.9006C15.0212 26.9006 12.5152 25.8547 10.625 24.1326C10.7312 23.1396 11.3683 22.1676 12.5045 21.4069C15.4141 19.4841 20.1714 19.4841 23.0597 21.4069C24.1959 22.1676 24.8331 23.1396 24.9392 24.1326Z"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M17.7148 26.9297C23.5828 26.9297 28.3398 22.1727 28.3398 16.3047C28.3398 10.4367 23.5828 5.67969 17.7148 5.67969C11.8468 5.67969 7.08984 10.4367 7.08984 16.3047C7.08984 22.1727 11.8468 26.9297 17.7148 26.9297Z"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const EducationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.7159 6.27715C16.3693 5.48053 18.2222 5.48053 19.8757 6.27715L27.6613 10.0282C29.3549 10.8442 29.3549 13.6686 27.6613 14.4846L19.8758 18.2357C18.2224 19.0322 16.3694 19.0322 14.716 18.2357L6.9303 14.4846C5.23677 13.6686 5.23678 10.8441 6.9303 10.0282L14.7159 6.27715Z"
      stroke="#4B5563"
      stroke-width="1.5"
    />
    <path
      d="M5.66016 12.75V18.8208"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M25.9017 15.793V21.7977C25.9017 22.9786 25.2831 24.0843 24.1997 24.6565C22.3956 25.6091 19.508 26.9227 17.3015 26.9227C15.0949 26.9227 12.2073 25.6091 10.4032 24.6565C9.31978 24.0843 8.70117 22.9786 8.70117 21.7977V15.793"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
);

const SkillsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.8333 24.2734H14.1667M19.8333 24.2734C19.8333 23.5153 19.8333 23.1362 19.8765 22.8848C20.0157 22.0736 20.0401 22.0225 20.5918 21.3842C20.7628 21.1863 21.3979 20.6532 22.668 19.587C24.4062 18.1278 25.5 16.0078 25.5 13.6484C25.5 9.24741 21.6944 5.67969 17 5.67969C12.3056 5.67969 8.5 9.24741 8.5 13.6484C8.5 16.0078 9.59378 18.1278 11.3319 19.587C12.602 20.6532 13.2372 21.1863 13.4083 21.3842C13.96 22.0225 13.9843 22.0736 14.1235 22.8848C14.1667 23.1362 14.1667 23.5153 14.1667 24.2734M19.8333 24.2734C19.8333 25.2664 19.8333 25.763 19.6055 26.1328C19.4564 26.3751 19.2417 26.5763 18.9833 26.7161C18.5888 26.9297 18.0592 26.9297 17 26.9297C15.9408 26.9297 15.4112 26.9297 15.0167 26.7161C14.7583 26.5763 14.5436 26.3751 14.3944 26.1328C14.1667 25.763 14.1667 25.2664 14.1667 24.2734"
      stroke="#4B5563"
      stroke-width="1.5"
    />
    <path
      d="M17.6136 11.3203L15.5898 14.1536H18.4232L16.3993 16.987"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const ReferencesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.0941 8.51014C15.6291 7.55026 15.8967 7.07031 16.2967 7.07031C16.6966 7.07031 16.9642 7.55026 17.4992 8.51014L17.6377 8.75847C17.7898 9.03124 17.8658 9.16763 17.9843 9.25762C18.1029 9.34761 18.2506 9.38101 18.5457 9.44782L18.8146 9.50864C19.8537 9.74374 20.3732 9.86129 20.4968 10.2588C20.6204 10.6562 20.2662 11.0704 19.5579 11.8988L19.3746 12.1131C19.1733 12.3484 19.0726 12.4661 19.0274 12.6117C18.9821 12.7574 18.9973 12.9144 19.0277 13.2284L19.0554 13.5144C19.1625 14.6195 19.2161 15.1721 18.8924 15.4178C18.5689 15.6635 18.0824 15.4395 17.1095 14.9915L16.8579 14.8756C16.5814 14.7483 16.4431 14.6847 16.2967 14.6847C16.1502 14.6847 16.0119 14.7483 15.7355 14.8756L15.4838 14.9915C14.5109 15.4395 14.0244 15.6635 13.7008 15.4178C13.3772 15.1721 13.4308 14.6195 13.5379 13.5144L13.5656 13.2284C13.596 12.9144 13.6112 12.7574 13.566 12.6117C13.5207 12.4661 13.42 12.3484 13.2187 12.1131L13.0355 11.8988C12.3271 11.0704 11.9729 10.6562 12.0965 10.2588C12.2201 9.86129 12.7397 9.74374 13.7787 9.50864L14.0475 9.44782C14.3428 9.38101 14.4904 9.34761 14.609 9.25762C14.7275 9.16763 14.8035 9.03124 14.9556 8.75847L15.0941 8.51014Z"
      stroke="#4B5563"
      stroke-width="1.5"
    />
    <path
      d="M24.2932 13.2105C24.5527 12.716 24.6823 12.4688 24.8763 12.4688C25.0703 12.4688 25.1999 12.716 25.4594 13.2105L25.5265 13.3384C25.6003 13.4789 25.6371 13.5492 25.6946 13.5956C25.752 13.6419 25.8236 13.6591 25.9668 13.6935L26.0971 13.7249C26.6009 13.846 26.8528 13.9065 26.9127 14.1113C26.9727 14.3161 26.801 14.5294 26.4575 14.9562L26.3686 15.0666C26.271 15.1878 26.2223 15.2484 26.2003 15.3235C26.1784 15.3985 26.1857 15.4794 26.2005 15.6411L26.2139 15.7885C26.2658 16.3578 26.2918 16.6424 26.1349 16.769C25.978 16.8955 25.7422 16.7802 25.2705 16.5494L25.1484 16.4898C25.0144 16.4241 24.9474 16.3914 24.8763 16.3914C24.8052 16.3914 24.7383 16.4241 24.6042 16.4898L24.4821 16.5494C24.0104 16.7802 23.7746 16.8955 23.6177 16.769C23.4608 16.6424 23.4868 16.3578 23.5387 15.7885L23.5521 15.6411C23.5669 15.4794 23.5743 15.3985 23.5524 15.3235C23.5303 15.2484 23.4816 15.1878 23.384 15.0666L23.2951 14.9562C22.9516 14.5294 22.78 14.3161 22.8399 14.1113C22.8998 13.9065 23.1517 13.846 23.6555 13.7249L23.7858 13.6935C23.929 13.6591 24.0006 13.6419 24.0581 13.5956C24.1155 13.5492 24.1524 13.4789 24.2261 13.3384L24.2932 13.2105Z"
      stroke="#4B5563"
      stroke-width="1.5"
    />
    <path
      d="M7.21683 13.2105C7.49247 12.716 7.6303 12.4688 7.83636 12.4688C8.04241 12.4688 8.18024 12.716 8.45589 13.2105L8.5272 13.3384C8.60553 13.4789 8.64469 13.5492 8.70576 13.5956C8.76682 13.6419 8.84288 13.6591 8.99499 13.6935L9.13347 13.7249C9.66875 13.846 9.93639 13.9065 10.0001 14.1113C10.0637 14.3161 9.88127 14.5294 9.51636 14.9562L9.42196 15.0666C9.31825 15.1878 9.2664 15.2484 9.24308 15.3235C9.21975 15.3985 9.22759 15.4794 9.24327 15.6411L9.25754 15.7885C9.31271 16.3578 9.3403 16.6424 9.1736 16.769C9.00689 16.8955 8.75631 16.7802 8.25513 16.5494L8.12546 16.4898C7.98304 16.4241 7.91184 16.3914 7.83636 16.3914C7.76088 16.3914 7.68967 16.4241 7.54725 16.4898L7.41758 16.5494C6.91641 16.7802 6.66582 16.8955 6.49912 16.769C6.33241 16.6424 6.36 16.3578 6.41517 15.7885L6.42945 15.6411C6.44513 15.4794 6.45296 15.3985 6.42963 15.3235C6.40631 15.2484 6.35447 15.1878 6.25076 15.0666L6.15636 14.9562C5.79144 14.5294 5.60898 14.3161 5.67265 14.1113C5.73633 13.9065 6.00397 13.846 6.53925 13.7249L6.67773 13.6935C6.82983 13.6591 6.90589 13.6419 6.96696 13.5956C7.02802 13.5492 7.06719 13.4789 7.14551 13.3384L7.21683 13.2105Z"
      stroke="#4B5563"
      stroke-width="1.5"
    />
    <path
      d="M8.74609 26.6705H11.1626C12.2435 26.6705 13.336 26.7822 14.3879 26.9972C16.2488 27.3775 18.2079 27.4235 20.0878 27.1217C21.0147 26.9728 21.926 26.7453 22.7509 26.3503C23.4956 25.9938 24.4077 25.4913 25.0204 24.9284C25.6322 24.3663 26.2694 23.4464 26.7216 22.7273C27.1094 22.1107 26.9219 21.3542 26.3084 20.8948C25.6271 20.3845 24.616 20.3846 23.9347 20.8951L22.0023 22.343C21.2534 22.9042 20.4354 23.4207 19.4609 23.575C19.3437 23.5935 19.2209 23.6104 19.0928 23.6251M19.0928 23.6251C19.0542 23.6296 19.0152 23.6338 18.9756 23.6379M19.0928 23.6251C19.2487 23.592 19.4035 23.4966 19.5488 23.3709C20.2365 22.7754 20.2799 21.7719 19.6832 21.107C19.5448 20.9528 19.3827 20.8241 19.2026 20.7175C16.2115 18.9478 11.5577 20.2957 8.74609 22.2735M19.0928 23.6251C19.0538 23.6334 19.0147 23.6379 18.9756 23.6379M18.9756 23.6379C18.416 23.6948 17.7614 23.7096 17.0349 23.6415"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M8.73244 21.4787C8.73244 20.6038 8.04469 19.8945 7.1963 19.8945C6.34791 19.8945 5.66016 20.6038 5.66016 21.4787V26.7592C5.66016 27.6341 6.34791 28.3433 7.1963 28.3433C8.04469 28.3433 8.73244 27.6341 8.73244 26.7592V21.4787Z"
      stroke="#4B5563"
      stroke-width="1.5"
    />
  </svg>
);

const NotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M25.8202 18.0711L26.365 16.0751C27.0009 13.7451 27.3188 12.5802 27.0794 11.572C26.8904 10.776 26.4651 10.0528 25.8574 9.49407C25.0878 8.78641 23.9011 8.47426 21.5278 7.84995C19.1545 7.22563 17.9677 6.91348 16.9409 7.14856C16.13 7.33416 15.3934 7.75166 14.8242 8.34825C14.207 8.99515 13.8852 9.94217 13.4063 11.6635C13.3258 11.9526 13.241 12.2635 13.1495 12.5985L12.6047 14.5947C11.9688 16.9247 11.6508 18.0896 11.8902 19.0978C12.0793 19.8939 12.5046 20.617 13.1123 21.1758C13.8819 21.8834 15.0686 22.1956 17.4419 22.8199C19.5811 23.3826 20.7562 23.6917 21.7192 23.5751C21.8247 23.5624 21.9275 23.5445 22.0289 23.5213C22.8397 23.3357 23.5763 22.9182 24.1454 22.3216C24.8662 21.566 25.1843 20.4011 25.8202 18.0711Z"
      stroke="#4B5563"
      stroke-width="1.5"
    />
    <path
      d="M22.4384 24.0615C22.2164 24.7401 21.8261 25.354 21.3012 25.8447C20.5226 26.5726 19.3219 26.8936 16.9209 27.5359C14.5197 28.178 13.3192 28.4991 12.2802 28.2573C11.4599 28.0665 10.7146 27.637 10.1388 27.0233C9.40952 26.2461 9.08784 25.0478 8.44446 22.651L7.89329 20.5978C7.24991 18.2011 6.92822 17.0027 7.17048 15.9656C7.36175 15.1468 7.792 14.403 8.40682 13.8282C9.18546 13.1003 10.386 12.7792 12.7871 12.137C13.2414 12.0155 13.6527 11.9055 14.0281 11.8086"
      stroke="#4B5563"
      stroke-width="1.5"
    />
    <path
      d="M17.7148 16.5117L22.4375 17.6924"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M16.5293 18.8789H18.8906"
      stroke="#4B5563"
      stroke-width="1.5"
      stroke-linecap="round"
    />
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
  AnalysisResult,
} from "../services/candidateService";
import { CompanyHoverCard } from "./CompanyHoverCard";

interface HighlightedTextProps {
  text: string;
  keywords: string[];
}

const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  keywords,
}) => {
  if (!keywords.length || !text) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  keywords.forEach((keyword) => {
    const keywordLower = keyword.toLowerCase();
    let index = text.toLowerCase().indexOf(keywordLower, lastIndex);
    if (index === -1) return;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    const highlighted = text.slice(index, index + keyword.length);
    parts.push(
      <mark
        key={`${keyword}-${index}`}
        className="bg-blue-600 text-white px-1 rounded font-medium"
      >
        {highlighted}
      </mark>,
    );

    lastIndex = index + keyword.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
};

interface CandidateDetailProps {
  candidate: CandidateListItem | null;
  candidates: CandidateListItem[];
  onSendInvite: () => void;
  updateCandidateEmail: (
    candidateId: string,
    candidate_email: string,
    candidate_phone: string,
  ) => void;
  deductCredits: () => Promise<void>;
  onUpdateCandidate: (updated: CandidateListItem) => void;
  enableBooleanAnalysis?: boolean;
  defaultBoolQuery: string;
  jobId?: string;
  textQuery?: string; // NEW: Current keyword string (text_query)
  boolQuery?: string; // NEW: Current boolean query
  enableAnalysis?: boolean;
  onAnalysisFetched?: (analysis: AnalysisResult) => void;
  activeMiddleTab?: string;
  setActiveMiddleTab?: (tab: string) => void;
}

const CandidateDetail: React.FC<CandidateDetailProps> = ({
  candidate,
  candidates = [],
  onSendInvite,
  updateCandidateEmail,
  onUpdateCandidate,
  deductCredits,
  enableBooleanAnalysis,
  defaultBoolQuery,
  jobId,
  textQuery,
  boolQuery,
  enableAnalysis,
  onAnalysisFetched,
  activeMiddleTab,
  setActiveMiddleTab,
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

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!candidate?.id || !enableAnalysis || !jobId) {
        setHasBooleanAnalysis(false);
        setBooleanData(null);
        setAnalysisError(null);
        setLoadingAnalysis(false);
        if (activeTab === "Boolean-Search") {
          setActiveTab("Profile");
        }
        return;
      }

      setHasBooleanAnalysis(true); // Show tab whenever job is selected

      if (activeMiddleTab === "inbound") {
        // Inbound case: Use candidate detail API with job_id
        setLoadingAnalysis(true);
        setAnalysisError(null);
        try {
          const detailData = await candidateService.getCandidateInboundScore(
            candidate.id,
            jobId,
          );

          console.log("Detail data :: ", detailData);
          // Note: Assuming job_score comes inside detailData.candidate when job_id is used internally
          // If job_score is not present → backend should be fixed to include it when ?job_id=... is sent
          const jobScore = detailData.candidate?.job_score || null;

          if (!jobScore) {
            throw new Error("No job_score found in candidate detail response");
          }

          const mapped: AnalysisResult = {
            candidate_id: jobScore.candidate_id,
            candidate_name: jobScore.candidate_name,
            candidate_match_score: {
              score: jobScore.candidate_match_score.score,
              label: jobScore.candidate_match_score.label,
              description: jobScore.candidate_match_score.description,
              note: jobScore.candidate_match_score.note || "",
            },
            quick_fit_summary: jobScore.quick_fit_summary,
            gaps_risks: jobScore.gaps_risks,
            recommended_message: jobScore.recommended_message,
            call_attention: jobScore.call_attention,
          };

          setBooleanData(mapped);
          if (onAnalysisFetched) onAnalysisFetched(mapped);

          // Auto-switch only on success
          if (activeTab !== "Boolean-Search") {
            setActiveTab("Boolean-Search");
          }
        } catch (err: any) {
          console.error("Inbound job score fetch failed:", err);
          setAnalysisError(
            "Failed to load job score for this inbound candidate.",
          );
        } finally {
          setLoadingAnalysis(false);
        }
      } else {
        // Other tabs: Normal boolean analysis (only if there's a query)
        const effectiveQuery =
          boolQuery?.trim() ||
          textQuery?.trim() ||
          defaultBoolQuery?.trim() ||
          "";

        if (!effectiveQuery) {
          setBooleanData(null);
          return;
        }

        setLoadingAnalysis(true);
        setAnalysisError(null);

        try {
          const data = await candidateService.getCandidateBooleanSearch(
            candidate.id,
            effectiveQuery,
          );
          setBooleanData(data);
          if (onAnalysisFetched) onAnalysisFetched(data);

          if (activeTab !== "Boolean-Search") {
            setActiveTab("Boolean-Search");
          }
        } catch (err: any) {
          console.error("Boolean analysis fetch failed:", err);
          setAnalysisError(
            "Failed to analyze candidate. Check query or try again.",
          );
        } finally {
          setLoadingAnalysis(false);
        }
      }
    };

    fetchAnalysis();
  }, [
    candidate?.id,
    enableAnalysis,
    jobId,
    activeTab,
    boolQuery,
    textQuery,
    defaultBoolQuery,
    onAnalysisFetched,
  ]);

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

  const [booleanData, setBooleanData] = useState<AnalysisResult | null>(null);
  const [hasBooleanAnalysis, setHasBooleanAnalysis] = useState(false);

  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Inside the CandidateDetail component, add this useMemo after the existing state declarations
  const keywords = useMemo(
    () =>
      hasBooleanAnalysis && booleanData?.quick_fit_summary
        ? booleanData.quick_fit_summary.map((item) => item.badge)
        : [],
    [booleanData, hasBooleanAnalysis],
  );

  // Update the tabs array to include icons
  const tabs: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { name: "Boolean-Search", icon: BooleanSearchIcon },
    { name: "Profile", icon: ProfileIcon },
    { name: "Education", icon: EducationIcon },
    { name: "Skills", icon: SkillsIcon },
    { name: "References", icon: ReferencesIcon },
    { name: "Notes", icon: NotesIcon },
  ];

  // Now filter the tabs dynamically
  const visibleTabs = tabs.filter(
    (tab) => tab.name !== "Boolean-Search" || hasBooleanAnalysis,
  );

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
        },
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
      <div className="bg-white rounded-xl p-4 lg:p-4 min-h-[81vh] animate-pulse">
        {/* Header skeleton */}
        <div className="flex space-x-3 items-center mt-1 mb-6">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 rounded w-64" /> {/* Name */}
            <div className="h-4 bg-gray-200 rounded w-96" /> {/* Headline */}
            <div className="h-4 bg-gray-200 rounded w-48" /> {/* Location */}
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />{" "}
          {/* Share button */}
        </div>

        {/* Contact section skeleton */}
        <div className="border-t border-gray-300 border-b p-3 space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded" /> {/* Mail icon */}
              <div className="h-4 bg-gray-200 rounded w-72" /> {/* Email */}
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded" /> {/* Copy button */}
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded" /> {/* Phone icon */}
              <div className="h-4 bg-gray-200 rounded w-48" /> {/* Phone */}
            </div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded" /> {/* WhatsApp */}
              <div className="w-8 h-8 bg-gray-200 rounded" /> {/* Copy */}
            </div>
          </div>
        </div>

        {/* Send Invite button skeleton */}
        <div className="mb-6">
          <div className="h-10 bg-gray-200 rounded-lg w-full" />
        </div>

        {/* Tabs skeleton */}
        <div className="flex space-x-4 border-b border-gray-200 mb-4 pb-2 w-4/5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center space-x-1">
              <div className="w-8 h-8 bg-gray-200 rounded" />{" "}
              {/* Icon placeholder */}
              <div className="h-4 bg-gray-200 rounded w-20" /> {/* Tab name */}
            </div>
          ))}
        </div>

        {/* Content area skeleton (mimics Profile tab) */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="h-5 bg-gray-200 rounded w-48 mb-3" /> {/* Title */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>

          {/* Experience section */}
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" /> {/* Title */}
            {Array.from({ length: 2 }, (_, i) => (
              <div
                key={i}
                className="border-l-2 border-gray-200 ml-2 pl-4 space-y-3 py-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0" />{" "}
                  {/* Company logo */}
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-64" />{" "}
                    {/* Job title */}
                    <div className="h-4 bg-gray-200 rounded w-48" />{" "}
                    {/* Company + location */}
                    <div className="h-4 bg-gray-200 rounded w-32" />{" "}
                    {/* Dates */}
                  </div>
                </div>
                <div className="space-y-2 ml-8">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
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
      "_blank",
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
      const premResponse =
        await candidateService.revealPremiumData(candidateId);
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
        detailedCandidate.candidate.id,
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

  const BooleanSearchTab = () => {
    if (loadingAnalysis) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-pulse">
          <div className="flex items-start gap-4 bg-gray-50 rounded-md px-4 py-4">
            <div className="w-16 h-16 bg-gray-200 rounded-md" />
            <div className="space-y-3 flex-1">
              <div className="h-5 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-64" />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48" />
            <div className="flex flex-wrap gap-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded-full w-28" />
                ))}
            </div>
          </div>
        </div>
      );
    }

    if (analysisError) {
      return (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error</div>
          <p className="text-gray-700">{analysisError}</p>
        </div>
      );
    }

    if (!booleanData) {
      return (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <div className="text-gray-600 text-lg">
            {activeMiddleTab === "inbound"
              ? "No job score available for this candidate in inbound."
              : "No analysis available. Please add keywords or boolean query in filters."}
          </div>
        </div>
      );
    }
    //   return (
    //     <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-pulse">
    //       {/* Top Badge Skeleton */}
    //       <div className="mb-6">
    //         <div className="flex items-start gap-4 bg-gray-50 rounded-md px-4 py-4">
    //           <div className="w-16 h-16 bg-gray-200 rounded-md" />
    //           <div className="space-y-3 flex-1">
    //             <div className="h-5 bg-gray-200 rounded w-32" />
    //             <div className="h-4 bg-gray-200 rounded w-64" />
    //             <div className="h-4 bg-gray-200 rounded w-48" />
    //           </div>
    //         </div>
    //       </div>

    //       {/* Quick Fit Summary Skeleton */}
    //       <div className="mb-6">
    //         <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
    //         <div className="flex flex-wrap gap-3">
    //           {Array.from({ length: 8 }, (_, i) => (
    //             <div key={i} className="flex items-center gap-2">
    //               <div className="h-8 bg-gray-200 rounded-full w-32" />
    //               <div className="w-5 h-5 bg-gray-200 rounded-full" />
    //             </div>
    //           ))}
    //         </div>
    //       </div>

    //       <div className="mb-4 border-b border-gray-200" />

    //       {/* Gaps / Risks Skeleton */}
    //       <div className="mb-6">
    //         <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
    //         <div className="space-y-3">
    //           {Array.from({ length: 5 }, (_, i) => (
    //             <div key={i} className="h-12 bg-gray-50 rounded-md p-3">
    //               <div className="h-4 bg-gray-200 rounded w-full" />
    //             </div>
    //           ))}
    //         </div>
    //       </div>

    //       <div className="mb-4 border-b border-gray-200" />

    //       {/* Recommended Message Skeleton */}
    //       <div className="mb-6">
    //         <div className="h-6 bg-gray-200 rounded w-64 mb-4" />
    //         <div className="space-y-3">
    //           <div className="h-4 bg-gray-200 rounded w-full" />
    //           <div className="h-4 bg-gray-200 rounded w-full" />
    //           <div className="h-4 bg-gray-200 rounded w-5/6" />
    //         </div>
    //       </div>

    //       <div className="mb-4 border-b border-gray-200" />

    //       {/* Call Attention Skeleton */}
    //       <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
    //         <div className="flex items-center gap-3 mb-4">
    //           <div className="w-6 h-6 bg-yellow-200 rounded-full" />
    //           <div className="h-6 bg-yellow-200 rounded w-40" />
    //         </div>
    //         <div className="space-y-3 pl-9">
    //           {Array.from({ length: 4 }, (_, i) => (
    //             <div key={i} className="h-4 bg-yellow-100 rounded w-11/12" />
    //           ))}
    //         </div>
    //       </div>
    //     </div>
    //   );
    // };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        {/* Top Badge */}
        <div className="mb-4">
          <div className="flex items-center gap-4 bg-green-200 rounded-md px-2 py-3 mr-2 mb-3">
            <span className="text-xl bg-green-600 text-white p-2 rounded-md">
              {booleanData.candidate_match_score.score}
            </span>
            <div className="flex flex-col">
              <span className="text-black text-lg">
                {booleanData.candidate_match_score.label}
              </span>
            </div>
          </div>
          <div className="text-gray-600 bg-gray-50 rounded-md px-2 py-3 mr-2 mb-3">
            <h2 className="font-semibold mb-1 text-md">
              Profile Match Description
            </h2>
            <span className="text-sm">
              {booleanData.candidate_match_score.description}
            </span>
          </div>
        </div>

        {/* Quick Fit Summary */}
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-3 text-gray-600">
            Quick Fit Summary
          </h3>
          <div className="flex flex-wrap gap-2">
            {booleanData.quick_fit_summary.map((item, index) => (
              <span
                key={index}
                className={`bg-blue-50 ${getColorClass(
                  item.color,
                )} px-3 py-1 rounded-full text-sm flex gap-1 items-center`}
              >
                {item.badge}
                {getIcon(item.color)}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3 border-b border-gray-200"></div>

        {/* Gaps / Risks */}
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-3 text-gray-600">
            Gaps / Risks
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {booleanData.gaps_risks.map((gap, index) => (
              <li key={index} className="bg-gray-50 p-2 rounded-md">
                {gap}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-3 border-b border-gray-200"></div>

        {/* Recommended Message */}
        <div className="mb-4">
          <h4 className="text-md font-semibold mb-3 text-blue-600">
            Recommended Message to Client
          </h4>
          <p className="text-sm text-gray-600">
            {booleanData.recommended_message}
          </p>
        </div>

        <div className="mb-3 border-b border-gray-200"></div>

        {/* Callout */}
        <div className="bg-yellow-50 border rounded-md">
          <div className="flex items-center gap-2 px-3 py-4 mb-1">
            <svg
              className="h-5 w-5 text-yellow-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-yellow-600">Call Attention</h3>
          </div>
          <div className="px-4 pb-4">
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              {booleanData.call_attention.map((attention, index) => (
                <li key={index}>{attention}</li>
              ))}
            </ul>
          </div>
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
              {<HighlightedText text={displayText} keywords={keywords} />}

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
                        {
                          <HighlightedText
                            text={exp?.job_title || ""}
                            keywords={keywords}
                          />
                        }
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
                            {
                              <HighlightedText
                                text={exp?.company || ""}
                                keywords={keywords}
                              />
                            }
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
                        {
                          <HighlightedText
                            text={displayExpText}
                            keywords={keywords}
                          />
                        }
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
                  {
                    <HighlightedText
                      text={edu?.degree || ""}
                      keywords={keywords}
                    />
                  }
                </h4>
                <p className="text-sm text-[#4B5563]">
                  {
                    <HighlightedText
                      text={edu?.specialization || ""}
                      keywords={keywords}
                    />
                  }
                </p>
                <p className="text-sm text-[#6B7280]">
                  {edu?.start_date && (
                    <span>
                      {edu?.start_date} - {edu?.end_date}
                    </span>
                  )}
                </p>
                {edu?.institution && (
                  <p className="text-sm text-[#4B5563]">
                    {
                      <HighlightedText
                        text={edu?.institution}
                        keywords={keywords}
                      />
                    }
                  </p>
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
                    {/* // In EducationTab, for certifications, update the name h4: */}
                    <h4 className="font-medium text-[#111827] text-sm">
                      {
                        <HighlightedText
                          text={cert?.name || ""}
                          keywords={keywords}
                        />
                      }
                    </h4>
                    <p className="text-sm text-[#4B5563]">
                      {
                        <HighlightedText
                          text={cert?.issuer || ""}
                          keywords={keywords}
                        />
                      }
                    </p>
                    {cert.issued_date && (
                      <p className="text-sm text-[#6B7280]">
                        {cert?.issued_date}
                      </p>
                    )}
                  </div>
                ),
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
                      "
                      {
                        <HighlightedText
                          text={rec?.feedback || ""}
                          keywords={keywords}
                        />
                      }
                      "
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
        (skill) => skill.skill,
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
                    className={`p-2 text-blue-500 text-xs rounded-lg ${
                      keywords.includes(skill)
                        ? "bg-blue-600 font-medium text-white"
                        : "bg-white"
                    }`}
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
          const fetchedNotes =
            await candidateService.getCandidateNotes(candidateId);
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
        const updatedNotes =
          await candidateService.getCandidateNotes(candidateId);
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

  const tabStyles = `
  .tab-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f3f4f6; /* bg-gray-100 */
    color: #4b5563; /* text-gray-600 */
    text-align: center;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
    margin-bottom: 4px;
  }
  .tab-button:hover .tab-tooltip {
    opacity: 1;
    visibility: visible;
  }
  .tab-button {
    position: relative;
  }
`;

  return (
    <div
      className={`bg-white rounded-xl p-3 lg:p-3 ${
        showConfirm ? "space-y-0" : "space-y-6"
      } min-h-[81vh] relative`}
    >
      <style>{tabStyles}</style>
      <div className="flex space-x-3 items-center mt-1">
        <div>
          <h2 className="text-base lg:text-[16px] font-bold text-gray-900">
            {detailedCandidate?.candidate?.full_name}
          </h2>
          <div className="relative group">
            <p className="text-sm text-gray-500 max-w-[48ch] truncate">
              {detailedCandidate?.candidate?.headline}
            </p>
            {detailedCandidate.candidate?.headline && (
              <div className="absolute hidden group-hover:block bg-blue-500 text-white text-xs font-[400] rounded-md px-2 py-0.5 -bottom-10 -left-2 w-max max-w-xs z-10">
                {detailedCandidate.candidate?.headline}
              </div>
            )}
          </div>
          <div className="flex gap-4 items-center">
            <p className="text-sm text-gray-500">
              {detailedCandidate?.candidate?.location}
            </p>
            {/* need to update this API */}
            <p className="text-[14px] text-[#818283] font-[400]">
              Last Update: May 2025
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
      {/* <div className="space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={handleSendInviteClick}
            className="flex-1 px-3 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            style={{ width: "100%" }}
          >
            Send Invite & Reveal Info
          </button>
        </div>
      </div> */}

      {/* The tabs rendering JSX */}
      <div className="flex justify-between w-full border-b border-gray-200 ">
        {visibleTabs.map((tab) => (
          <div key={tab.name} className="tab-button">
            <button
              onClick={() => setActiveTab(tab.name)}
              className={`py-2 px-2 text-sm font-medium flex items-center space-x-1 relative ${
                activeTab === tab.name
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon
                className={`w-4 h-4 flex-shrink-0 ${
                  activeTab === tab.name ? "text-blue-600" : ""
                }`}
              />
              {tab.name === "Notes" && (
                <span
                  className={`text-xs ${
                    activeTab === tab.name ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  ({detailedCandidate?.candidate?.notes?.length || 0})
                </span>
              )}
            </button>
            <div className="tab-tooltip">{tab.name}</div>
          </div>
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
