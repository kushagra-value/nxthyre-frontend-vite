import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface SkillsFitModalProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRect: DOMRect | null;
  matchedSkills: string[];
  nonMatchedSkills: string[];
  countStr: string;
  candidateName?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SkillsFitModal: React.FC<SkillsFitModalProps> = ({
  isOpen,
  onClose,
  anchorRect,
  matchedSkills,
  nonMatchedSkills,
  countStr,
  candidateName,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [coords, setCoords] = useState<{ top: number; left: number; placement: "top" | "bottom" }>({
    top: 0,
    left: 0,
    placement: "top",
  });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !anchorRect) return;

    const modalWidth = 360;
    // Estimate or measure height
    const modalHeight = modalRef.current ? modalRef.current.offsetHeight : 340;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Horizontal positioning: center on the anchor
    let left = anchorRect.left + anchorRect.width / 2 - modalWidth / 2;
    if (left < 16) left = 16;
    if (left + modalWidth > windowWidth - 16) {
      left = windowWidth - modalWidth - 16;
    }

    // Vertical positioning: prefer top if space allows (matching reference screenshot)
    let top = 0;
    let placement: "top" | "bottom" = "top";

    if (anchorRect.top >= modalHeight + 12) {
      // Place above
      top = anchorRect.top - modalHeight - 10;
      placement = "top";
    } else if (windowHeight - anchorRect.bottom >= modalHeight + 12) {
      // Place below
      top = anchorRect.bottom + 10;
      placement = "bottom";
    } else {
      // If neither fits completely, place on top with scroll
      top = Math.max(16, anchorRect.top - modalHeight);
      placement = "top";
    }

    setCoords({ top, left, placement });
  }, [isOpen, anchorRect, matchedSkills, nonMatchedSkills]);

  if (!isOpen || !anchorRect) return null;

  return createPortal(
    <div
      ref={modalRef}
      style={{
        top: coords.top,
        left: coords.left,
        position: "fixed",
      }}
      className="z-[9999] w-[360px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.16)] border border-[#E5E7EB] p-4 text-left animate-in fade-in zoom-in-95 duration-150 select-none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5] mb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Skills Fit
            </span>
            <span className="text-[11px] font-semibold text-[#009951] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
              {countStr} Match
            </span>
          </div>
          {candidateName && (
            <span className="text-[11px] text-gray-500 truncate max-w-[240px] mt-0.5">
              {candidateName}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
        {/* Section 1: Non-Matching Skills (Styled matching reference screenshot) */}
        {nonMatchedSkills.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#854D0E] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                Non-Matching Skills
              </span>
              <span className="text-[11px] font-semibold text-[#854D0E] bg-[#FEFCE8] px-2 py-0.5 rounded-full border border-[#FDE047]">
                {nonMatchedSkills.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {nonMatchedSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#FEFCE8] text-[#854D0E] border border-[#FDE047] leading-relaxed shadow-xs"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Matching Skills */}
        <div>
          <div className="flex items-center justify-between mb-2 pt-2 border-t border-[#F0F2F5]">
            <span className="text-xs font-semibold text-[#065F46] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#009951]" />
              Matching Skills
            </span>
            <span className="text-[11px] font-semibold text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
              {matchedSkills.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.length > 0 ? (
              matchedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">No matching skills found</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SkillsFitModal;

