import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
}

export default function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div
      className="bg-white flex flex-col items-start rounded-xl"
      style={{
        padding: '20px',
        gap: '8px',
        border: '0.5px solid #D1D1D6',
      }}
    >
      {/* Top: Icon + Trend */}
      <div className="flex items-center w-full" style={{ gap: '4px' }}>
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{
            width: '40px',
            height: '40px',
            border: '0.5px solid rgba(0, 0, 0, 0.2)',
          }}
        >
          <Icon className="w-5 h-5" style={{ color: '#0F47F2' }} />
        </div>
        {trend && (
          <span
            className="ml-auto whitespace-nowrap"
            style={{
              fontFamily: 'Gellix, sans-serif',
              fontWeight: 300,
              fontSize: '12px',
              lineHeight: '20px',
              textAlign: 'right',
              color: '#069855',
            }}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Bottom: Label + Value */}
      <div className="flex flex-col w-full" style={{ gap: '4px' }}>
        <span
          style={{
            fontFamily: 'Gellix, sans-serif',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '14px',
            color: '#4B5563',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'Gellix, sans-serif',
            fontWeight: 500,
            fontSize: '32px',
            lineHeight: '40px',
            color: '#000000',
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
