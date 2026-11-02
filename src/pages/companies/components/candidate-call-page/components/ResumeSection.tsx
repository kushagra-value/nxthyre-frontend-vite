import React, { useState } from "react";
import { FileText, Minus, Plus, Maximize2, Minimize2, ChevronDown } from "lucide-react";

export interface CandidateResumeData {
  id?: string;
  name?: string;
  resumeUrl?: string;
  matchScore?: string | number | null;
  screening_score?: string | number | null;
  screening_round_score?: string | number | null;
  [key: string]: any;
}

export function ScoreCircleBadge({ scoreVal }: { scoreVal?: string | number | null }) {
  let scoreNum = 0;
  if (scoreVal != null && scoreVal !== "" && scoreVal !== "--" && scoreVal !== "--%") {
    const parsed = parseInt(String(scoreVal).replace("%", ""), 10);
    if (!isNaN(parsed)) scoreNum = parsed;
  } else {
    // Default fallback to 74 as shown in screenshot if not provided
    scoreNum =0;
  }

  const displayText = `${scoreNum}%`;
  const strokeColor = scoreNum >= 70 ? "#F59E0B" : scoreNum >= 50 ? "#3B82F6" : "#EF4444";

  return (
    <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
      <svg className="w-8 h-8 " viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="3.5"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeDasharray={`${scoreNum}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-bold text-[9px] text-slate-700">
        {displayText}
      </span>
    </div>
  );
}

export interface ResumeSectionProps {
  candidate: CandidateResumeData | null;
}

export default function ResumeSection({ candidate }: ResumeSectionProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const zoomOptions = [75, 90, 100, 125, 150];

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const resumeUrl = candidate?.resumeUrl;
  const matchScore = candidate?.matchScore ?? 74;

  const renderContent = () => {
    if (!resumeUrl) {
      return (
        <div className="flex items-center justify-center h-full w-full text-slate-400">
          <div className="text-center p-6">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-600">No resume uploaded</p>
            <p className="text-xs text-slate-400 mt-1">
              Resume will appear here when available
            </p>
          </div>
        </div>
      );
    }

    const cleanUrl = resumeUrl.split("?")[0].split("#")[0];
    const ext = cleanUrl.split(".").pop()?.toLowerCase() || "";
    const isPdf = ext === "pdf" || resumeUrl.includes(".pdf") || resumeUrl.includes("/pdf");
    const isDocViewerSupported = ["docx", "doc", "txt", "rtf"].includes(ext);

    // Append PDF Open Parameters view=FitH to automatically zoom the page to full horizontal container width
    const pdfUrlWithParams = isPdf
      ? (resumeUrl.includes("#") ? resumeUrl : `${resumeUrl}#view=FitH&zoom=${zoomLevel}&toolbar=1&navpanes=0`)
      : resumeUrl;

    const viewerUrl = isDocViewerSupported
      ? `https://docs.google.com/gview?url=${encodeURIComponent(resumeUrl)}&embedded=true`
      : pdfUrlWithParams;

    if (isPdf) {
      return (
        <iframe
          key={`${resumeUrl}-${zoomLevel}`}
          src={pdfUrlWithParams}
          className="w-full h-full min-h-0 flex-1 border-0 bg-white"
          title="Candidate Resume"
        />
      );
    }

    if (isDocViewerSupported) {
      return (
        <iframe
          src={viewerUrl}
          className="w-full h-full min-h-0 flex-1 border-0 bg-white"
          title="Candidate Resume"
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full w-full text-slate-400">
        <div className="text-center p-6">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-700">Resume format not supported for inline viewing</p>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-xs mt-2 inline-block font-semibold hover:text-blue-800"
          >
            Download or open in a new tab
          </a>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col bg-white border-2 border-[#0091FF] rounded-2xl relative overflow-hidden transition-all shadow-sm ${
        isFullscreen
          ? "fixed inset-2 z-50 shadow-2xl"
          : "w-full h-full flex-1 min-h-0"
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100 bg-white shrink-0">
        <h2 className="text-[14px] font-medium text-[#374151] tracking-tight">Candidate Resume</h2>
        <div className="flex items-center gap-2.5">
          <span className="text-[14px]  text-[#6b7280]">Resume Match Score</span>
          <ScoreCircleBadge scoreVal={matchScore} />
        </div>
      </div>

      {/* Resume Viewer Container (Full Height, No Double Scrollbars) */}
      <div className="flex-1 min-h-0 w-full relative flex flex-col bg-white overflow-hidden">
        {renderContent()}

        {/* Floating Zoom Controls Bar */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-20">
          <div className="bg-[#1E293B]/90 hover:bg-[#1E293B] text-white backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-3 text-xs pointer-events-auto transition-colors border border-slate-700/60">
            {/* Zoom Out */}
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Zoom In */}
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 hover:text-blue-400 transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Zoom Percent Dropdown */}
            <div className="relative border-l border-slate-700 pl-2">
              <button
                type="button"
                onClick={() => setShowZoomMenu(!showZoomMenu)}
                className="flex items-center gap-1 font-semibold text-[11px] text-slate-200 hover:text-white transition cursor-pointer"
              >
                <span>{zoomLevel}%</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showZoomMenu && (
                <div className="absolute bottom-full mb-2 right-0 bg-[#0F172A] border border-slate-700 rounded-lg shadow-xl py-1 w-20 z-30">
                  {zoomOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setZoomLevel(opt);
                        setShowZoomMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1 text-xs hover:bg-slate-800 transition ${
                        zoomLevel === opt ? "text-blue-400 font-bold" : "text-slate-300"
                      }`}
                    >
                      {opt}%
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
