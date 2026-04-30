import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle } from 'lucide-react';

interface SkillsMatchTooltipProps {
  matchedSkills: string[];
  missingSkills: string[];
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export default function SkillsMatchTooltip({ matchedSkills, missingSkills, anchorRef, onClose }: SkillsMatchTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'bottom' });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (anchorRef.current && tooltipRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // We use fixed positioning to avoid parent relative/overflow issues
      let top = anchorRect.bottom + 8;
      let left = anchorRect.left + (anchorRect.width / 2) - (tooltipRect.width / 2);
      let placement = 'bottom';

      // Horizontal overflow
      if (left < 10) {
        left = 10;
      } else if (left + tooltipRect.width > windowWidth - 10) {
        left = windowWidth - tooltipRect.width - 10;
      }

      // Vertical overflow
      if (top + tooltipRect.height > windowHeight - 10) {
        top = anchorRect.top - tooltipRect.height - 8;
        placement = 'top';
      }

      setPosition({ top, left, placement });
    }
  }, [anchorRef, matchedSkills, missingSkills]);

  // Use a Portal to render at the end of the body
  return createPortal(
    <div
      ref={tooltipRef}
      style={{
        top: position.top,
        left: position.left,
        position: 'fixed',
      }}
      className="z-[9999] w-[280px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E5E7EB] p-5"
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={onClose}
    >
      <div className="flex flex-col gap-6">
        {/* Matched Skills */}
        <div>
          <h4 className="text-[15px] font-semibold text-[#009951] mb-3 flex items-center gap-2">
            Matched skills
          </h4>
          <div className="flex flex-col gap-2.5">
            {matchedSkills && matchedSkills.length > 0 ? (
              matchedSkills.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <span className="text-[14px] text-[#4B5563] font-medium leading-tight line-clamp-2 pr-2">
                    {skill}
                  </span>
                  <CheckCircle2 className="w-[18px] h-[18px] text-[#009951] fill-[#009951]/10 flex-shrink-0" />
                </div>
              ))
            ) : (
              <span className="text-[13px] text-[#AEAEB2] italic">No skills matched</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div>
          <h4 className="text-[15px] font-semibold text-[#EF4444] mb-3 flex items-center gap-2">
            Unmatched skills
          </h4>
          <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
            {missingSkills && missingSkills.length > 0 ? (
              missingSkills.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <span className="text-[14px] text-[#4B5563] font-medium leading-tight line-clamp-2 pr-2">
                    {skill}
                  </span>
                  <XCircle className="w-[18px] h-[18px] text-[#EF4444] fill-[#EF4444]/10 flex-shrink-0" />
                </div>
              ))
            ) : (
              <span className="text-[13px] text-[#AEAEB2] italic">No missing skills</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
