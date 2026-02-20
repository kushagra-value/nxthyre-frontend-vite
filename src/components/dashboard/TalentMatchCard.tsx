import { Eye, Trash2 } from 'lucide-react';

interface TalentMatchCardProps {
  name: string;
  company: string;
  position: string;
  experience: string;
  matchPercentage: number;
  showNxtLogo?: boolean;
}

export default function TalentMatchCard({
  name,
  company,
  position,
  experience,
  matchPercentage,
  showNxtLogo = false,
}: TalentMatchCardProps) {
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (matchPercentage / 100) * circumference;

  return (
    <div
      className="bg-white p-5 rounded-[10px] flex items-center justify-between"
      style={{ border: '1px solid #D1D1D6' }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-normal text-[#4B5563] leading-[17px]">{name}</span>
          <span className="px-2 py-1 bg-[#E7EDFF] text-[#0F47F2] text-[10px] font-normal leading-3 rounded">
            New
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-light text-[#4B5563] leading-5">{company}</span>
          <span className="w-1 h-1 rounded-full bg-[#4B5563] opacity-40" />
          <span className="text-sm font-light text-[#4B5563] leading-5">{position}</span>
          <span className="w-1 h-1 rounded-full bg-[#4B5563] opacity-40" />
          <span className="text-sm font-light text-[#4B5563] leading-5">{experience}</span>
          {showNxtLogo && (
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="20" height="15.33" rx="2" fill="#4B5563" />
              <path d="M14.5 3L16 3L16 5.5" stroke="white" strokeWidth="0.8" fill="none" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative w-10 h-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="16"
              strokeWidth="3"
              stroke="#D1D1D6"
              opacity="0.3"
            />
            <circle
              cx="18"
              cy="18"
              fill="none"
              r="16"
              strokeWidth="3"
              stroke="#00C8B3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-normal text-[#00C8B3] leading-5">{matchPercentage}%</span>
          </div>
        </div>

        <button
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ border: '0.5px solid #4B5563' }}
        >
          <Eye className="w-5 h-5 text-[#4B5563]" />
        </button>

        <button
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ border: '0.5px solid #FF383C' }}
        >
          <Trash2 className="w-5 h-5 text-[#FF383C]" />
        </button>
      </div>
    </div>
  );
}
