import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export default function CalendarWidget() {
  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const dates = [
    { day: '01', type: 'normal' },
    { day: '02', type: 'active' },
    { day: '03', type: 'normal' },
    { day: '04', type: 'normal' },
    { day: '05', type: 'normal' },
    { day: '06', type: 'active' },
    { day: '07', type: 'normal' },
    { day: '08', type: 'normal' },
    { day: '09', type: 'normal' },
    { day: '10', type: 'light' },
    { day: '11', type: 'light' },
    { day: '12', type: 'normal' },
    { day: '13', type: 'normal' },
    { day: '14', type: 'normal' },
    { day: '15', type: 'active' },
    { day: '16', type: 'normal' },
    { day: '17', type: 'normal' },
    { day: '18', type: 'normal' },
    { day: '19', type: 'active' },
    { day: '20', type: 'active' },
    { day: '21', type: 'normal' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 font-bold text-neutral-800">
          February, 2026 <ChevronDown className="w-4 h-4" />
        </div>
        <div className="flex gap-2 text-neutral-400">
          <ChevronLeft className="w-4 h-4 cursor-pointer" />
          <ChevronRight className="w-4 h-4 cursor-pointer" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-3 text-center">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-[10px] font-bold text-neutral-300 uppercase">
            {day}
          </div>
        ))}
        {dates.map((date, idx) => {
          if (date.type === 'active') {
            return (
              <div key={idx} className="text-xs text-white py-1 flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center font-semibold">
                  {date.day}
                </span>
              </div>
            );
          }
          if (date.type === 'light') {
            return (
              <div key={idx} className="text-xs text-primary py-1 flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center font-medium">
                  {date.day}
                </span>
              </div>
            );
          }
          return (
            <div key={idx} className="text-xs text-neutral-700 py-1 font-medium">
              {date.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
