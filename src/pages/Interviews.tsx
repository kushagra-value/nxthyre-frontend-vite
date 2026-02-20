import { Calendar, Clock, Users, ChevronDown } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ScheduleWidget from '../components/dashboard/ScheduleWidget';
import CalendarWidget from '../components/dashboard/CalendarWidget';

export default function Interviews() {
  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard icon={Calendar} label="Scheduled Interviews" value="12" trend="10%" trendText="vs last month" />
            <StatCard icon={Clock} label="Pending Feedback" value="5" trend="10%" trendText="vs last month" />
            <StatCard icon={Users} label="Candidates Interviewed" value="87" trend="10%" trendText="vs last month" />
          </div>

          <section className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-800">Upcoming Interviews</h2>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-100 rounded-xl text-xs font-bold text-neutral-600">
                  This Week <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  candidate: 'Max Verstappen',
                  position: 'Senior Product Designer',
                  time: 'Today, 11:30 AM',
                  type: '1st Round Interview',
                  company: 'Deloitte',
                  location: 'Zoom',
                  color: 'cyan',
                },
                {
                  candidate: 'Brad Pitt',
                  position: 'Software Developer',
                  time: 'Today, 12:30 PM',
                  type: 'Technical Round',
                  company: 'HGS',
                  location: 'Virtual',
                  color: 'purple',
                },
                {
                  candidate: 'Dwija Patel',
                  position: 'Product Manager',
                  time: 'Tomorrow, 10:00 AM',
                  type: 'Final Round',
                  company: 'Tech Corp',
                  location: 'On-site',
                  color: 'cyan',
                },
                {
                  candidate: 'Ana De Armas',
                  position: 'UI/UX Designer',
                  time: 'Tomorrow, 2:00 PM',
                  type: 'Portfolio Review',
                  company: 'Design Agency',
                  location: 'Zoom',
                  color: 'purple',
                },
              ].map((interview, idx) => {
                const bgColor = interview.color === 'cyan' ? 'bg-cyan-50' : 'bg-purple-50';
                const borderColor = interview.color === 'cyan' ? 'border-cyan-400' : 'border-purple-400';
                const textColor = interview.color === 'cyan' ? 'text-cyan-600' : 'text-purple-600';

                return (
                  <div
                    key={idx}
                    className={`${bgColor} ${borderColor} border-l-4 p-6 rounded-r-2xl flex flex-col gap-3 cursor-pointer hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <p className={`text-[10px] font-bold ${textColor}`}>{interview.type}</p>
                        <h3 className="text-base font-bold text-neutral-800">{interview.candidate}</h3>
                        <p className="text-xs text-neutral-400">{interview.position}</p>
                      </div>
                      <span className="px-2 py-1 bg-white text-[10px] font-bold text-neutral-400 rounded">
                        {interview.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Clock className="w-3 h-3" />
                      {interview.time}
                      <span className="size-1 bg-neutral-300 rounded-full"></span>
                      <span>{interview.company}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-800">Pending Feedback</h2>
            </div>
            <div className="flex flex-col gap-4">
              {[
                {
                  candidate: 'Sarah Jenkins',
                  position: 'Frontend Developer',
                  interviewDate: '2 days ago',
                  interviewer: 'John Doe',
                },
                {
                  candidate: 'Mark Anderson',
                  position: 'Backend Developer',
                  interviewDate: '1 day ago',
                  interviewer: 'Jane Smith',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#F8F9FB] p-6 rounded-2xl border border-neutral-100 flex items-center justify-between hover:border-primary/20 transition-all cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <h4 className="text-base font-bold text-neutral-800">{item.candidate}</h4>
                    <p className="text-sm text-neutral-400">{item.position}</p>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                      <span>Interviewed by {item.interviewer}</span>
                      <span className="size-1 bg-neutral-300 rounded-full"></span>
                      <span>{item.interviewDate}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-500 text-[10px] font-bold rounded-lg">
                    Feedback Pending
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="w-80 flex flex-col gap-8 shrink-0">
          <CalendarWidget />
          <ScheduleWidget />
        </aside>
      </div>
    </div>
  );
}
