import React, { useState } from 'react';

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer"
      >
        {children}
      </div>
      
      {isHovered && (
        <div
          className="absolute z-50 top-full left-0 mt-2"
          style={{
            width: '361px',
            height: '182px',
          }}
        >
          {/* Main card container */}
          <div
            className="relative bg-white rounded-lg"
            style={{
              width: '361px',
              height: '182px',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
            }}
          >
            {/* Company logo */}
            <div
              className="absolute"
              style={{
                width: '24px',
                height: '24px',
                left: '24px',
                top: '24px',
                borderRadius: '9999px',
                backgroundImage: `url(${logoUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            
            {/* Company name */}
            <div
              className="absolute flex items-center"
              style={{
                width: '200px',
                height: '24px',
                left: '60px',
                top: '24px',
                fontFamily: 'Gellix, system-ui, -apple-system, sans-serif',
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '14px',
                lineHeight: '24px',
                color: '#111827',
              }}
            >
              {companyName}
            </div>
            
            {/* Description */}
            <div
              className="absolute"
              style={{
                width: '282px',
                height: '67px',
                left: '60px',
                top: '56px',
                fontFamily: 'Gellix, system-ui, -apple-system, sans-serif',
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '14px',
                lineHeight: '22px',
                color: '#818283',
              }}
            >
              {description}
            </div>
            
            {/* Employee Count Label */}
            <div
              className="absolute flex items-center"
              style={{
                width: '112px',
                height: '44px',
                left: '24px',
                top: '130px',
                fontFamily: 'Gellix, system-ui, -apple-system, sans-serif',
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '14px',
                lineHeight: '22px',
                color: '#4B5563',
              }}
            >
              Employee Count:
            </div>
            
            {/* Employee Count Value */}
            <div
              className="absolute flex items-center"
              style={{
                width: '66px',
                height: '44px',
                left: '148px',
                top: '130px',
                fontFamily: 'Gellix, system-ui, -apple-system, sans-serif',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '14px',
                lineHeight: '22px',
                color: '#818283',
              }}
            >
              {employeeCount}
            </div>
            
            {/* Location Label */}
            <div
              className="absolute flex items-center"
              style={{
                width: '112px',
                height: '44px',
                left: '24px',
                top: '152px',
                fontFamily: 'Gellix, system-ui, -apple-system, sans-serif',
                fontStyle: 'normal',
                fontWeight: '500',
                fontSize: '14px',
                lineHeight: '22px',
                color: '#4B5563',
              }}
            >
              Location:
            </div>
            
            {/* Location Value */}
            <div
              className="absolute flex items-center"
              style={{
                width: '66px',
                height: '44px',
                left: '148px',
                top: '152px',
                fontFamily: 'Gellix, system-ui, -apple-system, sans-serif',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '14px',
                lineHeight: '22px',
                color: '#818283',
              }}
            >
              {location}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};