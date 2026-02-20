import React from 'react';

interface Activity {
  icon: 'calendar' | 'phone' | 'check';
  text: string;
  time: string;
}

const CalendarIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="2" width="11" height="10.5" rx="1.5" stroke="#0F47F2" strokeWidth="1" fill="none" />
    <line x1="3.5" y1="1" x2="3.5" y2="3" stroke="#0F47F2" strokeWidth="1" strokeLinecap="round" />
    <line x1="10.5" y1="1" x2="10.5" y2="3" stroke="#0F47F2" strokeWidth="1" strokeLinecap="round" />
    <line x1="1.5" y1="5" x2="12.5" y2="5" stroke="#0F47F2" strokeWidth="1" />
    <line x1="5" y1="7.5" x2="5" y2="7.5" stroke="#0F47F2" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const PhoneIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 1.5C9.5 1.7 10.4 2.2 11.1 2.9C11.8 3.6 12.3 4.5 12.5 5.5" stroke="#0F47F2" strokeWidth="1" strokeLinecap="round" />
    <path d="M8.5 3.5C9.1 3.7 9.6 4 10 4.4C10.4 4.8 10.6 5.3 10.7 5.9" stroke="#0F47F2" strokeWidth="1" strokeLinecap="round" />
    <path d="M5.2 6.8C5.8 7.9 6.7 8.8 7.8 9.4L8.8 8.4C8.9 8.3 9.1 8.3 9.2 8.3L11.5 9.1C11.7 9.2 11.8 9.4 11.8 9.6V11.8C11.8 12 11.6 12.2 11.4 12.2C5.8 11.8 1.8 7.2 2 2.6C2 2.4 2.2 2.2 2.4 2.2H4.4C4.6 2.2 4.8 2.3 4.9 2.5L5.7 4.8C5.7 4.9 5.7 5.1 5.6 5.2L4.6 6.2C4.5 6.4 4.5 6.6 5.2 6.8Z" fill="#0F47F2" />
  </svg>
);

const CheckIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 7L6.5 9L10 5" stroke="#0F47F2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="1" y="1" width="12" height="12" rx="3" stroke="#0F47F2" strokeWidth="1" fill="none" />
  </svg>
);

export default function RecentActivities() {
  const activities: { label: string; items: Activity[] }[] = [
    {
      label: 'Today',
      items: [
        {
          icon: 'calendar',
          text: 'Sarah Jenkins shortlisted for next round',
          time: '10:45 AM',
        },
        {
          icon: 'phone',
          text: 'Mark Anderson follow up is done',
          time: '10:25 AM',
        },
      ],
    },
    {
      label: 'Yesterday',
      items: [
        {
          icon: 'check',
          text: 'Steve Smith profile got shortlisted for final round',
          time: '11:11 PM',
        },
      ],
    },
  ];

  const getIcon = (icon: string): React.ReactNode => {
    switch (icon) {
      case 'calendar':
        return CalendarIcon;
      case 'phone':
        return PhoneIcon;
      case 'check':
        return CheckIcon;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-[10px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-sm font-normal text-black leading-[17px]">Recent Activities</span>
        <span
          className="px-3 py-1 text-sm font-normal text-[#4B5563] leading-[17px] rounded-md"
          style={{ border: '0.5px solid #D1D1D6' }}
        >
          Today
        </span>
      </div>

      <div className="overflow-y-auto max-h-[260px] hide-scrollbar px-5 pb-5">
        <div className="flex flex-col gap-4">
          {activities.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <p className="text-sm font-normal text-[#4B5563] leading-[17px] mb-3">
                {section.label}
              </p>
              <div className="flex flex-col">
                {section.items.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-1.5 rounded-[5px] px-2.5 py-1.5"
                    style={{ borderBottom: '0.5px dashed #C7C7CC' }}
                  >
                    <div
                      className="w-6 h-6 rounded-[5px] flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: '#E7EDFF',
                        border: '0.5px solid #FFFFFF',
                      }}
                    >
                      {getIcon(activity.icon)}
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="text-sm font-normal text-[#4B5563] leading-[17px]">
                        {activity.text}
                      </span>
                      <span className="text-xs font-normal text-[#AEAEB2] leading-[14px]">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
