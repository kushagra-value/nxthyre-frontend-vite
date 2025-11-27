import { ThumbsUp } from 'lucide-react';
import { CalendarEvent } from '../data/mockEvents';

interface EventCardProps {
  event: CalendarEvent;
}

const typeColors = {
  'first-round': {
    bg: 'rgba(255, 184, 0, 0.12)',
    border: '#FFB800',
  },
  'face-to-face': {
    bg: 'rgba(133, 53, 235, 0.12)',
    border: '#8535EB',
  },
  'hr-round': {
    bg: 'rgba(47, 208, 141, 0.12)',
    border: '#2FD08D',
  },
  f2f1: {
    bg: 'rgba(52, 138, 239, 0.12)',
    border: '#348AEF',
  },
};

export const EventCard = ({ event }: EventCardProps) => {
  const colors = typeColors[event.type];

  return (
    <div
      className="rounded-md overflow-hidden relative h-full flex flex-col"
      style={{ backgroundColor: colors.bg }}
    >
      <div
        className="absolute left-0 top-0 w-1.5 h-full rounded-l-md"
        style={{ backgroundColor: colors.border }}
      />
      <div className="pl-4 pr-3 py-1 flex-1 flex flex-col justify-center overflow-hidden">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-normal text-gray-900 truncate">
              {event.title}
            </h4>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600 pl-8 gap-1">
          <span className="truncate">
            {event.startTime} - {event.endTime}
          </span>
          {event.confirmed && (
            <ThumbsUp className="w-3 h-3 text-[#1CB977] fill-[#1CB977] flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
};
