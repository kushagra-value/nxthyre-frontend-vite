import { STAGE_COLORS, getColorFromString } from '../../utils/stageColors';

interface EventLegendProps {
  className?: string;
  stages: { id: number; name: string; slug: string; sort_order: number }[];
}

export const EventLegend = ({ className = '', stages }: EventLegendProps) => {
  // Filter only stages that appear after "Shortlisted"
  const shortlistedOrder = stages.find(s => s.slug === 'shortlisted')?.sort_order || 5;
  const relevantStages = stages.filter(stage => {
    const isAfterShortlisted = stage.sort_order > shortlistedOrder;
    const isNotArchives = stage.slug !== 'archives'; // Explicitly exclude Archives
    return isAfterShortlisted && isNotArchives;
  });
  
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {relevantStages.map((stage) => {
        const config = STAGE_COLORS[stage.slug] || {
          bg: getColorFromString(stage.slug),
          label: stage.name,
        };

        return (
          <div
            key={stage.id}
            className="flex items-center gap-2 bg-white rounded-lg px-4 py-2.5 shadow-sm border border-gray-100"
          >
            <div
              className="w-1 h-7 rounded-full"
              style={{ backgroundColor: config.bg }}
            />
            <span className="text-base font-medium text-gray-700">
              {config.label}
            </span>
          </div>
        );
      })}

      
      {relevantStages.length === 0 && (
        <span className="text-gray-500 text-base">No interview stages defined</span>
      )}
    </div>
  );
};