import { ScheduleItemData } from '../dashboardData';

const colorConfig: Record<string, { bg: string; dot: string; nameColor: string; badgeBg: string; badgeText: string }> = {
  grey: {
    bg: 'rgba(75, 85, 99, 0.28)',
    dot: '#4B5563',
    nameColor: '#4B5563',
    badgeBg: '#0088FF',
    badgeText: '#FFFFFF',
  },
  cyan: {
    bg: 'rgba(0, 200, 179, 0.4)',
    dot: '#00C8B3',
    nameColor: '#000000',
    badgeBg: 'rgba(255, 255, 255, 0.55)',
    badgeText: '#000000',
  },
  purple: {
    bg: 'rgba(97, 85, 245, 0.4)',
    dot: '#6155F5',
    nameColor: '#000000',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    badgeText: '#000000',
  },
  orange: {
    bg: 'rgba(255, 141, 40, 0.4)',
    dot: '#FF8D28',
    nameColor: '#000000',
    badgeBg: 'rgba(255, 255, 255, 0.55)',
    badgeText: '#000000',
  },
};

interface ScheduleWidgetProps {
  items: ScheduleItemData[];
  onEventClick?: (item: ScheduleItemData) => void;
}

export default function ScheduleWidget({ items, onEventClick }: ScheduleWidgetProps) {
  return (
    <div className="bg-white rounded-[10px] flex flex-col overflow-hidden" >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-sm font-normal text-black leading-[17px]">Schedule</span>
        <span
          className="px-3 py-1 text-sm font-normal text-[#4B5563] leading-[17px] rounded-md"
          style={{ border: '0.5px solid #D1D1D6' }}
        >
          Today
        </span>
      </div>

      <div className="overflow-y-auto max-h-[314px] hide-scrollbar px-5 pb-5">
        <div className="relative flex flex-col gap-2.5">
          <div
            className="absolute left-[72px] top-0 bottom-0 w-0"
            style={{ borderLeft: '1px dashed #D1D1D6' }}
          />

          {items.map((item) => {
            const config = colorConfig[item.color];

            return (
              <div key={item.id} className={`flex items-center gap-2 relative ${!item.isDone ? 'cursor-pointer' : ''}`} onClick={!item.isDone ? () => onEventClick?.(item) : undefined}>
                <span className="w-[60px] shrink-0 text-sm font-normal text-[#4B5563] leading-5">
                  {item.time}
                </span>

                <div
                  className="w-2 h-2 rounded-full shrink-0 relative z-10"
                  style={{ backgroundColor: config.dot }}
                />

                <div
                  className="flex-1 rounded-md p-2.5 relative"
                  style={{ backgroundColor: config.bg }}
                >
                  <span className="text-[10px] font-normal text-[#4B5563] leading-3 block">
                    {item.type}
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      className="text-sm font-medium leading-[17px]"
                      style={{ color: config.nameColor }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="px-2 py-1 text-[10px] font-normal leading-3 rounded-[5px]"
                      style={{
                        backgroundColor: config.badgeBg,
                        color: config.badgeText,
                      }}
                    >
                      {item.location}
                    </span>
                  </div>
                  <span className="text-[10px] font-normal text-[#4B5563] leading-3 block mt-1.5">
                    {item.details}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
