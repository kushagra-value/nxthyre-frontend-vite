
interface PriorityCardProps {
  name: string;
  role: string;
  company?: string;
  daysAgo: number;
  status: string;
  statusColor: 'blue' | 'rose' | 'amber' | 'indigo' | 'grey' | 'green';
  isDone?: boolean;
  onClick?: () => void;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-[#E7EDFF]', text: 'text-[#0088FF]' },
  rose: { bg: 'bg-[rgba(255,56,60,0.14)]', text: 'text-[#FF383C]' },
  amber: { bg: 'bg-[#FFF7D6]', text: 'text-[#FF8D28]' },
  indigo: { bg: 'bg-[#E7EDFF]', text: 'text-[#6155F5]' },
  grey: { bg: 'bg-[#F3F5F7]', text: 'text-[#8E8E93]' },
  green: { bg: 'bg-[#E7F9F0]', text: 'text-[#00B69B]' },
};

export default function PriorityCard({ name, role, company, daysAgo, status, statusColor, isDone, onClick }: PriorityCardProps) {
  const colors = isDone ? statusStyles.green : (statusStyles[statusColor] || statusStyles.grey);
  // const status = split the status string by "-" and store the first one 
  const status_tag = status.split("-")[0];

  return (
    <div className={`bg-white rounded-lg p-2.5 flex flex-col gap-2.5 cursor-pointer ${isDone ? 'border-[0.5px] border-[#00B69B]/20' : ''}`} onClick={onClick}>
      {/* Top row: name + days */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-normal text-[#4B5563] leading-[17px]">{name}</span>
          <span className="text-[10px] font-light text-[#AEAEB2] leading-3">{daysAgo} Days ago</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-normal text-[#AEAEB2] leading-[14px]">{role}</span>
          {company && <span className="text-xs font-normal text-[#0F47F2] leading-[14px] mt-0.5">{company}</span>}
        </div>
      </div>

      {/* Bottom row: status + arrow/check */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 text-[10px] font-normal leading-3 rounded ${colors.bg} ${colors.text}`}>
          {isDone ? `${status_tag}` : status_tag}
        </span>
        <div className="w-5 h-5 flex items-center justify-center rounded-[3px]">
          {isDone ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="20" height="20" rx="4" fill="#00B69B" />
              <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.92893 10.0711H17.0711M17.0711 10.0711L11.7678 4.76777M17.0711 10.0711L11.7678 15.3744" stroke="#AEAEB2" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
