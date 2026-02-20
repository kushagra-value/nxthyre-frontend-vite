import { ArrowUpRight } from 'lucide-react';
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  dateText?: string;
  trendText?: string;
}

export default function StatCard({ icon, label, value, trend, dateText, trendText }: StatCardProps) {
  return (
    <div
      className="bg-white flex flex-col items-start rounded-xl"
      style={{
        padding: '20px',
        gap: '8px',
        border: '0.5px solid #D1D1D6',
      }}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{
            width: '40px',
            height: '40px',
            border: '0.5px solid rgba(0, 0, 0, 0.2)',
          }}
        >
          {icon}
        </div>
        {trend && trendText && (
          <div className="flex items-center gap-2">
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
              <ArrowUpRight className="w-1 h-1" />
            </span>
            <span
              className="ml-auto whitespace-nowrap"
              style={{
                fontFamily: 'Gellix, sans-serif',
                fontWeight: 300,
                fontSize: '10px',
                lineHeight: '20px',
                textAlign: 'right',
                color: '#8E8E93',
              }}
            >
              {trendText}
            </span>
          </div>
        )}
      </div>

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
          {dateText && (
            <span
              style={{
                fontFamily: 'Gellix, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '14px',
                color: '#4B5563',
                marginLeft: '4px',
              }}
            >
              {dateText}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
