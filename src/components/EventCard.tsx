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
      className="m-0.5 rounded-md overflow-hidden relative h-full shadow-sm"
      style={{ backgroundColor: colors.bg }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2 h-full rounded-l-md"
        style={{ backgroundColor: colors.border }}
      />
      <div className="pl-4 pr-4 py-2 flex flex-col justify-around h-full">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {event.avatarImageUrl ? (
            <img
                src={event.avatarImageUrl}
                alt={event.title}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0 -ml-1"
            />
            ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white shadow-md flex-shrink-0 -ml-1" />
            )}
          <div className="flex-1 min-w-0">
            {/* Candidate Name */}
            <h3 className="text-lg font-normal text-[#181D25] truncate leading-tight">
              {event.title}
            </h3>

            {/* Round Type */}
            <p className="text-sm text-nowrap truncate leading-tight text-[#4B5563] mt-0.5">
              {event.type === 'first-round' && 'First Round'}
              {event.type === 'face-to-face' && 'Face to Face'}
              {event.type === 'hr-round' && 'HR Round'}
              {event.type === 'f2f1' && 'F2F Round 1'}
            </p>
          </div>
        </div>

        {/* Time + Thumbs Up */}
        <div className="flex items-center justify-between text-sm text-[#4B5563]">
          <span className="font-normal">
            {event.startTime} to {event.endTime}
          </span>

          {event.confirmed && (
            <ThumbsUp
              className="w-5 h-5"
              strokeWidth={1.5}
              fill="#1CB977"
              color="#1CB977"
            />
          )}
        </div>
      </div>
    </div>
  );
};
