import { UserCheck, Phone, CheckCircle } from 'lucide-react';

interface Activity {
  icon: 'user' | 'phone' | 'check';
  text: string;
  time: string;
  color: 'blue' | 'emerald';
}

export default function RecentActivities() {
  const activities: { label: string; items: Activity[] }[] = [
    {
      label: 'Today',
      items: [
        {
          icon: 'user',
          text: 'Sarah Jenkins shortlisted for next round',
          time: '10:45 AM',
          color: 'blue',
        },
        {
          icon: 'phone',
          text: 'Mark Anderson follow up is done',
          time: '10:25 AM',
          color: 'blue',
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
          color: 'emerald',
        },
      ],
    },
  ];

  const getIcon = (icon: string, color: string) => {
    const iconClass = 'w-4 h-4';
    const colorClass = color === 'blue' ? 'text-primary' : 'text-emerald-500';

    switch (icon) {
      case 'user':
        return <UserCheck className={`${iconClass} ${colorClass}`} />;
      case 'phone':
        return <Phone className={`${iconClass} ${colorClass}`} />;
      case 'check':
        return <CheckCircle className={`${iconClass} ${colorClass}`} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm flex-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-neutral-800">Recent Activities</h3>
        <span className="px-3 py-1 bg-neutral-50 border border-neutral-100 rounded-lg text-[10px] font-bold text-neutral-400">
          Today
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {activities.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <p className="text-[10px] font-bold text-neutral-300 uppercase mb-3">{section.label}</p>
            <div className="flex flex-col gap-3">
              {section.items.map((activity, idx) => (
                <div key={idx} className="flex gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      activity.color === 'blue' ? 'bg-blue-50' : 'bg-emerald-50'
                    }`}
                  >
                    {getIcon(activity.icon, activity.color)}
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-neutral-700 leading-snug">{activity.text}</p>
                    <span className="text-[10px] text-neutral-400">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
