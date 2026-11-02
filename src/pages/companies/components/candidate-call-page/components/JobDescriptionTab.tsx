import type { Job } from "../../../../../services/jobPostService";

export interface JobDescriptionTabProps {
  jobData: Job | null;
  competenciesData: any;
}

export default function JobDescriptionTab({
  jobData,
  competenciesData,
}: JobDescriptionTabProps) {
  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto break-words pb-8 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-7 w-full relative">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
            {jobData?.title || "Loading Job Details..."}{" "}
            {jobData?.workspace_details?.name ? `| ${jobData.workspace_details.name}` : ""}
          </h2>
        </div>

        {/* Job Summary Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            Job Summary
          </h3>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Job Title", value: jobData?.title },
              { label: "Company", value: jobData?.workspace_details?.name },
              { label: "Location", value: jobData?.location?.join(" · ") || "Bangalore" },
              {
                label: "Salary Range",
                value: jobData?.salary_min
                  ? `₹${jobData.salary_min}L – ₹${jobData.salary_max}L per annum`
                  : "₹1500000.00L – ₹2800000.00L per annum",
              },
              {
                label: "Experience",
                value: jobData?.experience_min_years
                  ? `${jobData.experience_min_years}–${jobData.experience_max_years} years`
                  : "2–8 years",
              },
              {
                label: "Openings",
                value:
                  jobData?.No_of_opening_or_positions_ ||
                  jobData?.num_positions ||
                  "85",
              },
              { label: "Notice Period", value: jobData?.notice_period || "60 Days" },
            ].map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3.5 py-2.5 bg-[#F8FAFC] rounded-lg hover:bg-[#F1F5F9] transition-colors group text-xs"
              >
                <span className="text-slate-500 font-medium">{row.label}</span>
                <span className="text-slate-800 font-semibold group-hover:text-blue-600 transition-colors">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Side-by-side: Primary Skills & Must Have */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Skills Section */}
          <div className="bg-[#F4F7FF] rounded-xl p-5 border border-[#E0E7FF]/50 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Primary Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(jobData?.skills?.length
                  ? jobData.skills
                  : ["Automation Tools", "Us Healthcare Domain Knowledge", "API testing"]
                ).map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-white rounded-lg text-xs text-blue-600 font-bold shadow-sm border border-blue-100 hover:border-blue-300 transition-all cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Must Have Section */}
          <div className="bg-[#FFF1F2] rounded-xl p-5 border border-[#FFE4E6] flex flex-col">
            <h3 className="text-xs font-bold text-rose-600 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Must Have
            </h3>
            <ul className="space-y-2.5">
              {(competenciesData?.the_core_expectation?.length
                ? competenciesData.the_core_expectation
                : jobData?.description
                    ?.split("\n")
                    .filter((l: string) => l.includes("Must") || l.includes("experience"))
                    .slice(0, 3) || ["Strong technical knowledge and problem-solving skills"]
              ).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 group">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-rose-400 transition-colors shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
