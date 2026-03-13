import React, { useState, useEffect, useRef } from "react";
import type { ActivitySection } from "../../../services/dashboardService";
import DailyActivitiesModal from "./DailyActivitiesModal";



const CalendarIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_119_1233)">
      <path
        d="M10.5 1.16669V2.33335M3.5 1.16669V2.33335"
        stroke="#0F47F2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.83333 9.91665L5.83333 7.78586C5.83333 7.67399 5.75356 7.58331 5.65517 7.58331H5.25M7.95063 9.91665L8.74077 7.78699C8.77771 7.68741 8.69916 7.58331 8.58706 7.58331H7.58333"
        stroke="#0F47F2"
        strokeLinecap="round"
      />
      <path
        d="M1.45825 7.14189C1.45825 4.60013 1.45825 3.32925 2.18865 2.53962C2.91906 1.75 4.09462 1.75 6.44575 1.75H7.55409C9.90522 1.75 11.0808 1.75 11.8112 2.53962C12.5416 3.32925 12.5416 4.60013 12.5416 7.14189V7.44144C12.5416 9.9832 12.5416 11.2541 11.8112 12.0437C11.0808 12.8333 9.90522 12.8333 7.55409 12.8333H6.44575C4.09462 12.8333 2.91906 12.8333 2.18865 12.0437C1.45825 11.2541 1.45825 9.9832 1.45825 7.44144V7.14189Z"
        stroke="#0F47F2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 4.66669H10.5"
        stroke="#0F47F2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_119_1233">
        <rect width="14" height="14" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const PhoneIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.875 1.16669C7.875 1.16669 9.23621 1.29043 10.9686 3.02284C12.701 4.75525 12.8248 6.11644 12.8248 6.11644"
      stroke="#0F47F2"
      strokeLinecap="round"
    />
    <path
      d="M8.28735 3.22913C8.28735 3.22913 8.86485 3.39412 9.73105 4.26033C10.5972 5.12653 10.7623 5.704 10.7623 5.704"
      stroke="#0F47F2"
      strokeLinecap="round"
    />
    <path
      d="M9.12598 9.06717L9.39169 8.78746L8.75725 8.18488L8.49155 8.46458L9.12598 9.06717ZM10.2659 8.66968L11.3804 9.31118L11.8169 8.55284L10.7024 7.91135L10.2659 8.66968ZM11.5955 10.6411L10.7668 11.5136L11.4012 12.1161L12.2299 11.2437L11.5955 10.6411ZM10.2682 11.7931C9.43112 11.8757 7.24695 11.8052 4.87619 9.30925L4.24177 9.91183C6.82555 12.6321 9.29025 12.7689 10.3541 12.6639L10.2682 11.7931ZM4.87619 9.30925C2.61512 6.92873 2.23585 4.92075 2.18858 4.04003L1.31484 4.08692C1.37273 5.16564 1.83075 7.37352 4.24177 9.91183L4.87619 9.30925ZM5.67848 5.4376L5.84578 5.26146L5.21136 4.65886L5.04405 4.835L5.67848 5.4376ZM5.9772 3.06841L5.24165 2.02804L4.52719 2.53319L5.26277 3.57356L5.9772 3.06841ZM2.75199 1.80375L1.83639 2.76771L2.47081 3.37031L3.38641 2.40635L2.75199 1.80375ZM5.36126 5.1363C5.04405 4.835 5.04365 4.83543 5.04324 4.83586C5.0431 4.83601 5.04269 4.83644 5.04242 4.83673C5.04186 4.83733 5.0413 4.83793 5.04073 4.83854C5.03958 4.83978 5.03839 4.84107 5.03716 4.84242C5.03472 4.84511 5.03212 4.84802 5.02939 4.85116C5.02394 4.85743 5.01794 4.86461 5.01153 4.87271C4.99871 4.88892 4.9842 4.90883 4.96898 4.93261C4.93847 4.9803 4.90537 5.04311 4.87734 5.12187C4.82035 5.28204 4.78929 5.49414 4.8281 5.75901C4.90435 6.27942 5.24534 6.97924 6.13628 7.91724L6.77071 7.31466C5.93795 6.43785 5.73279 5.89786 5.69386 5.63216C5.67507 5.50397 5.69416 5.43643 5.70171 5.41522C5.70595 5.40329 5.70872 5.39998 5.70601 5.40423C5.70469 5.40628 5.70207 5.41014 5.69766 5.41572C5.69545 5.41851 5.69279 5.42173 5.68962 5.42538C5.68803 5.4272 5.68631 5.42913 5.68446 5.43117C5.68354 5.43219 5.68257 5.43324 5.68158 5.43431C5.68108 5.43485 5.68057 5.43539 5.68005 5.43594C5.6798 5.43621 5.6794 5.43663 5.67927 5.43676C5.67888 5.43718 5.67848 5.4376 5.36126 5.1363ZM6.13628 7.91724C7.02464 8.8525 7.69553 9.22018 8.2074 9.3033C8.47008 9.34594 8.6827 9.31188 8.8437 9.24841C8.9224 9.21738 8.98464 9.18092 9.03136 9.14778C9.0547 9.13122 9.07412 9.11553 9.08975 9.10182C9.09763 9.09493 9.10451 9.08852 9.11052 9.08268C9.11355 9.07983 9.11635 9.07703 9.11892 9.07446C9.1202 9.07318 9.12143 9.07189 9.1226 9.07067C9.12318 9.07008 9.12376 9.0695 9.12435 9.06892C9.12464 9.06863 9.12505 9.06816 9.12516 9.06804C9.12557 9.06758 9.12598 9.06717 8.80876 8.76588C8.49155 8.46458 8.49195 8.46418 8.49236 8.46377C8.49248 8.46359 8.49289 8.46318 8.49312 8.46289C8.49365 8.46237 8.49417 8.46184 8.4947 8.46132C8.49575 8.46027 8.49674 8.45922 8.49767 8.45823C8.49965 8.4563 8.50152 8.45443 8.50327 8.45274C8.50677 8.44936 8.50998 8.44644 8.51278 8.44399C8.51832 8.43909 8.52246 8.43594 8.52515 8.43408C8.53063 8.43017 8.53005 8.43151 8.52264 8.43443C8.51138 8.43886 8.45835 8.45758 8.3477 8.43962C8.11285 8.40147 7.60616 8.19421 6.77071 7.31466L6.13628 7.91724ZM5.24165 2.02804C4.65039 1.19179 3.46726 1.0507 2.75199 1.80375L3.38641 2.40635C3.6914 2.08526 4.22832 2.11048 4.52719 2.53319L5.24165 2.02804ZM2.18858 4.04003C2.17608 3.8071 2.2775 3.57383 2.47081 3.37031L1.83639 2.76771C1.52381 3.09679 1.28623 3.55395 1.31484 4.08692L2.18858 4.04003ZM10.7668 11.5136C10.604 11.6849 10.4338 11.7768 10.2682 11.7931L10.3541 12.6639C10.7899 12.6208 11.1426 12.3884 11.4012 12.1161L10.7668 11.5136ZM5.84578 5.26146C6.41021 4.66723 6.45017 3.7373 5.9772 3.06841L5.26277 3.57356C5.50901 3.92185 5.47126 4.38524 5.21136 4.65886L5.84578 5.26146ZM11.3804 9.31118C11.8592 9.5868 11.9529 10.2648 11.5955 10.6411L12.2299 11.2437C12.9911 10.4423 12.7694 9.10112 11.8169 8.55284L11.3804 9.31118ZM9.39169 8.78746C9.6165 8.55074 9.96685 8.49754 10.2659 8.66968L10.7024 7.91135C10.0616 7.54251 9.26691 7.64827 8.75725 8.18488L9.39169 8.78746Z"
      fill="#0F47F2"
    />
  </svg>
);

