import { useState, useEffect } from 'react';
import { scheduleService, InterviewModeStat } from '../../../services/scheduleService';

interface InterviewMode {
  label: string;
  color: string;
  count: number;
}

interface InterviewModeLegendProps {
  modes?: InterviewMode[];
}

const DEFAULT_MODES: InterviewMode[] = [
  { label: 'Zoom', color: '#3B82F6', count: 0 },
  { label: 'Virtual / Teams', color: '#8B5CF6', count: 0 },
  { label: 'Face to Face', color: '#F97316', count: 0 },
  { label: 'Overdue', color: '#EF4444', count: 0 },
];

export default function InterviewModeLegend({ modes: propModes }: InterviewModeLegendProps) {
  const [apiModes, setApiModes] = useState<InterviewMode[]>(DEFAULT_MODES);
  const [overdue, setOverdue] = useState(0);

  useEffect(() => {
    if (propModes) return; // Skip API call if modes are passed as prop
    const loadModeStats = async () => {
      try {
        const res = await scheduleService.getModeStats();
        const mapped: InterviewMode[] = res.modes.map((m: InterviewModeStat) => ({
          label: m.label,
          color: m.color,
          count: m.count,
        }));
        setApiModes(mapped);
        setOverdue(res.overdue || 0);
      } catch (err) {
        console.error('Failed to load mode stats:', err);
      }
    };
    loadModeStats();
  }, [propModes]);

  const displayModes = propModes || apiModes;

  // Add overdue row if from API and overdue > 0
  const allRows = !propModes && overdue > 0
    ? [...displayModes, { label: 'Overdue', color: '#EF4444', count: overdue }]
    : displayModes;

  return (
    <div className="bg-white p-4">
      <h4 className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider mb-3">
        Interview Mode
      </h4>
      <div className="flex flex-col gap-2.5">
        {allRows.map((mode) => (
          <div key={mode.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: mode.color }}
              />
              <span className="text-xs text-[#4B5563] font-normal">{mode.label}</span>
            </div>
            <span className="text-xs text-[#8E8E93] font-normal">{mode.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
