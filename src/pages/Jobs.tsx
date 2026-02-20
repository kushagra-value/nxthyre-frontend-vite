import { Briefcase, Building2, UserPlus, ChevronDown, Search } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import TalentMatchCard from '../components/dashboard/TalentMatchCard';

export default function Jobs() {
  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={Briefcase} label="Active Jobs" value="68" trend="10% vs last month" />
          <StatCard icon={Building2} label="Companies Hiring" value="25" trend="10% vs last month" />
          <StatCard icon={UserPlus} label="Total Applicants" value="5610" trend="10% vs last month" />
        </div>

        <section className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-800">All Jobs</h2>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-100 rounded-xl text-xs font-bold text-neutral-600">
                <Search className="w-4 h-4" />
                Search Jobs
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-100 rounded-xl text-xs font-bold text-neutral-600">
                Filter by Status <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Senior Product Designer',
                company: 'Design Agency',
                location: 'Remote',
                type: 'Full-time',
                applicants: 45,
                status: 'Active',
              },
              {
                title: 'Full Stack Developer',
                company: 'Tech Corp',
                location: 'Hybrid',
                type: 'Full-time',
                applicants: 67,
                status: 'Active',
              },
              {
                title: 'Product Manager',
                company: 'Startup Inc',
                location: 'On-site',
                type: 'Full-time',
                applicants: 32,
                status: 'Active',
              },
              {
                title: 'UI/UX Designer',
                company: 'Creative Studio',
                location: 'Remote',
                type: 'Contract',
                applicants: 28,
                status: 'Active',
              },
            ].map((job, idx) => (
              <div
                key={idx}
                className="bg-[#F8F9FB] p-6 rounded-2xl border border-neutral-100 flex flex-col gap-4 hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-neutral-800">{job.title}</h3>
                    <p className="text-sm text-neutral-400">{job.company}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-500 text-[10px] font-bold rounded-lg">
                    {job.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>{job.location}</span>
                  <span className="size-1 bg-neutral-300 rounded-full"></span>
                  <span>{job.type}</span>
                  <span className="size-1 bg-neutral-300 rounded-full"></span>
                  <span>{job.applicants} Applicants</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-800">Recent Matches</h2>
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
    </div>
  );
}
