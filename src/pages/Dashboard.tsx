import { Briefcase, Building2, UserPlus, Clock, ChevronDown } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import PriorityCard from '../components/dashboard/PriorityCard';
import TalentMatchCard from '../components/dashboard/TalentMatchCard';
import CalendarWidget from '../components/dashboard/CalendarWidget';
import ScheduleWidget from '../components/dashboard/ScheduleWidget';
import RecentActivities from '../components/dashboard/RecentActivities';

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Briefcase}
              label="Active Jobs"
              value="68"
              trend="10%"
              trendText="vs last month"
            />
            <StatCard
              icon={Building2}
              label="Active Companies"
              value="25"
              trend="10%"
              trendText="vs last month"
            />
            <StatCard
              icon={UserPlus}
              label="Hired Candidates"
              value="4"
              trend="10%"
              trendText="vs last month"
            />
            <StatCard
              icon={Clock}
              label="Autopilot Saved Time"
              value="3"
              dateText="Days"
              trend="10%"
              trendText="vs last month"
            />
          </div>

          <section className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-800">Priority Actions</h2>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-100 rounded-xl text-xs font-bold text-neutral-600">
                  All Companies <ChevronDown className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-100 rounded-xl text-xs font-bold text-neutral-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>{' '}
                  13 Jan, 2024
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F8F9FB] rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-primary"></div>
                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
                      Sourcing
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="size-5 rounded-full bg-neutral-50 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                      1
                    </span>
                    <span className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      4
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
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
                </div>
              </div>
              <div className="bg-[#F8F9FB] rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-purple-500"></div>
                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
                      Screening
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="size-5 rounded-full bg-neutral-50 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                      0
                    </span>
                    <span className="size-5 rounded-full bg-purple-50 flex items-center justify-center text-[10px] font-bold text-purple-500">
                      1
                    </span>
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
              <div className="bg-[#F8F9FB] rounded-2xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-cyan-400"></div>
                    <span className="text-xs font-bold text-neutral-800 uppercase tracking-tight">
                      Interview
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="size-5 rounded-full bg-neutral-50 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                      0
                    </span>
                    <span className="size-5 rounded-full bg-cyan-50 flex items-center justify-center text-[10px] font-bold text-cyan-500">
                      3
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
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
                    statusColor="blue"
                  />
                </div>
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
