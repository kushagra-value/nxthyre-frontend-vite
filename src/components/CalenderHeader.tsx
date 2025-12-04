import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarHeaderProps {
  view: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  displayMonth: string;
}

export const CalendarHeader = ({
  view,
  onViewChange,
  currentDate,
  onNavigate,
  displayMonth,
}: CalendarHeaderProps) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onViewChange('day')}
          className={`px-4 py-2 rounded-md text-lg font-medium transition-colors ${
            view === 'day'
              ? 'bg-white text-gray-600'
              : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          Day
        </button>
        <button
          onClick={() => onViewChange('week')}
          className={`px-5 py-2 rounded-md text-lg font-medium transition-colors ${
            view === 'week'
              ? 'bg-white text-gray-600'
              : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => onViewChange('month')}
          className={`px-4 py-2 rounded-md text-lg font-medium transition-colors ${
            view === 'month'
              ? 'bg-white text-gray-600'
              : 'text-gray-600 hover:bg-white/50'
          }`}
        >
          Month
        </button>
      </div>

      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-600">{displayMonth}</h2>
        <button
          onClick={() => onNavigate('today')}
          className="text-lg text-gray-600 hover:text-gray-800 transition-colors"
        >
          Today
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('prev')}
            className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-gray-100 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onNavigate('next')}
            className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-gray-100 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
