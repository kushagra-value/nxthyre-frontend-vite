import React, { useState, useRef } from 'react';

interface CompanyHoverCardProps {
  children: React.ReactNode;
  companyName: string;
  description: string;
  employeeCount: string;
  location: string;
  logoUrl: string | undefined;
}

export const CompanyHoverCard: React.FC<CompanyHoverCardProps> = ({
  children,
  companyName,
  description,
  employeeCount,
  location,
  logoUrl,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    setIsVisible(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setExpanded(false);
      timeoutRef.current = null;
    }, 150);
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={show}
        onMouseLeave={hide}
        className="cursor-pointer"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          onMouseEnter={show}
          onMouseLeave={hide}
          className="absolute z-50 top-full left-0 mt-2 w-[361px] min-h-[182px]"
        >
          {/* Main card container */}
          <div className="flex flex-col w-full min-h-full bg-white rounded-lg shadow-[0px_4px_4px_rgba(0,0,0,0.1)]">
            {/* Header: Logo and Company Name */}
            <div className="flex pl-6 pt-6">
              <img className="w-6 h-6 rounded-full flex-shrink-0" src={logoUrl} alt="" />
              <div className="ml-3 w-[200px] h-6 font-medium text-sm leading-6 text-gray-900 truncate">
                {companyName}
              </div>
            </div>
            
            {/* Description */}
            <div className={`ml-[60px] mt-[8px] w-[282px] font-medium text-sm leading-[22px] text-gray-400 ${expanded ? '' : 'h-[134px] overflow-hidden'}`}>
              {description}
            </div>
            
            {/* Read More/Less Button */}
            {!expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="text-left mt-1 text-sm text-blue-600 underline hover:text-blue-800"
              >
                Read more
              </button>
            )}
            
            {expanded && (
              <button
                onClick={() => setExpanded(false)}
                className="text-left mt-1 text-sm text-blue-600 underline hover:text-blue-800"
              >
                Read less
              </button>
            )}
            
            {/* Bottom: Employee Count and Location */}
            <div className="ml-6 mt-[7px] flex flex-col">
              {/* Employee Count Row */}
              <div className="grid grid-cols-[112px_66px] gap-3 items-center h-[44px]">
                <div className="font-medium text-sm leading-[22px] text-gray-600 whitespace-nowrap">
                  Employee Count:
                </div>
                <div className="font-normal text-sm leading-[22px] text-gray-400 whitespace-nowrap">
                  {employeeCount}
                </div>
              </div>
              
              {/* Location Row */}
              <div className="grid grid-cols-[112px_66px] gap-3 items-center h-[44px] mt-[-22px]">
                <div className="font-medium text-sm leading-[22px] text-gray-600 whitespace-nowrap">
                  Location:
                </div>
                <div className="font-normal text-sm leading-[22px] text-gray-400 whitespace-nowrap">
                  {location}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};