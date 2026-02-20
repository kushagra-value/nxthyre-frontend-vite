interface ScheduleItem {
  time: string;
  type: string;
  name: string;
  company: string;
  position: string;
  location: string;
  color: 'cyan' | 'purple' | 'orange';
}

export default function ScheduleWidget() {
  const scheduleItems: ScheduleItem[] = [
    {
      time: '11:30 PM',
      type: '1st Round Interview',
      name: 'Max Verstappen',
      company: 'Deloitte',
      position: 'Full Stack Developer',
      location: 'Zoom',
      color: 'cyan',
    },
    {
      time: '12:30 PM',
      type: 'Technical Round',
      name: 'Brad Pitt',
      company: 'HGS',
      position: 'Software Developer',
      location: 'Virtual',
      color: 'purple',
    },
    {
      time: '02:30 PM',
      type: 'Technical Round',
      name: 'Robert Pattinson',
      company: 'Jupiter',
      position: 'Marketing Manager',
      location: 'F2F',
      color: 'orange',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-neutral-800">Schedule</h3>
        <span className="px-3 py-1 bg-neutral-50 border border-neutral-100 rounded-lg text-[10px] font-bold text-neutral-400">
          Today
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {scheduleItems.map((item, idx) => {
          const colorMap = {
            cyan: 'bg-cyan-100 border-cyan-400 text-cyan-700',
            purple: 'bg-purple-100 border-purple-400 text-purple-700',
            orange: 'bg-orange-100 border-orange-400 text-orange-700',
          };
          const colorClasses = colorMap[item.color];

          return (
            <div key={idx} className="flex gap-3 items-start">
              <span className="text-[11px] font-semibold text-neutral-400 w-14 pt-1">{item.time}</span>
              <div className={`flex-1 ${colorClasses} border-l-4 p-4 rounded-r-2xl`}>
                <p className={`text-[10px] font-semibold mb-1 opacity-80`}>
                  {item.type}
                </p>
                <p className="text-sm font-bold text-neutral-900">{item.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-neutral-600 font-medium">
                    {item.company} | {item.position}
                  </span>
                  <span className="px-2 py-0.5 bg-white bg-opacity-60 text-[10px] font-semibold text-neutral-500 rounded">
                    {item.location}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
