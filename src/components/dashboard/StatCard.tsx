import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
}

export default function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-semibold text-neutral-400">{label}</span>
        <span className="text-2xl font-bold text-neutral-800">{value}</span>
      </div>
    </div>
  );
}
