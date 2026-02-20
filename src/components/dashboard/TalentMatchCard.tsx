import { Eye, Trash2 } from 'lucide-react';

interface TalentMatchCardProps {
  name: string;
  company: string;
  position: string;
  experience: string;
  matchPercentage: number;
  companyLogo?: string;
}

export default function TalentMatchCard({
  name,
  company,
  position,
  experience,
  matchPercentage,
  companyLogo = 'nxt',
}: TalentMatchCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-neutral-800">{name}</h4>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-md">
              New
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span>{company}</span>
            <span className="size-1 bg-neutral-300 rounded-full"></span>
            <span>{position}</span>
            <span className="size-1 bg-neutral-300 rounded-full"></span>
            <span>{experience}</span>
            <div className="size-5 rounded bg-primary flex items-center justify-center text-[10px] text-white font-bold">
              {companyLogo}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative size-12">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <circle
              className="text-neutral-50 stroke-current"
              cx="18"
              cy="18"
              fill="none"
              r="16"
              strokeWidth="4"
            />
            <circle
              className="text-emerald-400 stroke-current"
              cx="18"
              cy="18"
              fill="none"
              r="16"
              strokeDasharray="100"
              strokeDashoffset={100 - matchPercentage}
              strokeLinecap="round"
              strokeWidth="4"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-neutral-800">{matchPercentage}%</span>
          </div>
        </div>
        <button className="size-10 rounded-xl border border-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-neutral-50 transition-colors">
          <Eye className="w-5 h-5" />
        </button>
        <button className="size-10 rounded-xl border border-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-50 transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
