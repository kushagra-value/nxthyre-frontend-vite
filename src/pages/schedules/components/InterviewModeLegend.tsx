interface InterviewMode {
  label: string;
  color: string;
  count: number;
}

interface InterviewModeLegendProps {
  modes?: InterviewMode[];
}

const DEFAULT_MODES: InterviewMode[] = [
  { label: 'Zoom', color: '#3B82F6', count: 30 },
  { label: 'Virtual / Teams', color: '#8B5CF6', count: 24 },
  { label: 'Face to Face', color: '#F97316', count: 12 },
  { label: 'Overdue', color: '#EF4444', count: 10 },
];

export default function InterviewModeLegend({ modes = DEFAULT_MODES }: InterviewModeLegendProps) {
  return (
    <div className="bg-white rounded-[10px] p-4">
      <h4 className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider mb-3">
        Interview Mode
      </h4>
      <div className="flex flex-col gap-2.5">
        {modes.map((mode) => (
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
