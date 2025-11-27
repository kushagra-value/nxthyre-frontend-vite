import { CalendarEvent } from '../data/mockEvents';
import { EventCard } from './EventCard';

interface DayViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onCellClick: (date: string, time?: string) => void;  // UPDATED
}

const timeSlots = [
  '9 am',
  '10 am',
  '11 am',
  '12 pm',
  '01 pm',
  '02 pm',
  '03 pm',
  '04 pm',
];

export const DayView = ({ events, currentDate, onCellClick }: DayViewProps) => {
  const dateString = currentDate.toISOString().split('T')[0];
  const dayEvents = events.filter((e) => e.date === dateString);

  const getEventPosition = (event: CalendarEvent) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const duration = endMinutes - startMinutes;

    const slotHeight = 80;
    const top = ((startMinutes - 9 * 60) / 60) * slotHeight;
    const height = (duration / 60) * slotHeight;

    return { top, height };
  };

  const dayName = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: '589px' }}>
        <div className="relative" style={{ minWidth: '800px' }}>
          <div className="flex border-b border-gray-200">
            <div className="w-32 flex-shrink-0 p-4">
              <span className="text-lg text-gray-900 font-normal">Time</span>
            </div>
            <div className="flex-1 p-4">
              <span className="text-lg text-gray-900 font-normal">
                {dayName}
              </span>
            </div>
          </div>

          <div className="relative flex">
            <div className="w-32 flex-shrink-0">
              {timeSlots.map((time, index) => (
                <div
                  key={time}
                  className="h-20 border-b border-dashed border-gray-300 px-4 flex items-start pt-2"
                >
                  <span
                    className={`text-lg ${
                      time === '11:30 am' ? 'text-[#0F47F2]' : 'text-gray-600'
                    }`}
                  >
                    {time}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex-1 relative border-l border-dashed border-gray-400">
              {timeSlots.map((_, index) => {
                const hour = 9 + index;
                const timeStr = hour > 12 ? `${hour - 12}:00 pm` : `${hour}:00 am`;
                const displayTime = hour === 9 ? '09:00' : hour === 10 ? '10:00' : hour === 11 ? '11:00' : hour === 12 ? '12:00' : `${hour - 12}:00`;
                return (
                  <div
                    key={index}
                    onClick={() => onCellClick(dateString, displayTime)}
                    className="h-20 border-b border-dashed border-gray-300 cursor-pointer hover:bg-blue-50 transition-colors"
                  />
                );
              })}

              <div
                className="absolute left-0 right-0 h-0.5 bg-[#0F47F2] z-10"
                style={{ top: '160px' }}
              >
                <div className="absolute -left-1 -top-1 w-1.5 h-1.5 rounded-full bg-[#0F47F2]" />
              </div>

              {dayEvents.map((event) => {
                const { top, height } = getEventPosition(event);
                return (
                  <div
                    key={event.id}
                    className="absolute left-2 right-2"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <EventCard event={event} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
