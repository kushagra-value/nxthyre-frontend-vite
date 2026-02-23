import { useState } from "react";
import { ChevronRight, ChevronDown, Edit3, Share2, Bell } from "lucide-react";
import JobPipelineDashboard from "./jobPipeline/components/JobPipelineDashboard";
import JobCandidateProfile from "./jobPipeline/components/JobCandidateProfile";
import { jobDetails } from "./jobPipeline/JobPipelineData";

export default function JobPipeline({ jobId, onBack }: { jobId: number | null, onBack: () => void }) {
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

    if (!jobId) {
        // Should never happen realistically from app state
    }

    return (
        <div className="flex flex-col h-full bg-[#F3F5F7] overflow-hidden">
            {!selectedCandidate && (
                <div className="bg-white px-8 pt-6 pb-4 flex flex-col gap-4 border-b border-[#E5E7EB]">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-[#8E8E93]">
                        <button onClick={onBack} className="hover:text-black transition cursor-pointer">Jobs</button> <ChevronRight className="w-3 h-3" />
                        <span>{jobDetails.company}</span> <ChevronRight className="w-3 h-3" />
                        <span className="text-black font-semibold">{jobDetails.title}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-black">{jobDetails.title}</h1>
                                <ChevronDown className="w-5 h-5 text-[#8E8E93] cursor-pointer" />
                                <span className="bg-[#DEF7EC] text-[#059669] border border-[#A7F3D0] px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></div> Open
                                </span>
                            </div>
                            <div className="text-sm font-semibold text-[#8E8E93] mt-1 flex items-center gap-1">
                                📍 {jobDetails.location}
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D1D6] rounded text-sm font-bold text-[#4B5563] hover:bg-[#F3F5F7] transition">
                                <Edit3 className="w-4 h-4" /> Edit Post
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D1D6] rounded text-sm font-bold text-[#4B5563] hover:bg-[#F3F5F7] transition">
                                <Share2 className="w-4 h-4" /> Share
                            </button>
                            <button className={`w-10 h-10 flex items-center justify-center rounded-full relative ${false ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#F9FAFB] border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F5F7]'
                                }`}>
                                <Bell className="w-5 h-5" />
                                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#F59E0B] rounded-full border-2 border-white"></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedCandidate ? (
                <JobCandidateProfile
                    candidate={selectedCandidate}
                    goBack={() => setSelectedCandidate(null)}
                />
            ) : (
                <JobPipelineDashboard
                    onSelectCandidate={(c: any) => setSelectedCandidate(c)}
                />
            )}
        </div>
    );
}
