import React from 'react';
import {
  Search,
  Filter,
  DownloadCloud,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Mail,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Users,
  Calendar,
  Upload,
  Maximize2,
  Plus,
  Share2,
  CheckSquare,
} from 'lucide-react';
import CandidateFilterPanel, { FiltersState } from './components/CandidateFilterPanel';
import candidateSearchService, {
  V1Candidate,
  V1SearchRequest,
  V1Workspace,
  V1Job,
  V1CandidateStats,
} from '../../services/candidateSearchService';
import candidateService from '../../services/candidateService';

// ── Icons for stat cards ──
const BriefcaseIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
    <path d="M20 22.5L20 23.75" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12.5 19.167L12.6274 21.553C12.7643 24.5645 12.8327 26.0702 13.799 26.9936C14.7654 27.917 16.2726 27.917 19.2872 27.917H20.7128C23.7274 27.917 25.2346 27.917 26.201 26.9936C27.1673 26.0702 27.2357 24.5645 27.3726 21.553L27.5 19.167" stroke="#0F47F2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12.3726 18.7025C13.7887 21.3954 16.9826 22.5 19.9999 22.5C23.0173 22.5 26.2112 21.3954 27.6273 18.7025C28.3032 17.4171 27.7914 15 26.1266 15H13.8733C12.2084 15 11.6966 17.4171 12.3726 18.7025Z" stroke="#0F47F2" />
    <path d="M23.3332 15.0007L23.2596 14.7431C22.8929 13.4597 22.7096 12.818 22.2731 12.451C21.8366 12.084 21.2568 12.084 20.0973 12.084H19.9024C18.7428 12.084 18.1631 12.084 17.7266 12.451C17.2901 12.818 17.1068 13.4597 16.7401 14.7431L16.6665 15.0007" stroke="#0F47F2" />
  </svg>

);

const UserCheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
    <path d="M12.2611 23.7618L13.9506 18.6933C14.7166 16.3952 15.0996 15.2462 16.0059 15.0323C16.9121 14.8183 17.7686 15.6748 19.4814 17.3876L22.8604 20.7666C24.5732 22.4795 25.4297 23.3359 25.2157 24.2422C25.0018 25.1484 23.8528 25.5314 21.5547 26.2975L16.4863 27.987C13.7209 28.9088 12.3381 29.3697 11.6083 28.6398C10.8784 27.9099 11.3393 26.5272 12.2611 23.7618Z" stroke="#0F47F2" stroke-width="1.5" stroke-linecap="round" />
    <path d="M20.4856 26.3461C20.4856 26.3461 19.7275 24.0649 19.7275 22.5552C19.7275 21.0454 20.4856 18.7643 20.4856 18.7643M16.3157 27.4833C16.3157 27.4833 15.6753 24.7314 15.5575 22.9343C15.3628 19.965 16.3157 15.3525 16.3157 15.3525" stroke="#0F47F2" stroke-width="1.5" stroke-linecap="round" />
    <path d="M22.7598 18.0061L22.9038 17.2861C23.0491 16.5592 23.5729 15.966 24.2761 15.7316C24.9794 15.4971 25.5031 14.9039 25.6485 14.177L25.7925 13.457" stroke="#0F47F2" stroke-width="1.5" stroke-linecap="round" />
    <path d="M25.8184 20.2533L26.0313 20.3762C26.6884 20.7556 27.5146 20.6719 28.0823 20.1685C28.5964 19.7126 29.3285 19.597 29.9581 19.8723L30.2496 19.9997" stroke="#0F47F2" stroke-width="1.5" stroke-linecap="round" />
    <path d="M18.7857 11C18.4482 11.5521 18.5328 12.2634 18.9904 12.721L19.0882 12.8189C19.4814 13.212 19.6264 13.7896 19.4655 14.3218" stroke="#0F47F2" stroke-width="1.5" stroke-linecap="round" />
    <path d="M21.811 12.397C22.0121 12.1959 22.1126 12.0954 22.2288 12.0585C22.3272 12.0274 22.4327 12.0274 22.531 12.0585C22.6473 12.0954 22.7478 12.1959 22.9489 12.397C23.1499 12.598 23.2504 12.6985 23.2873 12.8148C23.3185 12.9131 23.3185 13.0187 23.2873 13.117C23.2504 13.2332 23.1499 13.3337 22.9489 13.5348C22.7478 13.7358 22.6473 13.8364 22.531 13.8732C22.4327 13.9044 22.3272 13.9044 22.2288 13.8732C22.1126 13.8364 22.0121 13.7358 21.811 13.5348C21.61 13.3337 21.5094 13.2332 21.4726 13.117C21.4414 13.0187 21.4414 12.9131 21.4726 12.8148C21.5094 12.6985 21.61 12.598 21.811 12.397Z" fill="#0F47F2" />
    <path d="M27.7182 15.4682C27.9636 15.2228 28.0863 15.1001 28.2247 15.0468C28.3867 14.9844 28.5661 14.9844 28.7281 15.0468C28.8665 15.1001 28.9892 15.2228 29.2346 15.4682C29.48 15.7136 29.6027 15.8363 29.656 15.9747C29.7184 16.1367 29.7184 16.3161 29.656 16.4781C29.6027 16.6165 29.48 16.7392 29.2346 16.9846C28.9892 17.23 28.8665 17.3527 28.7281 17.406C28.5661 17.4684 28.3867 17.4684 28.2247 17.406C28.0863 17.3527 27.9636 17.23 27.7182 16.9846C27.4728 16.7392 27.3501 16.6165 27.2968 16.4781C27.2344 16.3161 27.2344 16.1367 27.2968 15.9747C27.3501 15.8363 27.4728 15.7136 27.7182 15.4682Z" fill="#0F47F2" />
    <path d="M15.1766 11.9403C15.3861 11.7308 15.7257 11.7308 15.9352 11.9403C16.1447 12.1498 16.1447 12.4894 15.9352 12.6989C15.7257 12.9083 15.3861 12.9083 15.1766 12.6989C14.9672 12.4894 14.9672 12.1498 15.1766 11.9403Z" fill="#0F47F2" />
    <path d="M27.3075 23.3134C27.5169 23.1039 27.8566 23.1039 28.066 23.3134C28.2755 23.5228 28.2755 23.8624 28.066 24.0719C27.8566 24.2814 27.5169 24.2814 27.3075 24.0719C27.098 23.8624 27.098 23.5228 27.3075 23.3134Z" fill="#0F47F2" />
    <path d="M25.7509 17.7411C25.9604 17.5316 26.3 17.5316 26.5095 17.7411C26.7189 17.9506 26.7189 18.2901 26.5095 18.4996C26.3 18.7091 25.9604 18.7091 25.7509 18.4996C25.5414 18.2901 25.5414 17.9506 25.7509 17.7411Z" fill="#0F47F2" />
  </svg>

);

const BotIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.447 10.6646C15.0923 9.02848 17.4078 9.02848 18.053 10.6646L19.2143 13.6092C19.2462 13.6899 19.3101 13.7538 19.3908 13.7856L22.3354 14.947C23.9716 15.5923 23.9716 17.9078 22.3354 18.553L19.3908 19.7143C19.3101 19.7462 19.2462 19.8101 19.2143 19.8908L18.053 22.8354C17.4078 24.4716 15.0923 24.4716 14.447 22.8354L13.2856 19.8908C13.2538 19.8101 13.1899 19.7462 13.1092 19.7143L10.1646 18.553C8.52848 17.9078 8.52848 15.5923 10.1646 14.947L13.1092 13.7856C13.1899 13.7538 13.2538 13.6899 13.2856 13.6092L14.447 10.6646ZM16.5413 11.2608C16.4371 10.9964 16.0629 10.9964 15.9587 11.2608L14.7973 14.2054C14.6003 14.7049 14.2049 15.1003 13.7054 15.2973L10.7608 16.4587C10.4964 16.5629 10.4964 16.9371 10.7608 17.0413L13.7054 18.2026C14.2049 18.3997 14.6003 18.7951 14.7973 19.2945L15.9587 22.2392C16.0629 22.5036 16.4371 22.5036 16.5413 22.2392L17.7026 19.2945C17.8997 18.7951 18.2951 18.3997 18.7945 18.2026L21.7392 17.0413C22.0036 16.9371 22.0036 16.5629 21.7392 16.4587L18.7945 15.2973C18.2951 15.1003 17.8997 14.7049 17.7026 14.2054L16.5413 11.2608ZM23.6067 21.1624C24.0755 19.9737 25.7579 19.9737 26.2266 21.1624L27.0594 23.2739L29.1709 24.1067C30.3597 24.5755 30.3597 26.2579 29.1709 26.7266L27.0594 27.5594L26.2266 29.6709C25.7579 30.8597 24.0755 30.8597 23.6067 29.6709L22.7739 27.5594L20.6624 26.7266C19.4737 26.2579 19.4737 24.5755 20.6624 24.1067L22.7739 23.2739L23.6067 21.1624ZM24.9167 22.2699L24.2511 23.9577C24.1078 24.3207 23.8207 24.6078 23.4577 24.7511L21.7699 25.4167L23.4577 26.0823C23.8207 26.2255 24.1078 26.5127 24.2511 26.8756L24.9167 28.5634L25.5823 26.8756C25.7255 26.5127 26.0127 26.2255 26.3756 26.0823L28.0634 25.4167L26.3756 24.7511C26.0127 24.6078 25.7255 24.3207 25.5823 23.9577L24.9167 22.2699Z" fill="#0F47F2" />
  </svg>

);

const UploadCloudIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.75 9.25C19.9689 9.25 20.177 9.34567 20.3194 9.51191L23.3194 13.0119C23.589 13.3264 23.5526 13.7999 23.2381 14.0694C22.9236 14.339 22.4501 14.3026 22.1806 13.9881L20.5 12.0274V23C20.5 23.4142 20.1642 23.75 19.75 23.75C19.3358 23.75 19 23.4142 19 23V12.0274L17.3194 13.9881C17.0499 14.3026 16.5764 14.339 16.2619 14.0694C15.9474 13.7999 15.911 13.3264 16.1806 13.0119L19.1806 9.51191C19.323 9.34567 19.5311 9.25 19.75 9.25ZM14.7458 16.252C15.16 16.2497 15.4977 16.5836 15.5 16.9978C15.5023 17.412 15.1684 17.7496 14.7542 17.7519C13.6607 17.758 12.8856 17.7864 12.2974 17.8945C11.7305 17.9986 11.4025 18.1658 11.159 18.4092C10.8823 18.686 10.7018 19.0746 10.6032 19.8083C10.5016 20.5637 10.5 21.5648 10.5 23.0002V24.0002C10.5 25.4356 10.5016 26.4367 10.6032 27.1921C10.7018 27.9259 10.8823 28.3144 11.159 28.5912C11.4358 28.868 11.8243 29.0484 12.5581 29.1471C13.3135 29.2486 14.3146 29.2502 15.75 29.2502H23.75C25.1854 29.2502 26.1865 29.2486 26.9419 29.1471C27.6757 29.0484 28.0642 28.868 28.341 28.5912C28.6178 28.3144 28.7982 27.9259 28.8969 27.1921C28.9984 26.4367 29 25.4356 29 24.0002V23.0002C29 21.5648 28.9984 20.5637 28.8969 19.8083C28.7982 19.0746 28.6178 18.686 28.341 18.4092C28.0975 18.1658 27.7695 17.9986 27.2027 17.8945C26.6144 17.7864 25.8393 17.758 24.7458 17.7519C24.3316 17.7496 23.9977 17.412 24 16.9978C24.0023 16.5836 24.34 16.2497 24.7542 16.252C25.8357 16.258 26.7371 16.2839 27.4736 16.4192C28.2316 16.5584 28.8767 16.8236 29.4017 17.3486C30.0036 17.9505 30.2625 18.7084 30.3835 19.6085C30.5 20.4754 30.5 21.5778 30.5 22.9453V24.0551C30.5 25.4227 30.5 26.525 30.3835 27.392C30.2625 28.2921 30.0036 29.0499 29.4017 29.6519C28.7997 30.2538 28.0419 30.5127 27.1418 30.6337C26.2748 30.7503 25.1725 30.7502 23.8049 30.7502H15.6951C14.3275 30.7502 13.2252 30.7503 12.3583 30.6337C11.4581 30.5127 10.7003 30.2538 10.0984 29.6519C9.49643 29.0499 9.23754 28.2921 9.11652 27.392C8.99996 26.525 8.99998 25.4227 9 24.0551V22.9453C8.99998 21.5777 8.99996 20.4754 9.11652 19.6085C9.23754 18.7084 9.49643 17.9505 10.0984 17.3486C10.6233 16.8236 11.2684 16.5584 12.0264 16.4192C12.7629 16.2839 13.6643 16.258 14.7458 16.252Z" fill="#0F47F2" />
  </svg>

);

const CloudIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.25" y="0.25" width="39.5" height="39.5" rx="7.75" stroke="black" stroke-opacity="0.2" stroke-width="0.5" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M19.4697 23.4697C19.7626 23.1768 20.2374 23.1768 20.5303 23.4697L22.5303 25.4697C22.8232 25.7626 22.8232 26.2374 22.5303 26.5303C22.2374 26.8232 21.7626 26.8232 21.4697 26.5303L20.75 25.8107V30C20.75 30.4142 20.4142 30.75 20 30.75C19.5858 30.75 19.25 30.4142 19.25 30V25.8107L18.5303 26.5303C18.2374 26.8232 17.7626 26.8232 17.4697 26.5303C17.1768 26.2374 17.1768 25.7626 17.4697 25.4697L19.4697 23.4697Z" fill="#0F47F2" />
    <path d="M20.4762 11.75C17.7261 11.75 15.5119 13.9508 15.5119 16.6471C15.5119 17.1092 15.5766 17.5555 15.6973 17.9781C16.1945 18.1216 16.6599 18.3389 17.0804 18.6171C17.4259 18.8456 17.5207 19.3109 17.2922 19.6564C17.0637 20.0019 16.5983 20.0967 16.2529 19.8681C15.8721 19.6162 15.4392 19.4355 14.9733 19.3451C14.7515 19.3021 14.5216 19.2794 14.2857 19.2794C12.3246 19.2794 10.75 20.8482 10.75 22.7647C10.75 24.6812 12.3246 26.25 14.2857 26.25C14.6999 26.25 15.0357 26.5858 15.0357 27C15.0357 27.4142 14.6999 27.75 14.2857 27.75C11.513 27.75 9.25 25.5264 9.25 22.7647C9.25 20.0605 11.4199 17.8721 14.1135 17.7823C14.0467 17.4135 14.0119 17.0341 14.0119 16.6471C14.0119 13.1057 16.9145 10.25 20.4762 10.25C23.6343 10.25 26.2724 12.4937 26.8314 15.4713C29.1313 16.4475 30.75 18.7093 30.75 21.3529C30.75 24.4269 28.5623 26.9843 25.6568 27.6057C25.2518 27.6923 24.8532 27.4341 24.7666 27.0291C24.68 26.624 24.9381 26.2254 25.3432 26.1388C27.5829 25.6598 29.25 23.693 29.25 21.3529C29.25 19.2162 27.8607 17.3909 25.9124 16.7246C25.4038 16.5507 24.8568 16.4559 24.2857 16.4559C23.7031 16.4559 23.1455 16.5546 22.6283 16.7353C22.2372 16.8719 21.8095 16.6656 21.6729 16.2745C21.5363 15.8835 21.7426 15.4557 22.1336 15.3192C22.8079 15.0836 23.5326 14.9559 24.2857 14.9559C24.5812 14.9559 24.8723 14.9756 25.1577 15.0137C24.477 13.1163 22.6422 11.75 20.4762 11.75Z" fill="#0F47F2" />
  </svg>

);

// Mini icons for modal
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const CalendarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

// ── Stat Card (Redesigned) ──
const StatCard = ({ title, value, change, changeText, icon: Icon }: any) => (
  <div className="bg-white rounded-[12px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col gap-3 min-w-[180px] flex-1 border border-gray-100">
    <div className="flex items-center justify-between">
      <Icon />
      <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full">
        <span className="text-xs font-medium text-green-600">{change}</span>
        <span className="text-xs text-gray-400">{changeText}</span>
      </div>
    </div>
    <div>
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-[32px] font-semibold text-gray-800 leading-tight">{value}</div>
    </div>
  </div>
);

