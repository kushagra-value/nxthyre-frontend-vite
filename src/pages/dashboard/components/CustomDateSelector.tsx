import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDateSelectorProps {
  onApply: (range: { start?: Date; end?: Date; label: string }) => void;
  onClose: () => void;
}

type Preset = 'Today' | 'Last Week' | 'Last Month' | 'Custom Date';

const CustomDateSelector: React.FC<CustomDateSelectorProps> = ({ onApply, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState<Preset>('Today');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const presets: Preset[] = ['Today', 'Last Week', 'Last Month', 'Custom Date'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Calendar logic
  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Adjust for Monday start (0=Sun, 1=Mon, ..., 6=Sat) -> (6=Sun, 0=Mon, ..., 5=Sat)
    return day === 0 ? 6 : day - 1;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (clickedDate < startDate) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else {
      setEndDate(clickedDate);
    }
  };

  const isSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (startDate && date.getTime() === startDate.getTime()) return true;
    if (endDate && date.getTime() === endDate.getTime()) return true;
    return false;
  };

  const isInRange = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return startDate && endDate && date > startDate && date < endDate;
  };

  const handlePresetClick = (preset: Preset) => {
    if (preset === 'Custom Date') {
      setSelectedPreset(preset);
    } else {
      // Prepare range and apply immediately for quick presets
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let start = new Date(today);
      let end = new Date(today);
      end.setHours(23, 59, 59, 999);

      if (preset === 'Last Week') {
        start.setDate(today.getDate() - 7);
      } else if (preset === 'Last Month') {
        start.setMonth(today.getMonth() - 1);
      }

      onApply({ start, end, label: preset });
      onClose();
    }
  };

  const handleApply = () => {
    if (selectedPreset === 'Custom Date' && startDate) {
      const finalEnd = endDate || startDate;
      const label = endDate 
        ? `${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
        : startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      
      onApply({ start: startDate, end: finalEnd, label });
      onClose();
    }
  };

  const renderDays = () => {
    const days = [];
    const numDays = daysInMonth(currentMonth);
    const offset = startDayOfMonth(currentMonth);

    for (let i = 0; i < offset; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let i = 1; i <= numDays; i++) {
      const selected = isSelected(i);
      const inRange = isInRange(i);
      const isStart = startDate && new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i).getTime() === startDate.getTime();
      const isEnd = endDate && new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i).getTime() === endDate.getTime();

      days.push(
        <div
          key={i}
          className="relative h-10 w-10 flex items-center justify-center cursor-pointer text-sm font-normal text-[#4B5563]"
          onClick={() => handleDateClick(i)}
        >
          {inRange && <div className="absolute inset-0 bg-[#E7EDFF]" />}
          {isStart && endDate && <div className="absolute top-0 bottom-0 left-1/2 right-0 bg-[#E7EDFF]" />}
          {isEnd && startDate && <div className="absolute top-0 bottom-0 left-0 right-1/2 bg-[#E7EDFF]" />}
          <div className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${selected ? 'bg-[#0F47F2] text-white' : 'hover:bg-slate-50'}`}>
            {i.toString().padStart(2, '0')}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-[10px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] flex overflow-hidden transition-all duration-300 ${selectedPreset === 'Custom Date' ? 'min-w-[600px]' : 'w-[200px]'}`}
      onClick={e => e.stopPropagation()}
    >
      {/* Sidebar / Menu */}
      <div className={`${selectedPreset === 'Custom Date' ? 'w-[180px] border-r border-[#D1D1D6]' : 'w-full'} p-3 flex flex-col gap-1`}>
        {presets.map(preset => (
          <button
            key={preset}
            onClick={() => handlePresetClick(preset)}
            className={`w-full text-left px-4 py-3 rounded-lg text-[15px] font-normal transition-colors ${selectedPreset === preset ? 'text-[#0F47F2] bg-[#E7EDFF]/50' : 'text-[#4B5563] hover:bg-slate-50'}`}
          >
            {preset}
          </button>
        ))}

        {selectedPreset === 'Custom Date' && (
          <button
            onClick={handleApply}
            disabled={!startDate}
            className="w-[140px] mx-auto bg-[#0F47F2] text-white py-2.5 rounded-[8px] text-[15px] font-medium hover:bg-blue-700 transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        )}
      </div>

      {/* Calendar Area */}
      {selectedPreset === 'Custom Date' && (
        <div className="flex-1 p-6 flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xl font-normal text-[#4B5563]">
              {currentMonth.toLocaleString('default', { month: 'long' })}
            </span>
            <div className="flex gap-4">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-50 rounded text-[#8E8E93]">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-1 hover:bg-slate-50 rounded text-[#8E8E93]">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
              <div key={day} className="h-10 w-10 flex items-center justify-center text-xs font-normal text-[#8E8E93]">
                {day}
              </div>
            ))}
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateSelector;
