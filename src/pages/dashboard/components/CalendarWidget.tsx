import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

type DateType = 'normal' | 'dark-blue' | 'blue' | 'medium-blue' | 'light-blue' | 'very-light-blue';

interface CalendarDate {
  day: string;
  type: DateType;
  textDark?: boolean;
}

interface CalendarWidgetProps {
  onDateClick?: () => void;
}

export default function CalendarWidget({ onDateClick }: CalendarWidgetProps) {
  const daysOfWeek = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
  const dates: CalendarDate[] = [
    { day: '01', type: 'normal' },
    { day: '02', type: 'dark-blue' },
    { day: '03', type: 'normal' },
    { day: '04', type: 'normal' },
    { day: '05', type: 'normal' },
    { day: '06', type: 'blue' },
    { day: '07', type: 'normal' },
    { day: '08', type: 'normal' },
    { day: '09', type: 'normal' },
    { day: '10', type: 'light-blue', textDark: true },
    { day: '11', type: 'light-blue', textDark: true },
    { day: '12', type: 'normal' },
    { day: '13', type: 'normal' },
    { day: '14', type: 'normal' },
    { day: '15', type: 'dark-blue' },
    { day: '16', type: 'normal' },
    { day: '17', type: 'normal' },
    { day: '18', type: 'normal' },
    { day: '19', type: 'dark-blue' },
    { day: '20', type: 'medium-blue' },
    { day: '21', type: 'normal' },
    { day: '22', type: 'dark-blue' },
    { day: '23', type: 'blue' },
    { day: '24', type: 'light-blue', textDark: true },
    { day: '25', type: 'normal' },
    { day: '26', type: 'very-light-blue', textDark: true },
    { day: '27', type: 'normal' },
    { day: '28', type: 'normal' },
  ];

  const circleColors: Record<string, string> = {
    'dark-blue': '#0034D2',
    'blue': '#0F47F2',
    'medium-blue': '#5982FD',
    'light-blue': '#88A5FF',
    'very-light-blue': '#BBCCFF',
  };

  return (
    <div className="bg-white rounded-[10px] p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5 text-sm font-normal text-black leading-[17px] cursor-pointer">
          February, 2026
          <ChevronDown className="w-5 h-5 opacity-60" />
        </div>
        <div className="flex items-center gap-1">
          <ChevronLeft className="w-5 h-5 text-[#8E8E93] cursor-pointer" />
          <ChevronRight className="w-5 h-5 text-[#8E8E93] cursor-pointer" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-5">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-xs font-normal text-[#8E8E93] leading-[14px] text-center"
          >
            {day}
          </div>
        ))}

        {dates.map((date, idx) => {
          const isCircle = date.type !== 'normal';
          const bgColor = isCircle ? circleColors[date.type] : undefined;
          const textColor = isCircle
            ? date.textDark
              ? '#000000'
              : '#FFFFFF'
            : '#4B5563';

          return (
            <div
              key={idx}
              className="flex items-center justify-center cursor-pointer"
              onClick={onDateClick}
            >
              {isCircle ? (
                <span
                  className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-normal leading-[14px]"
                  style={{ backgroundColor: bgColor, color: textColor }}
                >
                  {date.day}
                </span>
              ) : (
                <span
                  className="text-xs font-normal leading-[14px]"
                  style={{ color: textColor }}
                >
                  {date.day}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
