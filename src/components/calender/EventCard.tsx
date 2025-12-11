import { ThumbsUp } from 'lucide-react';
import { CalendarEvent } from '../../data/mockEvents';
import { STAGE_COLORS, getColorFromString } from '../../utils/stageColors';

interface EventCardProps {
  event: CalendarEvent;
}

export const EventCard = ({ event }: EventCardProps) => {
  // Get config: predefined or auto-generated
  const config = STAGE_COLORS[event.type] || {
    bg: getColorFromString(event.type) + '20',        // e.g. #8B5CF620
    border: getColorFromString(event.type),
    label: event.roundName || // use human name if available
           event.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
  };

  return (
    <div
      className="m-0.5 rounded-md overflow-hidden relative h-full shadow-sm hover:shadow transition-shadow"
      style={{ backgroundColor: config.bg }}
    >
      {/* Left color bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 h-full rounded-l-md"
        style={{ backgroundColor: config.border }}
      />

      <div className="pl-8 pr-4 py-2 flex flex-col justify-between h-full">
        {/* Top: Avatar + Name + Round */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white shadow-md flex-shrink-0 -ml-1 flex items-center justify-center text-white font-bold text-sm">
            {event.title.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-[#181D25] truncate leading-tight">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 truncate leading-tight mt-0.5">
              {config.label}
            </p>
          </div>
        </div>

        {/* Bottom: Time + Confirmed */}
        <div className="flex items-center justify-between text-sm text-[#4B5563] mt-2">
          <span className="font-normal">
            {event.startTime} – {event.endTime}
          </span>
          {event.confirmed && (
            <ThumbsUp
              className="w-5 h-5"
              fill="#1CB977"
              color="#1CB977"
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  );
};