const CheckIcon = (
  <svg
    width="11"
    height="10"
    viewBox="0 0 11 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.03457 5.76805C0.798094 5.53158 0.413827 5.53158 0.177354 5.76805C-0.0591181 6.00452 -0.0591181 6.38879 0.177354 6.62526L2.97068 9.41859C3.08892 9.53683 3.23672 9.59595 3.39929 9.59595C3.41407 9.59595 3.41407 9.59595 3.42885 9.59595C3.59142 9.58117 3.754 9.50727 3.87224 9.37425L10.8629 0.994263C11.0699 0.743011 11.0403 0.358743 10.7891 0.137051C10.5378 -0.0698627 10.1535 -0.0403037 9.93184 0.210948L3.35495 8.08843L1.03457 5.76805Z"
      fill="#0F47F2"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-600"
  >
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);
const CalendarFilterIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-gray-600"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);


interface RecentActivitiesProps {
  activities: ActivitySection[];
  isLoading?: boolean;
}

const RecentActivities = ({ activities, isLoading }: RecentActivitiesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<
    "All" | "Today" | "This Week" | "This Month" | "Custom"
  >("All");
  // const [showDropdown, setShowDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Custom Date Range Pickers
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Category State
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "All",
  ]);

  const categoryOptions = ["Mail Reader", "Calls", "Shortlist", "Followup"];
  const dropdownRefDate = useRef<HTMLDivElement>(null);
  const dropdownRefCategory = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRefDate.current &&
        !dropdownRefDate.current.contains(event.target as Node)
      ) {
        setShowDateDropdown(false);
      }
      if (
        dropdownRefCategory.current &&
        !dropdownRefCategory.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);

      let startDateStr = "";
      let endDateStr = "";

      const today = new Date();
      if (filterMode === "Today") {
        startDateStr = today.toISOString().split("T")[0];
        endDateStr = startDateStr;
      } else if (filterMode === "This Week") {
        const firstDay = new Date(
          today.setDate(today.getDate() - today.getDay()),
        );
        startDateStr = firstDay.toISOString().split("T")[0];
        endDateStr = new Date().toISOString().split("T")[0];
      } else if (filterMode === "This Month") {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        startDateStr = firstDay.toISOString().split("T")[0];
        endDateStr = new Date().toISOString().split("T")[0];
      } else if (filterMode === "Custom") {
        startDateStr = customStartDate;
        endDateStr = customEndDate;
      }

      const data = await dashboardService.fetchRecentActivities(
        startDateStr,
        endDateStr,
        selectedCategories,
      );
      setActivities(data);
      setLoading(false);
    };

    // Defer loading for custom dates until dates are picked
    if (filterMode === "Custom" && (!customStartDate || !customEndDate)) {
      setLoading(false);
      return;
    }

    loadActivities();
  }, [filterMode, customStartDate, customEndDate, selectedCategories]);

  const toggleCategory = (cat: string) => {
    if (cat === "All") {
      setSelectedCategories(["All"]);
      return;
    }

    let newSelection = [...selectedCategories].filter((c) => c !== "All");
    if (newSelection.includes(cat)) {
      newSelection = newSelection.filter((c) => c !== cat);
      if (newSelection.length === 0) newSelection = ["All"];
    } else {
      newSelection.push(cat);
    }
    setSelectedCategories(newSelection);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "calendar":
        return CalendarIcon;
      case "check":
        return CheckIcon;
      case "phone":
        return PhoneIcon;
      default:
        return CheckIcon;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center relative">
        <h3 className="text-[16px] font-semibold text-gray-900 font-inter">
          Recent Activities
        </h3>

        {/* Header Buttons */}
        <div className="flex space-x-2">
          {/* Category Dropdown */}
          <div className="relative" ref={dropdownRefCategory}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition shadow-sm"
            >
              <FilterIcon />
            </button>

            {showCategoryDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-2 px-3">
                <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  Filters
                </div>

                <label className="flex items-center space-x-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes("All")}
                    onChange={() => toggleCategory("All")}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>

                {categoryOptions.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center space-x-2 py-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Date Dropdown */}
          <div className="relative" ref={dropdownRefDate}>
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition shadow-sm"
            >
              <CalendarFilterIcon />
              {filterMode}
            </button>

            {showDateDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-10 p-2">
                {["All", "Today", "This Week", "This Month", "Custom"].map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFilterMode(f as any);
                        if (f !== "Custom") setShowDateDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 \${filterMode === f ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-700'}`}
                    >
                      {f}
                    </button>
                  ),
                )}

                {/* Custom Date Inputs */}
                {filterMode === "Custom" && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full text-sm p-1.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full text-sm p-1.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => setShowDateDropdown(false)}
                      className="w-full mt-2 bg-blue-600 text-white py-1.5 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 h-[360px] overflow-y-auto no-scrollbar relative min-h-[150px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            <div className="animate-pulse flex flex-col w-full gap-4">
               {[1,2,3].map(i => (
                 <div key={i} className="flex gap-3">
                   <div className="w-8 h-8 rounded-lg bg-gray-100" />
                   <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-2 bg-gray-100 rounded w-1/4" />
                   </div>
                 </div>
               ))}
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-gray-500 text-sm py-4 text-center h-full flex items-center justify-center">
            No recent activities available.
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h4 className="text-sm font-medium text-gray-500 mb-4 font-inter">
                  {section.label}
                </h4>
                <div className="space-y-[18px]">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-3">
                      <div className="mt-0.5 min-w-[32px]">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100/50 flex items-center justify-center shadow-sm">
                          {getIcon(item.icon)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] text-gray-800 font-inter leading-relaxed">
                          {item.text}
                        </p>
                        <span className="text-xs text-gray-400 mt-1 block font-inter uppercase tracking-wide">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Subtle Separator */}
                  {sectionIdx < activities.length - 1 && (
                    <div className="border-b border-dashed border-gray-200 pt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <DailyActivitiesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
export default RecentActivities;
