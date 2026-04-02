import React from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  DownloadCloud, 
  LayoutGrid, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import CandidateFilterPanel, { FiltersState } from './components/CandidateFilterPanel';

// Icons for the stat cards based on the mockup colors and style
const BriefcaseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const UserCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <polyline points="17 11 19 13 23 9"></polyline>
  </svg>
);

const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);

const UploadCloudIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"></polyline>
    <line x1="12" y1="12" x2="12" y2="21"></line>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
    <polyline points="16 16 12 12 8 16"></polyline>
  </svg>
);

const CloudIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
  </svg>
);

// Stat Card Component
const StatCard = ({ title, value, change, changeText, positive, icon: Icon }: any) => (
  <div className="bg-white rounded-[12px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col gap-3 min-w-[240px] flex-1 border border-gray-100">
    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50">
      <Icon />
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium ${positive ? 'text-green-500' : 'text-green-500'}`}>{change}</span>
      <span className="text-sm text-gray-400">{changeText}</span>
    </div>
    <div>
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-[32px] font-semibold text-gray-800 leading-tight">{value}</div>
    </div>
  </div>
);

// Move to Pipeline Modal Component
const MoveToPipelineModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl w-[600px] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Candidate Move to pipeline</h2>
            <p className="text-sm text-gray-400">Move selected candidates into a job pipeline</p>
          </div>
          <button onClick={onClose} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Selected Candidate<span className="text-red-500">*</span>
          </label>
          
          {/* Candidate Card */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Max Verstappen</h3>
                <p className="text-sm text-blue-600">Senior Product Designer - Jupiter</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500 flex items-center justify-center text-[8px] font-bold text-white">PDF</div>
                <span className="text-sm text-gray-600">Maxverstappen Resume.pdf</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1.5"><BriefcaseIcon /> 5 years</div>
              <div className="flex items-center gap-1.5"><MapPinIcon /> Bengaluru, Karnataka</div>
              <div className="flex items-center gap-1.5"><WalletIcon /> 13 LPA</div>
              <div className="flex items-center gap-1.5"><WalletIcon /> 16 LPA</div>
              <div className="flex items-center gap-1.5"><CalendarIcon /> 30 Days</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Company <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none">
                <option value="" disabled selected>Select stage...</option>
                <option value="google">Google</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Roles <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none">
                <option value="" disabled selected>Select stage...</option>
                <option value="pd">Product Designer</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Stage <span className="text-red-500">*</span>
              </label>
              <select className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm appearance-none">
                <option value="" disabled selected>Select stage...</option>
                <option value="interview">Interview</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button className="flex-[2] py-3 bg-[#0F47F2] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Move to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};

// Mini icons for modal
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const WalletIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>;
const CalendarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;


import { jobPostService } from '../../services/jobPostService';
import organizationService from '../../services/organizationService';

const MOCK_LOCATIONS = [
  "Bangalore",
  "Chennai",
  "Delhi NCR",
  "Indore",
  "Pune",
  "Hyderabad",
  "Ahmedabad",
  "Jaipur",
];

const MOCK_EXPERIENCE = ["0-2 yrs", "3-5 yrs", "6-8 yrs", "9-12 yrs", "12+ yrs"];
const MOCK_NOTICE_PERIODS = ["Immediate", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days"];
const MOCK_DATE_CREATED = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Month"];

const SOURCE_OPTIONS = [
  {
    value: "naukri",
    label: "Naukri",
    logo: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 19C14.7469 19 19 14.7469 19 9.5C19 4.25308 14.7469 0 9.5 0C4.25308 0 0 4.25308 0 9.5C0 14.7469 4.25308 19 9.5 19Z" fill="#0F47F2"/>
        <path d="M12.3542 13.0156L12.3347 13.9803L12.2714 16.762V16.8692C7.57498 12.8013 6.77113 11.8123 6.63472 11.5103V11.5005C6.61523 11.442 6.61036 11.3836 6.62011 11.3251C6.62011 11.3056 6.62985 11.2813 6.63472 11.2618C6.63472 11.2423 6.64446 11.2277 6.64934 11.2082C6.69805 11.0767 6.77113 10.95 6.8637 10.8428C6.92703 10.76 7.00011 10.682 7.07318 10.609C7.23395 10.4482 7.40934 10.302 7.58959 10.1656C7.68216 10.0974 7.77472 10.0292 7.87703 9.96102C8.0719 9.82948 8.28139 9.69794 8.50062 9.56641C10.1911 11.14 12.3298 12.9962 12.3591 13.0205L12.3542 13.0156Z" fill="url(#paint0_linear_4468_2998)"/>
        <path d="M12.4185 3.88768L12.399 4.8523L12.3893 5.32974L12.3698 6.28948L12.3601 6.77179L12.3406 7.7364C12.3065 7.75102 10.1629 8.57922 8.51135 9.56332C8.29212 9.69486 8.08263 9.8264 7.88776 9.95794C7.79032 10.0261 7.69289 10.0944 7.60032 10.1626C7.4152 10.299 7.24468 10.4451 7.08391 10.6059C7.01084 10.679 6.93776 10.7569 6.87443 10.8397C6.7234 11.0297 6.63571 11.2149 6.62109 11.3902L6.64058 10.5864V10.4549V10.411L6.6552 9.90435L6.68443 8.90076L6.69904 8.40871L6.72827 7.41486C7.0693 6.02153 11.8631 4.10204 12.4283 3.88281L12.4185 3.88768Z" fill="white"/>
        <path d="M7.99389 4.94871C8.77337 4.94871 9.40183 4.31538 9.40183 3.54076C9.40183 2.76615 8.7685 2.13281 7.99389 2.13281C7.21927 2.13281 6.58594 2.76615 6.58594 3.54076C6.58594 4.31538 7.21927 4.94871 7.99389 4.94871Z" fill="white"/>
        <defs>
          <linearGradient id="paint0_linear_4468_2998" x1="11.3847" y1="14.4772" x2="5.81139" y2="8.05128" gradientUnits="userSpaceOnUse">
            <stop stop-color="white" />
            <stop offset="1" stop-color="#B1B1B1" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: "pyjamahr",
    label: "PyjamaHR",
    logo: (
      <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9.5" cy="9.5" r="9.5" fill="#2E6EE7"/>
        <path d="M6.92484 10.961C6.92484 10.961 7.49132 10.2227 8.0578 9.6644C8.62428 9.10613 9.40742 8.5284 10.4287 8.77726C11.45 9.02611 11.5332 9.77366 11.4819 10.4721L11.4831 10.4419C11.5332 9.77366 12.1645 8.94042 12.9463 8.71804C13.7276 8.49526 14.5029 8.71078 14.9754 9.1832C15.4474 9.65561 15.656 10.2642 15.5413 10.9602V13.88C15.5413 14.0152 15.4317 14.1245 15.2965 14.1245H13.7828C13.626 14.1245 13.5042 13.9877 13.5231 13.8322L13.7717 11.7944C13.7717 11.7944 13.8427 10.5908 12.8722 10.5908C11.9016 10.5908 11.8306 11.7944 11.8306 11.7944L11.5824 13.8322C11.5635 13.9877 11.4421 14.1245 11.2849 14.1245H9.77121C9.63602 14.1245 9.52648 14.0148 9.52648 13.88V10.2882L9.52285 10.2104L9.52648 10.2882C9.52648 10.2882 9.38481 8.98404 8.25619 9.35677C7.4589 9.61907 6.92484 10.961 6.92484 10.961V13.88C6.92484 14.0152 6.81525 14.1245 6.68006 14.1245H5.16631C5.03113 14.1245 4.92154 14.0148 4.92154 13.88V5.30931C4.92154 5.25301 4.95459 5.2018 5.00762 5.17709C5.3996 4.99368 5.86457 4.88726 6.35349 4.88726C6.54924 4.88726 6.74026 4.90833 6.92484 4.94833V10.961ZM0.793282 10.6698C0.793282 10.6698 1.15762 10.1581 1.76019 9.87063C2.36277 9.58315 3.01894 9.69755 3.25358 10.0383L3.25031 9.9885C3.25358 9.54972 3.65969 9.47125 3.65969 9.47125L3.62628 13.8804C3.62628 14.0155 3.51668 14.1252 3.3815 14.1252H1.94291C1.839 14.1252 1.74818 14.0562 1.72239 13.9555L1.31268 12.3551C1.31268 12.3551 1.05078 11.1354 2.22234 11.2323C2.22234 11.2323 2.10065 11.1274 1.74603 11.0569L1.657 11.0253C1.29188 10.9163 1.03554 11.0772 1.03554 11.0772L0.793282 10.6698ZM3.58559 7.08643C3.58559 7.82845 2.98302 8.43102 2.241 8.43102C1.49898 8.43102 0.896408 7.82845 0.896408 7.08643C0.896408 6.3444 1.49898 5.74184 2.241 5.74184C2.98302 5.74184 3.58559 6.3444 3.58559 7.08643Z" fill="white"/>
      </svg>
    ),
  },
  {
    value: "external",
    label: "External",
    logo: (
      <svg width="19" height="19" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.44575 12.473C0.994198 8.48683 0.971838 5.61909 1.36811 1.70893L1.54946 1.67165L1.42577 1.19807C1.42208 1.18395 1.4224 1.17706 1.42299 1.17171C1.43772 1.04016 1.58607 0.882274 1.71679 0.860099C1.71829 0.859848 1.72084 0.859631 1.7235 0.859631C1.72819 0.859631 1.73376 0.860311 1.74056 0.861704L2.22573 0.961614L2.2512 0.778803C3.66308 0.570388 5.09042 0.464844 6.49934 0.464844C7.90846 0.464844 9.33617 0.570445 10.7483 0.778912L10.7741 0.961425L11.2582 0.8617C11.2649 0.860325 11.2706 0.859631 11.2752 0.859631C11.2779 0.859631 11.2804 0.859848 11.2833 0.860321C11.4126 0.882274 11.561 1.04014 11.5758 1.1729C11.5763 1.17715 11.5766 1.18394 11.5729 1.19807L11.4492 1.67165L11.6306 1.70893C12.0269 5.61908 12.0045 8.48676 11.5529 12.4729L11.4489 12.42L11.415 12.448C9.50322 11.4928 8.48066 10.7122 6.86783 8.60855L6.49935 8.12793L6.13088 8.60855C4.4547 10.7948 3.48076 11.5393 1.58776 12.4509L1.55029 12.4198L1.44575 12.473Z" fill="#818283"/>
        <path d="M6.49933 0.928602C5.22749 0.928602 3.94023 1.01604 2.66333 1.18887L2.618 1.51626L1.95317 1.37912L2.12264 2.02723L1.79648 2.09429C1.45853 5.59651 1.47039 8.28218 1.8401 11.8066C2.56679 11.4339 3.08292 11.1045 3.56496 10.7142C4.24151 10.1664 4.89868 9.45203 5.76237 8.32549L6.49933 7.36427L7.23629 8.32549C8.06939 9.41212 8.75502 10.1477 9.4594 10.7104C9.9808 11.1269 10.5333 11.4646 11.1597 11.7952C11.5283 8.2763 11.5398 5.59301 11.2022 2.09429L10.876 2.02723L11.0455 1.37917L10.3828 1.51595L10.3368 1.18908C9.05945 1.01612 7.77161 0.928602 6.49933 0.928602ZM6.49932 0C8.05208 0 9.60483 0.123823 11.1576 0.371478C11.1588 0.383249 11.1628 0.394669 11.1645 0.406411C11.2249 0.393951 11.2895 0.390126 11.3596 0.401792C11.6942 0.458564 11.9995 0.7842 12.0372 1.12069C12.045 1.19117 12.0377 1.25537 12.0221 1.31485C12.034 1.31731 12.0455 1.3221 12.0575 1.32409C12.4993 5.50023 12.4809 8.45271 12.0024 12.6288C12.0022 12.6311 12.0032 12.6328 12.003 12.6351C12.0027 12.6374 12.0012 12.6396 12.0009 12.6419C11.9973 12.6737 11.9935 12.7056 11.9899 12.7374C11.9832 12.7386 11.9767 12.7413 11.9701 12.7426C11.9137 12.8675 11.7944 12.9728 11.6633 12.9961C11.6038 13.0067 11.5538 12.9938 11.5102 12.9716C11.4997 12.9803 11.4885 12.9876 11.4783 12.9965C9.40492 11.9844 8.28197 11.2156 6.49933 8.8905C4.7167 11.2156 3.6749 11.9844 1.52035 12.9965C1.51017 12.9876 1.49889 12.9803 1.4885 12.9716C1.4448 12.9938 1.39492 13.0067 1.33533 12.9961C1.20424 12.9728 1.08496 12.8675 1.02857 12.7426C1.02192 12.7413 1.0155 12.7386 1.00879 12.7374C1.0051 12.7056 1.00142 12.6737 0.99775 12.6419C0.997438 12.6396 0.995946 12.6374 0.995681 12.6351C0.995398 12.6328 0.996437 12.6311 0.996229 12.6288C0.517761 8.45271 0.499388 5.50023 0.9411 1.32409C0.953126 1.3221 0.964603 1.31731 0.976524 1.31485C0.960966 1.25537 0.953692 1.19117 0.961401 1.12069C0.99912 0.7842 1.30447 0.458564 1.63911 0.401792C1.70912 0.390126 1.77377 0.393951 1.8342 0.406411C1.83582 0.394669 1.83987 0.383249 1.84108 0.371478C3.39382 0.123823 4.94657 0 6.49932 0Z" fill="#818283"/>
      </svg>
    ),
  },
  {
    value: "nxthyre",
    label: "Nxthyre",
    logo: (
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 8.87714C0 3.97443 4.10406 0 9.16667 0H20V5.64909C20 10.9975 15.5228 15.3332 10 15.3332H0V8.87714Z" fill="#0F47F2"/>
        <path d="M5.67872 5.68569C6.30372 5.68569 6.7985 5.84926 7.16309 6.2307C7.52767 6.61214 7.70996 7.13229 7.70996 7.79114V10.4912H6.5918V7.92354C6.5918 7.55156 6.48275 7.25365 6.26465 7.02983C6.04981 6.80601 5.76497 6.6941 5.41016 6.6941C5.04232 6.6941 4.74772 6.80601 4.52637 7.02983C4.30827 7.25365 4.19922 7.55156 4.19922 7.92354V10.4912H3.09082L3.09082 5.68569H4.19922L4.19922 6.50023C4.35547 6.23228 4.56055 6.0258 4.81445 5.88079C5.06836 5.73263 5.35645 5.68569 5.67872 5.68569Z" fill="white"/>
        <path d="M13.2129 10.4912H11.875L10.7471 8.9591L9.62402 10.4912H8.2959L10.083 8.05121L8.38476 5.68239H9.74772L10.7568 7.13859L11.7648 5.68404H13.093L11.4258 8.04175L13.2129 10.4912Z" fill="white"/>
        <path d="M16.8311 6.78395H15.5469V8.68957C15.5469 8.97644 15.6283 9.18922 15.791 9.32793C15.957 9.46348 16.1833 9.53126 16.4697 9.53126C16.6097 9.53126 16.7301 9.51865 16.8311 9.49343V10.4912C16.6585 10.529 16.4583 10.5479 16.2305 10.5479C15.6803 10.5479 15.2425 10.3887 14.917 10.0703C14.5915 9.75192 14.4287 9.29798 14.4287 8.70848V6.78395H13.501L13.5186 5.68404H14.4287L14.4287 4.48585H15.5469L15.5469 5.68404H16.8311V6.78395Z" fill="white"/>
        <path d="M9.16699 0.0498047H19.9502V5.64941C19.95 10.9686 15.4966 15.2832 10 15.2832H0.0498047V8.87695C0.0499069 4.00345 4.13053 0.0498047 9.16699 0.0498047ZM8.34375 5.71191L10.0205 8.05078L8.25586 10.4619L8.19727 10.541H9.64941L9.66406 10.5205L10.7471 9.04199L11.835 10.5205L11.8496 10.541H13.3115L13.2529 10.4619L11.4863 8.04102L13.1338 5.71289L13.1895 5.63379H11.7383L11.7236 5.65527L10.7559 7.05078L9.78906 5.6543L9.77344 5.63281H8.28711L8.34375 5.71191ZM9.72168 5.73242L10.7158 7.16699L10.7568 7.22656L10.7979 7.16699L11.791 5.73438H12.9961L11.3848 8.0127L11.3643 8.04199L11.3857 8.07129L13.1152 10.4414H11.9004L10.7871 8.92969L10.7471 8.875L10.707 8.92969L9.59863 10.4414H8.39355L10.123 8.08105L10.1445 8.05176L10.124 8.02246L8.48242 5.73242H9.72168ZM15.4971 8.68945C15.4971 8.98568 15.5814 9.21504 15.7588 9.36621H15.7598C15.9373 9.51118 16.1756 9.58105 16.4697 9.58105C16.5859 9.58105 16.6894 9.56918 16.7812 9.55176V10.4492C16.6219 10.4807 16.4386 10.498 16.2305 10.498C15.6905 10.498 15.2664 10.3416 14.9521 10.0342C14.6389 9.72775 14.4785 9.28814 14.4785 8.70801V6.73438H13.5518L13.5674 5.73438H14.4785V4.53613H15.4971V5.73438H16.7812V6.73438H15.4971V8.68945ZM5.41016 6.64453C5.03139 6.64453 4.72354 6.7602 4.49121 6.99512H4.49023C4.26151 7.22999 4.14941 7.5416 4.14941 7.92383V10.4414H3.14062V5.73535H4.14941V6.68555L4.24219 6.52539C4.39427 6.26459 4.59311 6.06421 4.83887 5.92383H4.83984C5.08301 5.782 5.36104 5.73535 5.67871 5.73535C6.29473 5.73535 6.7746 5.89699 7.12695 6.26562C7.48042 6.63555 7.66013 7.14185 7.66016 7.79102V10.4414H6.6416V7.92383C6.6416 7.58936 6.55562 7.30906 6.38086 7.08691L6.30078 6.99512C6.07513 6.76004 5.77644 6.64453 5.41016 6.64453ZM15.5967 6.83398H16.8809V5.63379H15.5967V4.43555H14.3789V5.63379H13.4697L13.4688 5.68359L13.4512 6.7832L13.4502 6.83398H14.3789V8.70801C14.3789 9.30681 14.5441 9.77609 14.8818 10.1064C15.2186 10.4358 15.6702 10.5977 16.2305 10.5977C16.461 10.5977 16.6649 10.5788 16.8418 10.54L16.8809 10.5312V9.42969L16.8193 9.44531C16.7235 9.46927 16.6069 9.48145 16.4697 9.48145C16.1909 9.48145 15.9767 9.4152 15.8223 9.28906C15.6748 9.16279 15.5967 8.96629 15.5967 8.68945V6.83398ZM7.75977 7.79102C7.75974 7.12275 7.57471 6.58918 7.19922 6.19629C6.8224 5.80205 6.3127 5.63574 5.67871 5.63574C5.35231 5.63574 5.05441 5.68292 4.79004 5.83691C4.57488 5.9598 4.39567 6.12734 4.24902 6.33496V5.63574H3.04102V10.541H4.24902V7.92383C4.24902 7.56262 4.35466 7.2781 4.56152 7.06543C4.7719 6.85271 5.05324 6.74414 5.41016 6.74414C5.75348 6.74414 6.02449 6.85192 6.22852 7.06445C6.43582 7.2772 6.54199 7.56223 6.54199 7.92383V10.541H7.75977V7.79102Z" fill="white" stroke="white" stroke-opacity="0.26" stroke-width="0.1"/>
        <path d="M17.5566 0.503906L18.0302 1.78317L19.451 2.38914L18.0302 2.86045L17.5566 4.27437L17.0829 2.86045L15.6621 2.38914L17.0829 1.78317L17.5566 0.503906Z" fill="white"/>
      </svg>
    ),
  },
];

export default function CandidateSearch() {
  const [activeMenuId, setActiveMenuId] = React.useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);
  const filterButtonRef = React.useRef<HTMLButtonElement>(null);
  
  const [filters, setFilters] = React.useState<FiltersState>({
    location: [],
    clients: [],
    experience: [],
    jobRole: [],
    noticePeriod: [],
    dateCreated: [],
    source: [],
  });

  const [optionsData, setOptionsData] = React.useState<any>({
    location: MOCK_LOCATIONS.map(v => ({ value: v, label: v })),
    clients: [],
    experience: MOCK_EXPERIENCE.map(v => ({ value: v, label: v })),
    jobRole: [],
    noticePeriod: MOCK_NOTICE_PERIODS.map(v => ({ value: v, label: v })),
    dateCreated: MOCK_DATE_CREATED.map(v => ({ value: v, label: v })),
    source: SOURCE_OPTIONS,
  });

  const logoRequestedRef = React.useRef<Set<string>>(new Set());

  // Fetch Clients and Job Roles
  React.useEffect(() => {
    let cancelled = false;

    const fetchDropdownData = async () => {
      try {
        const [wsData, jobsData] = await Promise.all([
          organizationService.getMyWorkspacesData().catch(() => ({ workspaces: [] })),
          jobPostService.getJobs().catch(() => [])
        ]);

        if (cancelled) return;

        // Extract and map clients
        const clientsRaw = wsData.workspaces || [];
        const uniqueClientNames = Array.from(new Set(clientsRaw.map((w: any) => w.name))).filter(Boolean);
        const mappedClients = uniqueClientNames.map(name => ({ value: name, label: name as string, logo: undefined as any }));

        // Map Job Roles
        const uniqueTitles = Array.from(new Set(jobsData.map((j: any) => j.title))).filter(Boolean);
        const mappedJobs = uniqueTitles.map(t => ({ value: t, label: t as string }));

        setOptionsData((prev: any) => ({
          ...prev,
          clients: mappedClients,
          jobRole: mappedJobs
        }));

        // Fetch logos for clients
        uniqueClientNames.forEach(name => {
          if (name && !logoRequestedRef.current.has(name as string)) {
            logoRequestedRef.current.add(name as string);
            fetch(`https://api.logo.dev/search?q=${encodeURIComponent(name as string)}`, {
              headers: { Authorization: `Bearer ${import.meta.env.VITE_LOGO_DEV_API_KEY}` }
            })
            .then(res => res.json())
            .then(data => {
              if (cancelled) return;
              const logoUrl = data.length > 0 ? data[0].logo_url : null;
              if (logoUrl) {
                setOptionsData((prev: any) => {
                  const newClients = prev.clients.map((c: any) => c.value === name ? { ...c, logo: logoUrl } : c);
                  return { ...prev, clients: newClients };
                });
              }
            }).catch(() => {});
          }
        });

      } catch (err) {
        console.error("Failed to load options", err);
      }
    };

    fetchDropdownData();

    return () => { cancelled = true; };
  }, []);

  const totalFiltersApplied = Object.values(filters).reduce(
    (acc, val) => acc + val.length,
    0
  );

  const handleApplyFilters = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  // Generate 8 identical rows based on mockup
  const candidates = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    name: 'Max Verstappen',
    company: 'Google',
    role: 'Product Designer',
    location: 'Bengaluru',
    exp: '7 yrs',
    currentCtc: '₹18.5L',
    expectedCtc: '₹25-35L',
    notice: '30 Days',
    status: 'Available'
  }));

  const handleActionClick = (id: number) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 h-full custom-scrollbar relative">
      <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
        
        {/* Stat Cards */}
        <div className="flex flex-wrap gap-4">
          <StatCard 
            title="Total Candidates" 
            value="14567" 
            change="10%" 
            changeText="vs last month" 
            positive={true} 
            icon={BriefcaseIcon} 
          />
          <StatCard 
            title="Total Hired" 
            value="822" 
            change="+42" 
            changeText="this month" 
            positive={true} 
            icon={UserCheckIcon} 
          />
          <StatCard 
            title="Via Naukbot" 
            value="12048" 
            change="+42" 
            changeText="this month" 
            positive={true} 
            icon={BotIcon} 
          />
          <StatCard 
            title="Manual Uploads" 
            value="2341" 
            change="+25" 
            changeText="this month" 
            positive={true} 
            icon={UploadCloudIcon} 
          />
          <StatCard 
            title="Others" 
            value="830" 
            change="+25" 
            changeText="this month" 
            positive={true} 
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
                className="outline-none text-sm w-full bg-transparent placeholder:text-gray-400"
              />
            </div>
            
            <div className="relative inline-block">
              <button 
                ref={filterButtonRef}
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`ml-4 flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  isFilterPanelOpen || totalFiltersApplied > 0
                    ? "border-[#0F47F2] text-[#0F47F2] bg-blue-50/50" 
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" /> Filters
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
            <button className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <Calendar className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <DownloadCloud className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50">
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button className="bg-[#0F47F2] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <span className="text-lg leading-none">+</span> Add Candidate
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-b-xl border-t-0 border-gray-200">
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-300 w-4 h-4 cursor-pointer" /></th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Candidate</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Role</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Location</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Exp</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Current CTC</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Expected</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Notice</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Status</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 group relative">
                    <td className="p-4"><input type="checkbox" className="rounded border-gray-300 w-4 h-4 cursor-pointer" /></td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{c.company} •</div>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{c.role}</td>
                    <td className="p-4 text-gray-600">{c.location}</td>
                    <td className="p-4 text-gray-600">{c.exp}</td>
                    <td className="p-4 text-gray-600">{c.currentCtc}</td>
                    <td className="p-4 font-semibold text-[#0F47F2]">{c.expectedCtc}</td>
                    <td className="p-4 font-medium text-amber-500">{c.notice}</td>
                    <td className="p-4"><span className="text-emerald-500 font-medium">{c.status}</span></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsModalOpen(true)}
                          className="px-4 py-2 bg-[#0F47F2] text-white text-xs font-semibold rounded-[6px] hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Add to Pipeline
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
                               <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                 <Phone className="w-4 h-4" /> Call
                               </button>
                               <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                 <Mail className="w-4 h-4" /> Mail
                               </button>
                               <button className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                                 <FileText className="w-4 h-4" /> View Resume
                               </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Showing 1–15 of 1,240</span>
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0F47F2] text-white text-sm font-medium">1</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-600 text-sm font-medium">2</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-600 text-sm font-medium">3</button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-600 text-sm font-medium">83</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 border border-gray-200">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      <MoveToPipelineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
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
