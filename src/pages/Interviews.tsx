import { Clock, ChevronDown } from 'lucide-react';
import StatCard from './dashboard/components/StatCard';
import ScheduleWidget from './dashboard/components/ScheduleWidget';
import CalendarWidget from './dashboard/components/CalendarWidget';

const CalendarIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12.5L10 13.75" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 9.16667L2.6274 11.5527C2.76428 14.5642 2.83272 16.0699 3.79904 16.9933C4.76536 17.9167 6.27263 17.9167 9.28719 17.9167H10.7128C13.7274 17.9167 15.2346 17.9167 16.201 16.9933C17.1673 16.0699 17.2357 14.5642 17.3726 11.5527L17.5 9.16667" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.37257 8.70255C3.78865 11.3954 6.98258 12.5 9.99992 12.5C13.0173 12.5 16.2112 11.3954 17.6273 8.70255C18.3032 7.41713 17.7914 5 16.1266 5H3.87325C2.20845 5 1.69661 7.41714 2.37257 8.70255Z" stroke="#0F47F2" />
    <path d="M13.3332 5L13.2596 4.74244C12.8929 3.45907 12.7096 2.81739 12.2731 2.45036C11.8366 2.08333 11.2568 2.08333 10.0973 2.08333H9.90237C8.74283 2.08333 8.16306 2.08333 7.72659 2.45036C7.29011 2.81739 7.10677 3.45907 6.74009 4.74244L6.6665 5" stroke="#0F47F2" />
  </svg>
);

const ClockStatIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10.0001 2.29167C5.74289 2.29167 2.29175 5.74281 2.29175 10C2.29175 14.2572 5.74289 17.7083 10.0001 17.7083C14.2572 17.7083 17.7084 14.2572 17.7084 10C17.7084 5.74281 14.2572 2.29167 10.0001 2.29167ZM1.04175 10C1.04175 5.05245 5.05253 1.04167 10.0001 1.04167C14.9477 1.04167 18.9584 5.05245 18.9584 10C18.9584 14.9476 14.9477 18.9583 10.0001 18.9583C5.05253 18.9583 1.04175 14.9476 1.04175 10ZM10.0001 6.04167C10.3452 6.04167 10.6251 6.3215 10.6251 6.66667V9.74109L12.5253 11.6414C12.7694 11.8855 12.7694 12.2812 12.5253 12.5253C12.2812 12.7693 11.8856 12.7693 11.6415 12.5253L9.55816 10.4419C9.44091 10.3248 9.37508 10.1658 9.37508 10V6.66667C9.37508 6.3215 9.65491 6.04167 10.0001 6.04167Z" fill="#0F47F2" />
  </svg>
);

const UsersIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.3168 12.747C3.26883 13.3613 0.521092 14.6155 2.19465 16.185C3.01216 16.9517 3.92267 17.5 5.06739 17.5H11.5994C12.7442 17.5 13.6547 16.9517 14.4722 16.185C16.1457 14.6155 13.398 13.3613 12.35 12.747C9.89253 11.3066 6.77429 11.3066 4.3168 12.747Z" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.6667 5.83333C11.6667 7.67428 10.1743 9.16667 8.33333 9.16667C6.49238 9.16667 5 7.67428 5 5.83333C5 3.99238 6.49238 2.5 8.33333 2.5C10.1743 2.5 11.6667 3.99238 11.6667 5.83333Z" stroke="#0F47F2" />
    <path d="M16.2501 3.33333V7.49999M18.3334 5.41666L14.1667 5.41666" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Interviews() {
  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard icon={CalendarIcon} label="Scheduled Interviews" value="12" trend="10%" trendText="vs last month" />
            <StatCard icon={ClockStatIcon} label="Pending Feedback" value="5" trend="10%" trendText="vs last month" />
            <StatCard icon={UsersIcon} label="Candidates Interviewed" value="87" trend="10%" trendText="vs last month" />
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