// ── Source filter options ──
const SOURCE_OPTIONS = [
  {
    value: "Naukbot",
    label: "Naukbot",
    logo: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 19C14.7469 19 19 14.7469 19 9.5C19 4.25308 14.7469 0 9.5 0C4.25308 0 0 4.25308 0 9.5C0 14.7469 4.25308 19 9.5 19Z" fill="#0F47F2" />
        <path d="M12.3542 13.0156L12.3347 13.9803L12.2714 16.762V16.8692C7.57498 12.8013 6.77113 11.8123 6.63472 11.5103V11.5005C6.61523 11.442 6.61036 11.3836 6.62011 11.3251C6.62011 11.3056 6.62985 11.2813 6.63472 11.2618C6.63472 11.2423 6.64446 11.2277 6.64934 11.2082C6.69805 11.0767 6.77113 10.95 6.8637 10.8428C6.92703 10.76 7.00011 10.682 7.07318 10.609C7.23395 10.4482 7.40934 10.302 7.58959 10.1656C7.68216 10.0974 7.77472 10.0292 7.87703 9.96102C8.0719 9.82948 8.28139 9.69794 8.50062 9.56641C10.1911 11.14 12.3298 12.9962 12.3591 13.0205L12.3542 13.0156Z" fill="url(#paint0_linear_4468_2998)" />
        <path d="M12.4185 3.88768L12.399 4.8523L12.3893 5.32974L12.3698 6.28948L12.3601 6.77179L12.3406 7.7364C12.3065 7.75102 10.1629 8.57922 8.51135 9.56332C8.29212 9.69486 8.08263 9.8264 7.88776 9.95794C7.79032 10.0261 7.69289 10.0944 7.60032 10.1626C7.4152 10.299 7.24468 10.4451 7.08391 10.6059C7.01084 10.679 6.93776 10.7569 6.87443 10.8397C6.7234 11.0297 6.63571 11.2149 6.62109 11.3902L6.64058 10.5864V10.4549V10.411L6.6552 9.90435L6.68443 8.90076L6.69904 8.40871L6.72827 7.41486C7.0693 6.02153 11.8631 4.10204 12.4283 3.88281L12.4185 3.88768Z" fill="white" />
        <path d="M7.99389 4.94871C8.77337 4.94871 9.40183 4.31538 9.40183 3.54076C9.40183 2.76615 8.7685 2.13281 7.99389 2.13281C7.21927 2.13281 6.58594 2.76615 6.58594 3.54076C6.58594 4.31538 7.21927 4.94871 7.99389 4.94871Z" fill="white" />
        <defs>
          <linearGradient id="paint0_linear_4468_2998" x1="11.3847" y1="14.4772" x2="5.81139" y2="8.05128" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="1" stopColor="#B1B1B1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: "Naukri",
    label: "Naukri",
    logo: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 19C14.7469 19 19 14.7469 19 9.5C19 4.25308 14.7469 0 9.5 0C4.25308 0 0 4.25308 0 9.5C0 14.7469 4.25308 19 9.5 19Z" fill="#4285F4" />
        <path d="M7.99389 4.94871C8.77337 4.94871 9.40183 4.31538 9.40183 3.54076C9.40183 2.76615 8.7685 2.13281 7.99389 2.13281C7.21927 2.13281 6.58594 2.76615 6.58594 3.54076C6.58594 4.31538 7.21927 4.94871 7.99389 4.94871Z" fill="white" />
      </svg>
    ),
  },
  {
    value: "Manual Upload",
    label: "Manual Upload",
    logo: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9.5" cy="9.5" r="9.5" fill="#10B981" />
        <path d="M9.5 5.5v8M5.5 9.5h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

// ── Sort config ──
type SortKey = 'created_at' | 'experience';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: Record<string, string> = {
  created_at_desc: 'Newest First',
  created_at_asc: 'Oldest First',
  experience_desc: 'Exp: High to Low',
  experience_asc: 'Exp: Low to High',
};

const PAGE_LIMIT = 15;

// ── Move to Pipeline Modal ──
interface MoveToPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCandidates: V1Candidate[];
  workspaces: V1Workspace[];
  jobs: V1Job[];
  onSuccess: () => void;
}

