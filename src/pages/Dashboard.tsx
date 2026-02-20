import { ChevronDown } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import PriorityCard from '../components/dashboard/PriorityCard';
import TalentMatchCard from '../components/dashboard/TalentMatchCard';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import ScheduleWidget from '../components/dashboard/ScheduleWidget';
import RecentActivities from '../components/dashboard/RecentActivities';

const BriefcaseIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12.5L10 13.75" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 9.16667L2.6274 11.5527C2.76428 14.5642 2.83272 16.0699 3.79904 16.9933C4.76536 17.9167 6.27263 17.9167 9.28719 17.9167H10.7128C13.7274 17.9167 15.2346 17.9167 16.201 16.9933C17.1673 16.0699 17.2357 14.5642 17.3726 11.5527L17.5 9.16667" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.37257 8.70255C3.78865 11.3954 6.98258 12.5 9.99992 12.5C13.0173 12.5 16.2112 11.3954 17.6273 8.70255C18.3032 7.41713 17.7914 5 16.1266 5H3.87325C2.20845 5 1.69661 7.41714 2.37257 8.70255Z" stroke="#0F47F2" />
    <path d="M13.3332 5L13.2596 4.74244C12.8929 3.45907 12.7096 2.81739 12.2731 2.45036C11.8366 2.08333 11.2568 2.08333 10.0973 2.08333H9.90237C8.74283 2.08333 8.16306 2.08333 7.72659 2.45036C7.29011 2.81739 7.10677 3.45907 6.74009 4.74244L6.6665 5" stroke="#0F47F2" />
  </svg>
);

const BuildingIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12.5L10 13.75" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 9.16667L2.6274 11.5527C2.76428 14.5642 2.83272 16.0699 3.79904 16.9933C4.76536 17.9167 6.27263 17.9167 9.28719 17.9167H10.7128C13.7274 17.9167 15.2346 17.9167 16.201 16.9933C17.1673 16.0699 17.2357 14.5642 17.3726 11.5527L17.5 9.16667" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.37257 8.70255C3.78865 11.3954 6.98258 12.5 9.99992 12.5C13.0173 12.5 16.2112 11.3954 17.6273 8.70255C18.3032 7.41713 17.7914 5 16.1266 5H3.87325C2.20845 5 1.69661 7.41714 2.37257 8.70255Z" stroke="#0F47F2" />
    <path d="M13.3332 5L13.2596 4.74244C12.8929 3.45907 12.7096 2.81739 12.2731 2.45036C11.8366 2.08333 11.2568 2.08333 10.0973 2.08333H9.90237C8.74283 2.08333 8.16306 2.08333 7.72659 2.45036C7.29011 2.81739 7.10677 3.45907 6.74009 4.74244L6.6665 5" stroke="#0F47F2" />
  </svg>
);

const UserPlusIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.3168 12.747C3.26883 13.3613 0.521092 14.6155 2.19465 16.185C3.01216 16.9517 3.92267 17.5 5.06739 17.5H11.5994C12.7442 17.5 13.6547 16.9517 14.4722 16.185C16.1457 14.6155 13.398 13.3613 12.35 12.747C9.89253 11.3066 6.77429 11.3066 4.3168 12.747Z" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.6667 5.83333C11.6667 7.67428 10.1743 9.16667 8.33333 9.16667C6.49238 9.16667 5 7.67428 5 5.83333C5 3.99238 6.49238 2.5 8.33333 2.5C10.1743 2.5 11.6667 3.99238 11.6667 5.83333Z" stroke="#0F47F2" />
    <path d="M16.2501 3.33333V7.49999M18.3334 5.41666L14.1667 5.41666" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10.0001 2.29167C5.74289 2.29167 2.29175 5.74281 2.29175 10C2.29175 14.2572 5.74289 17.7083 10.0001 17.7083C14.2572 17.7083 17.7084 14.2572 17.7084 10C17.7084 5.74281 14.2572 2.29167 10.0001 2.29167ZM1.04175 10C1.04175 5.05245 5.05253 1.04167 10.0001 1.04167C14.9477 1.04167 18.9584 5.05245 18.9584 10C18.9584 14.9476 14.9477 18.9583 10.0001 18.9583C5.05253 18.9583 1.04175 14.9476 1.04175 10ZM10.0001 6.04167C10.3452 6.04167 10.6251 6.3215 10.6251 6.66667V9.74109L12.5253 11.6414C12.7694 11.8855 12.7694 12.2812 12.5253 12.5253C12.2812 12.7693 11.8856 12.7693 11.6415 12.5253L9.55816 10.4419C9.44091 10.3248 9.37508 10.1658 9.37508 10V6.66667C9.37508 6.3215 9.65491 6.04167 10.0001 6.04167Z" fill="#0F47F2" />
  </svg>
);

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BriefcaseIcon}
              label="Active Jobs"
              value="68"
              trend="10%"
              trendText="vs last month"
            />
            <StatCard
              icon={BuildingIcon}
              label="Active Companies"
              value="25"
              trend="10%"
              trendText="vs last month"
            />
            <StatCard
              icon={UserPlusIcon}
              label="Hired Candidates"
              value="4"
              trend="10%"
              trendText="vs last month"
            />
            <StatCard
              icon={ClockIcon}
              label="Autopilot Saved Time"
              value="3"
              dateText="Days"
              trend="10%"
              trendText="vs last month"
            />
          </div>

          <section className="bg-white rounded-xl p-5 flex flex-col gap-5" style={{ border: '0.5px solid #D1D1D6' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-medium leading-6 text-black">Priority Actions</h2>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-[18px] py-2.5 rounded-[10px] text-sm font-normal text-[#4B5563]" style={{ border: '0.5px solid #D1D1D6' }}>
                  All Companies <ChevronDown className="w-5 h-5 opacity-60" />
                </div>
                <div className="flex items-center gap-3 px-[18px] py-2.5 rounded-[10px] text-sm font-normal text-[#4B5563]" style={{ border: '0.5px solid #D1D1D6' }}>
                  <svg className="w-5 h-5" fill="none" stroke="#4B5563" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  13 Jan, 2024
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Sourcing Column */}
              <div className="bg-[#F3F5F7] rounded-xl p-2.5 flex flex-col gap-2.5 overflow-y-auto max-h-[400px] hide-scrollbar">
                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6155F5]"></div>
                    <span className="text-sm font-normal text-[#4B5563] leading-[17px]">Sourcing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-normal text-[#4B5563]">1</span>
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-normal text-[#6155F5]">4</span>
                  </div>
                </div>
                <PriorityCard
                  name="Dwija Patel"
                  role="Senior Product Designer"
                  daysAgo={4}
                  status="Follow up required"
                  statusColor="blue"
                />
                <PriorityCard
                  name="Ana De Armas"
                  role="Product Manager"
                  daysAgo={4}
                  status="Outreach Required"
                  statusColor="blue"
                />
                <PriorityCard
                  name="Charles Leclerc"
                  role="Backend Engineer"
                  daysAgo={4}
                  status="Follow up required"
                  statusColor="blue"
                />
                <PriorityCard
                  name="Dwija Patel"
                  role="Senior Product Designer"
                  daysAgo={4}
                  status="Follow up required"
                  statusColor="grey"
                />
              </div>

              {/* Screening Column */}
              <div className="bg-[#F3F5F7] rounded-xl p-2.5 flex flex-col gap-2.5 overflow-y-auto max-h-[400px] hide-scrollbar">
                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CB30E0]"></div>
                    <span className="text-sm font-normal text-[#4B5563] leading-[17px]">Screening</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-normal text-[#4B5563]">0</span>
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-normal text-[#CB30E0]">1</span>
                  </div>
                </div>
                <PriorityCard
                  name="Max Verstappen"
                  role="Senior Product Designer"
                  daysAgo={4}
                  status="Availability Expires today"
                  statusColor="rose"
                />
              </div>

              {/* Interview Column */}
              <div className="bg-[#F3F5F7] rounded-xl p-2.5 flex flex-col gap-2.5 overflow-y-auto max-h-[400px] hide-scrollbar">
                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00C3D0]"></div>
                    <span className="text-sm font-normal text-[#4B5563] leading-[17px]">Interview</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-normal text-[#4B5563]">0</span>
                    <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm font-normal text-[#00C3D0]">3</span>
                  </div>
                </div>
                <PriorityCard
                  name="Dwija Patel"
                  role="Senior Product Designer"
                  daysAgo={4}
                  status="HM Feedback missing"
                  statusColor="amber"
                />
                <PriorityCard
                  name="Ana De Armas"
                  role="Product Manager"
                  daysAgo={4}
                  status="Required Scheduling"
                  statusColor="indigo"
                />
                <PriorityCard
                  name="Charles Leclerc"
                  role="Backend Engineer"
                  daysAgo={4}
                  status="Not Available"
                  statusColor="rose"
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-800">New Talent Matches</h2>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-100 rounded-xl text-xs font-bold text-neutral-600">
                  All Jobs <ChevronDown className="w-4 h-4" />
                </div>
                <div className="px-4 py-2 bg-white border border-neutral-100 rounded-xl text-xs font-bold text-neutral-600">
                  Last 24 Hours
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <TalentMatchCard
                name="Oscar Piastri"
                company="Deloitte"
                position="Software Developer"
                experience="7 years"
                matchPercentage={85}
              />
              <TalentMatchCard
                name="Fernando Alonso"
                company="Racing Williams"
                position="F1 Race Technical Engineer"
                experience="7 years"
                matchPercentage={85}
              />
            </div>
          </section>
        </div>

        <aside className="w-96 flex flex-col gap-8 shrink-0">
          <CalendarWidget />
          <ScheduleWidget />
          <RecentActivities />
        </aside>
      </div>
    </div>
  );
}
