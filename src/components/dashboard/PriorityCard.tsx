import { ArrowRight } from 'lucide-react';

interface PriorityCardProps {
  name: string;
  role: string;
  daysAgo: number;
  status: string;
  statusColor: 'blue' | 'rose' | 'amber';
}

export default function PriorityCard({ name, role, daysAgo, status, statusColor }: PriorityCardProps) {
  const colorClasses = {
    blue: 'bg-primary/5 text-primary',
    rose: 'bg-rose-50 text-rose-500',
    amber: 'bg-amber-50 text-amber-500',
  };

  return (
    <div className="p-4 rounded-2xl border border-neutral-100 flex flex-col gap-3 group cursor-pointer hover:border-primary/20 transition-all bg-white">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-sm font-bold text-neutral-800">{name}</h4>
          <span className="text-[11px] text-neutral-400 font-medium">{role}</span>
        </div>
        <span className="text-[11px] font-medium text-neutral-300">{daysAgo} Days ago</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg ${colorClasses[statusColor]}`}>
          {status}
        </span>
        <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}