const MoveToPipelineModal = ({ isOpen, onClose, selectedCandidates, workspaces, jobs, onSuccess }: MoveToPipelineModalProps) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string>('');
  const [selectedJobId, setSelectedJobId] = React.useState<string>('');
  const [selectedStageId, setSelectedStageId] = React.useState<string>('');
  const [stages, setStages] = React.useState<{ id: number; name: string }[]>([]);
  const [loadingStages, setLoadingStages] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ added: number; skipped: number } | null>(null);

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setSelectedWorkspaceId('');
      setSelectedJobId('');
      setSelectedStageId('');
      setStages([]);
      setResult(null);
    }
  }, [isOpen]);

  // Fetch pipeline stages when job changes
  React.useEffect(() => {
    if (!selectedJobId) {
      setStages([]);
      setSelectedStageId('');
      return;
    }
    let cancelled = false;
    const fetchStages = async () => {
      setLoadingStages(true);
      try {
        const data = await candidateService.getPipelineStages(Number(selectedJobId));
        if (!cancelled) {
          setStages(data.map(s => ({ id: s.id, name: s.name })));
        }
      } catch (err) {
        console.error('Failed to fetch stages', err);
      } finally {
        if (!cancelled) setLoadingStages(false);
      }
    };
    fetchStages();
    return () => { cancelled = true; };
  }, [selectedJobId]);

  const handleSubmit = async () => {
    if (!selectedJobId || !selectedStageId || selectedCandidates.length === 0) return;
    setSubmitting(true);
    try {
      const res = await candidateSearchService.moveToPipeline(Number(selectedJobId), {
        candidate_ids: selectedCandidates.map(c => c.id),
        target_stage_id: Number(selectedStageId),
      });
      setResult({ added: res.added_count, skipped: res.skipped_count });
      // Auto-close after 1.5s on success
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to move candidates');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl w-[600px] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Move to Pipeline</h2>
            <p className="text-sm text-gray-400">
              Move {selectedCandidates.length} selected candidate{selectedCandidates.length > 1 ? 's' : ''} into a job pipeline
            </p>
          </div>
          <button onClick={onClose} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Candidate cards */}
        <div className="p-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Selected Candidates<span className="text-red-500">*</span>
          </label>
          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 mb-6 max-h-[160px] overflow-y-auto custom-scrollbar">
            {selectedCandidates.map(c => (
              <div key={c.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
                  <p className="text-xs text-blue-600">{c.designation || c.jobRole?.title || '—'} {c.currentCompany || c.client?.name ? `- ${c.currentCompany || c.client?.name}` : ''}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {c.experience != null && <span>{c.experience} yrs</span>}
                  {c.location && <span className="flex items-center gap-1"><MapPinIcon /> {c.location}</span>}
                  {c.noticePeriod && <span className="flex items-center gap-1"><CalendarIcon /> {c.noticePeriod}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Result banner */}
          {result && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ✓ {result.added} added, {result.skipped} skipped
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Company <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedWorkspaceId}
                onChange={(e) => { setSelectedWorkspaceId(e.target.value); setSelectedJobId(''); setSelectedStageId(''); setStages([]); }}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none"
              >
                <option value="" disabled>Select company...</option>
                {workspaces.map(ws => (
                  <option key={ws.id} value={String(ws.id)}>{ws.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => { setSelectedJobId(e.target.value); setSelectedStageId(''); }}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none"
                disabled={!selectedWorkspaceId}
              >
                <option value="" disabled>Select role...</option>
                {jobs.map(j => (
                  <option key={j.id} value={String(j.id)}>{j.title} (#{j.job_id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Stage <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStageId}
                onChange={(e) => setSelectedStageId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none"
                disabled={!selectedJobId || loadingStages}
              >
                <option value="" disabled>{loadingStages ? 'Loading stages...' : 'Select stage...'}</option>
                {stages.map(s => (
                  <option key={s.id} value={String(s.id)}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedJobId || !selectedStageId || submitting}
            className="flex-[2] py-3 bg-[#0F47F2] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Move to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Export Dropdown ──
const ExportDropdown = ({
  isOpen, onClose, onExport
}: {
  isOpen: boolean; onClose: () => void; onExport: (format: 'csv' | 'xlsx') => void
}) => {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-12 w-44 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-xl py-2 z-50 border border-gray-100">
        <button onClick={() => { onExport('csv'); onClose(); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
          <DownloadCloud className="w-4 h-4" /> Export CSV
        </button>
        <button onClick={() => { onExport('xlsx'); onClose(); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
          <DownloadCloud className="w-4 h-4" /> Export XLSX
        </button>
      </div>
    </>
  );
};

// ── Sort button helper ──
const SortIndicator = ({ column, currentSort }: { column: SortKey; currentSort: string }) => {
  if (currentSort === `${column}_asc`) return <ArrowUp className="w-3 h-3 ml-1 inline" />;
  if (currentSort === `${column}_desc`) return <ArrowDown className="w-3 h-3 ml-1 inline" />;
  return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-30" />;
};

// ── Helper: format date ──
function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Helper: build API request from component state ──
function buildSearchRequest(
  searchQuery: string,
  page: number,
  sortBy: string,
  filters: FiltersState,
  workspaceMap: Map<string, number>,
  jobMap: Map<string, number>,
): V1SearchRequest {
  const req: V1SearchRequest = {
    pagination: { page, limit: PAGE_LIMIT },
    sort_by: sortBy,
  };

  if (searchQuery.trim()) {
    req.searchQuery = searchQuery.trim();
  }

  const apiFilters: any = {};

  // Location
  if (filters.location.length > 0) {
    apiFilters.location = filters.location;
  }

  // Clients → clientIds
  if (filters.clients.length > 0) {
    const ids = filters.clients
      .map(c => workspaceMap.get(c))
      .filter((id): id is number => id !== undefined);
    if (ids.length > 0) apiFilters.clientIds = ids;
  }

  // Experience
  if (filters.experience.min || filters.experience.max) {
    apiFilters.experience = {};
    if (filters.experience.min) apiFilters.experience.min = Number(filters.experience.min);
    if (filters.experience.max) apiFilters.experience.max = Number(filters.experience.max);
  }

  // Job Role → jobIds
  if (filters.jobRole.length > 0) {
    const ids = filters.jobRole
      .map(j => jobMap.get(j))
      .filter((id): id is number => id !== undefined);
    if (ids.length > 0) apiFilters.jobIds = ids;
  }

  // Notice Period
  if (filters.noticePeriod.selected.length > 0 || filters.noticePeriod.minDays || filters.noticePeriod.maxDays) {
    apiFilters.noticePeriod = {};
    if (filters.noticePeriod.selected.length > 0) apiFilters.noticePeriod.selected = filters.noticePeriod.selected;
    if (filters.noticePeriod.minDays) apiFilters.noticePeriod.minDays = Number(filters.noticePeriod.minDays);
    if (filters.noticePeriod.maxDays) apiFilters.noticePeriod.maxDays = Number(filters.noticePeriod.maxDays);
  }

  // Date Created
  if (filters.dateCreated.type) {
    apiFilters.dateCreated = { type: filters.dateCreated.type };
    if (filters.dateCreated.type === 'Custom') {
      if (filters.dateCreated.from) apiFilters.dateCreated.from = filters.dateCreated.from;
      if (filters.dateCreated.to) apiFilters.dateCreated.to = filters.dateCreated.to;
    }
  }

  // Source
  if (filters.source.length > 0) {
    apiFilters.source = filters.source;
  }

  if (Object.keys(apiFilters).length > 0) {
    req.filters = apiFilters;
  }

  return req;
}

// ── Pagination helper ──
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

// ══════════════════════════════════════════════
// ██  Main Component
// ══════════════════════════════════════════════

export default function CandidateSearch() {
  // ── UI state ──
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const filterButtonRef = React.useRef<HTMLButtonElement>(null);

  // ── Filter state ──
  const [filters, setFilters] = React.useState<FiltersState>({
    location: [],
    clients: [],
    experience: { min: "", max: "" },
    jobRole: [],
    noticePeriod: { selected: [], minDays: "", maxDays: "" },
    dateCreated: { type: "", from: "", to: "" },
    source: [],
  });

  // ── Search, sort, pagination ──
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState('created_at_desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);

  // ── Data ──
  const [candidates, setCandidates] = React.useState<V1Candidate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [workspaces, setWorkspaces] = React.useState<V1Workspace[]>([]);
  const [jobs, setJobs] = React.useState<V1Job[]>([]);

  // ── Stats ──
  const [stats, setStats] = React.useState<V1CandidateStats | null>(null);

  // ── Selection ──
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // ── Dropdown options ──
  const [optionsData, setOptionsData] = React.useState<any>({
    location: [],
    clients: [],
    experience: [],
    jobRole: [],
    noticePeriod: [
      { value: "1 Month", label: "1 Month" },
      { value: "2 Month", label: "2 Month" },
      { value: "3 Month", label: "3 Month" },
    ],
    dateCreated: [],
    source: SOURCE_OPTIONS,
  });

  // Maps for name→id lookups
  const workspaceMapRef = React.useRef<Map<string, number>>(new Map());
  const jobMapRef = React.useRef<Map<string, number>>(new Map());
  const logoRequestedRef = React.useRef<Set<string>>(new Set());

  // ── Debounce search ──
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Fetch stats on mount ──
  React.useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const data = await candidateSearchService.getCandidateStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        console.error('Failed to fetch candidate stats', err);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch dropdown data on mount ──
  React.useEffect(() => {
    let cancelled = false;

    const fetchDropdownData = async () => {
      try {
        const [wsData, jobsData] = await Promise.all([
          candidateSearchService.getWorkspaces().catch(() => []),
          candidateSearchService.getJobs().catch(() => []),
        ]);

        if (cancelled) return;

        setWorkspaces(wsData);
        setJobs(jobsData);

        // Build workspace map & options
        const wsMap = new Map<string, number>();
        const clientOptions = wsData.map((ws: V1Workspace) => {
          wsMap.set(ws.name, ws.id);
          return { value: ws.name, label: ws.name, logo: undefined as any };
        });
        workspaceMapRef.current = wsMap;

        // Build job map & options
        const jMap = new Map<string, number>();
        const jobOptions = jobsData.map((j: V1Job) => {
          const val = String(j.id);
          jMap.set(val, j.id);
          return { value: val, label: j.title, subLabel: `Job ID: ${j.job_id}` };
        });
        jobMapRef.current = jMap;

        setOptionsData((prev: any) => ({
          ...prev,
          clients: clientOptions,
          jobRole: jobOptions,
        }));

        // Fetch logos for clients
        wsData.forEach((ws: V1Workspace) => {
          const name = ws.name;
          if (name && !logoRequestedRef.current.has(name)) {
            logoRequestedRef.current.add(name);
            const apiKey = import.meta.env.VITE_LOGO_DEV_API_KEY;
            if (apiKey) {
              fetch(`https://api.logo.dev/search?q=${encodeURIComponent(name)}`, {
                headers: { Authorization: `Bearer ${apiKey}` }
              })
                .then(res => res.json())
                .then(data => {
                  if (cancelled) return;
                  const logoUrl = data.length > 0 ? data[0].logo_url : null;
                  if (logoUrl) {
                    setOptionsData((prev: any) => ({
                      ...prev,
                      clients: prev.clients.map((c: any) => c.value === name ? { ...c, logo: logoUrl } : c),
                    }));
                  }
                }).catch(() => { });
            }
          }
        });
      } catch (err) {
        console.error("Failed to load dropdown data", err);
      }
    };

    fetchDropdownData();
    return () => { cancelled = true; };
  }, []);

  // ── Fetch candidates ──
  React.useEffect(() => {
    let cancelled = false;

    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const req = buildSearchRequest(
          debouncedQuery,
          currentPage,
          sortBy,
          filters,
          workspaceMapRef.current,
          jobMapRef.current,
        );
        const res = await candidateSearchService.searchCandidates(req);
        if (!cancelled) {
          setCandidates(res.data?.candidates || []);
          setTotalCount(res.data?.totalCount || 0);
          setTotalPages(res.data?.totalPages || 0);
          setCurrentPage(res.data?.currentPage || 1);
        }
      } catch (err) {
        console.error("Failed to fetch candidates", err);
        if (!cancelled) {
          setCandidates([]);
          setTotalCount(0);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    fetchCandidates();
    return () => { cancelled = true; };
  }, [debouncedQuery, currentPage, sortBy, filters]);

  // ── Filter count ──
  const totalFiltersApplied = Object.entries(filters).reduce((acc, [key, val]) => {
    if (key === 'experience') {
      const exp = val as FiltersState['experience'];
      return acc + (exp.min ? 1 : 0) + (exp.max ? 1 : 0);
    }
    if (key === 'noticePeriod') {
      const np = val as FiltersState['noticePeriod'];
      return acc + np.selected.length + (np.minDays ? 1 : 0) + (np.maxDays ? 1 : 0);
    }
    if (key === 'dateCreated') {
      const dc = val as FiltersState['dateCreated'];
      return acc + (dc.type ? 1 : 0);
    }
    if (Array.isArray(val)) {
      return acc + val.length;
    }
    return acc;
  }, 0);

  // ── Handlers ──
  const handleApplyFilters = (newFilters: FiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSort = (column: SortKey) => {
    setSortBy(prev => {
      if (prev === `${column}_desc`) return `${column}_asc`;
      return `${column}_desc`;
    });
    setCurrentPage(1);
  };

  const handleSelectCandidate = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === candidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(candidates.map(c => c.id)));
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      if (selectedIds.size > 0) {
        await candidateSearchService.exportCandidates({
          format,
          candidate_ids: Array.from(selectedIds),
        });
      } else {
        // Export with current search payload
        const searchPayload = buildSearchRequest(
          debouncedQuery, 1, sortBy, filters,
          workspaceMapRef.current, jobMapRef.current,
        );
        await candidateSearchService.exportCandidates({
          format,
          search_payload: searchPayload,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Export failed');
    }
  };

  const handleShare = async () => {
    if (selectedIds.size === 0) return;
    try {
      const res = await candidateSearchService.shareCandidates({
        candidate_ids: Array.from(selectedIds),
      });
      // Copy first share URL to clipboard or show success
      if (res.data && res.data.length > 0) {
        const urls = res.data.map(d => d.share_url).join('\n');
        await navigator.clipboard.writeText(urls);
        alert(`${res.count} share link(s) copied to clipboard`);
      }
    } catch (err: any) {
      alert(err.message || 'Share failed');
    }
  };

  const handleActionClick = (id: string) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // ── Pagination ──
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const showingStart = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const showingEnd = Math.min(currentPage * PAGE_LIMIT, totalCount);

  const selectedCandidates = candidates.filter(c => selectedIds.has(c.id));

  // ── Skeleton rows (updated for new 10-column layout) ──
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-4"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32 mb-1" /><div className="h-3 bg-gray-100 rounded w-20" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    </tr>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 h-full custom-scrollbar relative">
      <div className="w-full p-6 space-y-6">

        {/* Stat Cards */}
        <div className="flex flex-wrap gap-4">
          <StatCard
            title="Total Candidates"
            value={stats ? stats.totalCandidates.toLocaleString() : (totalCount > 0 ? totalCount.toLocaleString() : '—')}
            change={stats?.totalCandidatesChange || '10%'}
            changeText={stats?.totalCandidatesChangeText || 'vs last month'}
            icon={BriefcaseIcon}
          />
          <StatCard
            title="Total Hired"
            value={stats ? stats.totalHired.toLocaleString() : '—'}
            change={stats?.totalHiredChange || '+42'}
            changeText={stats?.totalHiredChangeText || 'this month'}
            icon={UserCheckIcon}
          />
          <StatCard
            title="Via Naukbot"
            value={stats ? stats.viaNaukbot.toLocaleString() : '—'}
            change={stats?.viaNaukbotChange || '+42'}
            changeText={stats?.viaNaukbotChangeText || 'this month'}
            icon={BotIcon}
          />
          <StatCard
            title="Manual Uploads"
            value={stats ? stats.manualUploads.toLocaleString() : '—'}
            change={stats?.manualUploadsChange || '+25'}
            changeText={stats?.manualUploadsChangeText || 'this month'}
            icon={UploadCloudIcon}
          />
          <StatCard
            title="Others"
            value={stats ? stats.others.toLocaleString() : '—'}
            change={stats?.othersChange || '+25'}
            changeText={stats?.othersChangeText || 'this month'}
            icon={CloudIcon}
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-t-xl border-b border-gray-100 flex items-center justify-between mt-6 border border-gray-200 border-b-0">
          <div className="flex items-center py-3 px-4 flex-1">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 min-w-[300px] bg-white">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for Candidates, Companies, Skills"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="outline-none text-sm w-full bg-transparent placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative inline-block">
              <button
                ref={filterButtonRef}
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`ml-4 flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${isFilterPanelOpen || totalFiltersApplied > 0
                  ? "border-[#0F47F2] text-[#0F47F2] bg-blue-50/50"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2H14" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M5.33325 6H10.6666" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M2 10H14" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M5.33325 14H10.6666" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Filters
                {totalFiltersApplied > 0 && (
                  <span className="bg-[#0F47F2] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ml-1">
                    {totalFiltersApplied}
                  </span>
                )}
              </button>

              <CandidateFilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
                anchorRef={filterButtonRef}
                optionsData={optionsData}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pr-4">
            {/* Calendar button */}
            <button
              className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50"
              title="Calendar view"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 1.66602V3.33268M5 1.66602V3.33268" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M8.33333 14.1663L8.33332 11.1224C8.33332 10.9626 8.21938 10.833 8.07882 10.833H7.5M11.358 14.1663L12.4868 11.124C12.5396 10.9817 12.4274 10.833 12.2672 10.833H10.8333" stroke="#374151" stroke-linecap="round" />
                <path d="M2.0835 10.2027C2.0835 6.57161 2.0835 4.75607 3.12693 3.62803C4.17036 2.5 5.84974 2.5 9.2085 2.5H10.7918C14.1506 2.5 15.83 2.5 16.8734 3.62803C17.9168 4.75607 17.9168 6.57161 17.9168 10.2027V10.6306C17.9168 14.2617 17.9168 16.0773 16.8734 17.2053C15.83 18.3333 14.1506 18.3333 10.7918 18.3333H9.2085C5.84974 18.3333 4.17036 18.3333 3.12693 17.2053C2.0835 16.0773 2.0835 14.2617 2.0835 10.6306V10.2027Z" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 6.66602H15" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
              </svg>

            </button>
            {/* Export button */}
            <div className="relative">
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50"
                title="Export"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.6998 7.41699C16.6998 7.67533 17.9248 9.21699 17.9248 12.592V12.7003C17.9248 16.4253 16.4331 17.917 12.7081 17.917H7.28307C3.55807 17.917 2.06641 16.4253 2.06641 12.7003V12.592C2.06641 9.24199 3.27474 7.70032 6.22474 7.42532" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M10 12.4999V3.0166" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M12.7918 4.87467L10.0001 2.08301L7.2085 4.87467" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                </svg>


              </button>
              <ExportDropdown isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} onExport={handleExport} />
            </div>
            {/* Grid/Expand button */}
            <button
              className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50"
              title="Expand view"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.49935 18.3337H12.4993C16.666 18.3337 18.3327 16.667 18.3327 12.5003V7.50033C18.3327 3.33366 16.666 1.66699 12.4993 1.66699H7.49935C3.33268 1.66699 1.66602 3.33366 1.66602 7.50033V12.5003C1.66602 16.667 3.33268 18.3337 7.49935 18.3337Z" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M10 1.66699V18.3337" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M1.66602 7.91699H9.99935" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M10 12.084H18.3333" stroke="#374151" stroke-linecap="round" stroke-linejoin="round" />
              </svg>

            </button>
            {/* Add Candidate button */}
            <button
              className="bg-[#0F47F2] hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add Candidate
            </button>
          </div>
        </div>

        {/* Bulk Selection Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-white border-x border-gray-200 flex items-center gap-4 px-4 py-3 -mt-6">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#0F47F2]" />
              <span className="text-sm text-gray-700 font-medium">
                {selectedIds.size} Candidate{selectedIds.size > 1 ? 's' : ''} are selected
              </span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0F47F2] hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Move to Pipeline
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <DownloadCloud className="w-4 h-4" /> Download
            </button>
            <button
              onClick={handleShare}
              className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        )}

        {/* Table */}
        <div className={`bg-white border rounded-b-xl border-t-0 border-gray-200 ${selectedIds.size > 0 ? '-mt-6' : ''}`}>
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 w-4 h-4 cursor-pointer"
                      checked={candidates.length > 0 && selectedIds.size === candidates.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 text-nowrap">Candidate</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 text-nowrap">Designation</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 text-nowrap">Location</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 cursor-pointer select-none text-nowrap" onClick={() => handleSort('experience')}>
                    Exp <SortIndicator column="experience" currentSort={sortBy} />
                  </th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 text-nowrap">Current CTC</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 text-nowrap">Expected</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 text-nowrap">Notice</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 text-nowrap">Status</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500 text-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : candidates.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Users className="w-12 h-12 stroke-[1.5]" />
                        <div className="text-lg font-medium text-gray-500">No candidates found</div>
                        <div className="text-sm">Try adjusting your search or filters</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 group relative">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 w-4 h-4 cursor-pointer"
                          checked={selectedIds.has(c.id)}
                          onChange={() => handleSelectCandidate(c.id)}
                        />
                      </td>
                      {/* CANDIDATE: name + actual company */}
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer text-nowrap">{c.name || '—'}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {c.currentCompany || c.client?.name || '—'}
                          </div>
                        </div>
                      </td>
                      {/* DESIGNATION: actual designation from profile */}
                      <td className="p-4 font-semibold text-gray-700 text-nowrap">{c.designation || c.jobRole?.title || '—'}</td>
                      {/* LOCATION */}
                      <td className="p-4 text-gray-600 text-nowrap">{c.location || '—'}</td>
                      {/* EXP */}
                      <td className="p-4 text-gray-600 text-nowrap">{c.experience != null ? `${c.experience} yrs` : '—'}</td>
                      {/* CURRENT CTC */}
                      <td className="p-4 text-gray-600 text-nowrap">{c.currentCtc ? `₹${c.currentCtc}` : '—'}</td>
                      {/* EXPECTED CTC */}
                      <td className="p-4 font-medium text-green-600 text-nowrap">{c.expectedCtc ? `₹${c.expectedCtc}` : '—'}</td>
                      {/* NOTICE */}
                      <td className="p-4 font-medium text-amber-500 text-nowrap">{c.noticePeriod || '—'}</td>
                      {/* STATUS */}
                      <td className="p-4 text-nowrap">
                        <span className={`text-sm font-medium ${(c.status || 'Available') === 'Available' ? 'text-green-600' : 'text-red-500'
                          }`}>
                          {c.status || 'Available'}
                        </span>
                      </td>
                      {/* ACTIONS */}
                      <td className="p-4 text-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedIds(new Set([c.id]));
                              setIsModalOpen(true);
                            }}
                            className="px-4 py-2 bg-[#0F47F2] text-white text-xs font-semibold rounded-[6px] hover:bg-green-600 transition-colors whitespace-nowrap"
                          >
                            Move to Pipeline
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => handleActionClick(c.id)}
                              className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 focus:outline-none"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {activeMenuId === c.id && (
                              <div className="absolute right-0 top-10 w-40 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-xl py-2 z-50 border border-gray-100">
                                {c.phone && (
                                  <a href={`tel:${c.phone}`} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                    <Phone className="w-4 h-4" /> Call
                                  </a>
                                )}
                                {c.email && (
                                  <a href={`mailto:${c.email}`} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                    <Mail className="w-4 h-4" /> Mail
                                  </a>
                                )}
                                <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                  <FileText className="w-4 h-4" /> View Resume
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">
              {totalCount > 0
                ? `Showing ${showingStart}–${showingEnd} of ${totalCount.toLocaleString()}`
                : 'No results'}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {pageNumbers.map((p, idx) =>
                  p === '...' ? (
                    <span key={`dots-${idx}`} className="px-1 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${currentPage === p
                        ? 'bg-[#0F47F2] text-white'
                        : 'hover:bg-gray-50 text-gray-600'
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 border border-gray-200 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      <MoveToPipelineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedCandidates={selectedCandidates}
        workspaces={workspaces}
        jobs={jobs}
        onSuccess={() => {
          setSelectedIds(new Set());
          // Re-trigger search
          setCurrentPage(p => p);
        }}
      />

      {/* Invisible overlay to close popover when clicking anywhere else */}
      {activeMenuId !== null && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveMenuId(null)}
        />
      )}
    </div>
  );
}
