import { useState } from 'react';
import { CalendarHeader } from './CalenderHeader';
import { EventLegend } from './EventLegend';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { EventForm } from './EventForm';
import { mockEvents as initialEvents, CalendarEvent } from '../../data/mockEvents';

interface CalenderProps {
  onCellClick: (date: string, time?: string) => void;
}

export const Calender: React.FC<CalenderProps> = ({onCellClick}) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);


  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    const newDate = new Date(currentDate);

    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }

    setCurrentDate(newDate);
  };

  const displayMonth = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  }).toUpperCase();


  return (
    <div className="min-h-screen bg-[#ECF1FF] p-8">
      <div className="max-w-[1750px] mx-auto">
        <CalendarHeader
          view={view}
          onViewChange={setView}
          currentDate={currentDate}
          onNavigate={handleNavigate}
          displayMonth={displayMonth}
        />

        <EventLegend className="mb-6" />

        {view === 'day' && (
          <DayView
            events={events}
            currentDate={currentDate}
            onCellClick={onCellClick}
          />
        )}
        {view === 'week' && (
          <WeekView
            events={events}
            currentDate={currentDate}
            onCellClick={onCellClick}
          />
        )}
        {view === 'month' && (
          <MonthView
            events={events}
            currentDate={currentDate}
            onCellClick={onCellClick}
          />
        )}
      </div>
    </div>
  );
};
