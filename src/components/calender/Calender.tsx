import { useState , useEffect } from 'react';
import apiClient from '../../services/api';
import { CalendarHeader } from './CalenderHeader';
import { EventLegend } from './EventLegend';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { EventForm } from './EventForm';
import type { CalendarEvent } from '../../data/mockEvents';  
import { useParams } from 'react-router-dom';

interface CalenderProps {
  onCellClick: (date: string, time?: string) => void;
}

export const Calender: React.FC<CalenderProps> = ({onCellClick}) => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapApiEvent = (apiEvent: any): CalendarEvent => {
    const start = new Date(apiEvent.start_at);
    const end = new Date(apiEvent.end_at);

    let type: CalendarEvent['type'] = 'first-round';
    if (apiEvent.round_name?.toLowerCase().includes('hr')) type = 'hr-round';
    else if (apiEvent.round_name?.toLowerCase().includes('face') || apiEvent.round_name?.toLowerCase().includes('f2f')) type = 'face-to-face';
    else if (apiEvent.round_name?.toLowerCase().includes('f2f1')) type = 'f2f1';

    return {
      id: apiEvent.id,
      title: apiEvent.candidate_name || apiEvent.title,
      type,
      attendee: apiEvent.candidate_name || apiEvent.title,
      startTime: start.toTimeString().slice(0, 5), // "09:00"
      endTime: end.toTimeString().slice(0, 5),
      date: start.toISOString().split('T')[0],
      confirmed: apiEvent.status === 'CONFIRMED' || apiEvent.status === 'COMPLETED',
    };
  };



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

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        let start = new Date(currentDate);
        let end = new Date(currentDate);

        if (view === 'day') {
          end = new Date(start);
        } else if (view === 'week') {
          const day = start.getDay();
          start.setDate(start.getDate() - day + 1); // Monday
          end = new Date(start);
          end.setDate(end.getDate() + 6);
        } else if (view === 'month') {
          start = new Date(start.getFullYear(), start.getMonth(), 1);
          end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        }

        const params: any = {
          view,
          start: start.toISOString().split('T')[0],
          job_id: pipelineId,
        };

        const response = await apiClient.get('/jobs/interview-events/calendar-summary/', { params });
        const apiDays = response.data.days || [];

        const mappedEvents: CalendarEvent[] = [];
        apiDays.forEach((day: any) => {
          day.events.forEach((e: any) => mappedEvents.push(mapApiEvent(e)));
        });

        setEvents(mappedEvents.length > 0 ? mappedEvents : []);
      } catch (err: any) {
        console.error('Failed to load calendar events:', err);
        setError('Failed to load events');
        setEvents([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [view, currentDate, pipelineId]);

  if (loading) {
      return (
        <div className="min-h-screen bg-[#ECF1FF] p-8 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading calendar events...</div>
        </div>
      );
    }

  if (error) {
    return (
      <div className="min-h-screen bg-[#ECF1FF] p-8 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

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
