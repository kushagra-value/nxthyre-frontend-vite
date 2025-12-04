import { CalendarEvent } from '../data/mockEvents';

interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onCellClick: (date: string, time?: string) => void;  // UPDATED
}

const typeColors = {
  'first-round': '#FFB800',
  'face-to-face': '#8535EB',
  'hr-round': '#2FD08D',
  f2f1: '#348AEF',
};

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

export const MonthView = ({ events, currentDate, onCellClick }: MonthViewProps) => {
  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return events.filter((e) => e.date === dateString);
  };

  const today = new Date();
  const isToday = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <div className="overflow-auto" style={{ maxHeight: '589px' }}>
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-4 text-center border-r border-gray-200 last:border-r-0"
            >
              <span className="text-lg text-gray-900 font-normal">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            return (
              <div
                key={index}
                onClick={() => day && onCellClick(day.toISOString().split('T')[0], '09:00')}
                className="min-h-[120px] border-b border-r border-dashed border-gray-300 last:border-r-0 p-2 relative cursor-pointer hover:bg-blue-50 transition-colors"
              >
                {day && (
                  <>
                    <div
                      className={`text-lg mb-2 ${
                        isToday(day)
                          ? 'text-[#0F47F2] font-semibold'
                          : 'text-gray-600'
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1.5 rounded truncate"
                          style={{
                            backgroundColor: `${typeColors[event.type]}20`,
                            borderLeft: `3px solid ${typeColors[event.type]}`,
                          }}
                        >
                          <div className="font-medium text-gray-900 truncate">
                            {event.title}
                          </div>
                          <div className="text-gray-600 text-[10px]">
                            {event.startTime}
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1.5">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
