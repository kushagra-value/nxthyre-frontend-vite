import React from 'react';

// Header Skeleton
const HeaderSkeleton = () => (
    <div className="mb-4 bg-white border-b border-gray-100 max-w-full mx-auto px-7 py-2">
        <div className="flex items-center justify-between">
            <div className="h-10 w-28 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
    </div>
);

// Job Info Skeleton
const JobInfoSkeleton = () => (
    <div className="relative bg-white rounded-xl shadow-sm px-8 py-6">
        <div className="flex items-center justify-between pl-8">
            <div className="space-y-3">
                <div className="h-7 w-72 bg-gray-100 rounded animate-pulse"></div>
                <div className="flex items-center gap-3">
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-9 w-64 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
        </div>
    </div>
);

// Tabs Skeleton
const TabsSkeleton = () => (
    <div className="relative mx-8">
        <div className="flex items-center gap-16 pt-4 border-b border-gray-100">
            <div className="h-6 w-20 bg-gray-100 rounded mb-4 animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-100 rounded mb-4 animate-pulse"></div>
        </div>
    </div>
);

// Candidate Card Skeleton
const CandidateCardSkeleton = () => (
    <div className="bg-white rounded-2xl mb-2 p-4">
        <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 w-48 bg-gray-100 rounded animate-pulse"></div>
            </div>
        </div>

        <div className="border-t border-gray-50 pt-3">
            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="h-3 w-12 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-3 w-12 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="h-5 w-12 bg-gray-100 rounded animate-pulse"></div>
            </div>
        </div>
    </div>
);

// Stage Column Skeleton
const StageColumnSkeleton = () => (
    <div className="w-96 h-[80vh] min-h-max">
        <div className="bg-[#F5F9FB] h-full rounded-lg p-4 space-y-4">
            {/* Stage Header */}
            <div className="space-y-3">
                <div className="h-6 w-32 bg-gray-200/60 rounded animate-pulse"></div>
                <div className="h-4 w-28 bg-gray-200/60 rounded animate-pulse"></div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between py-2">
                <div className="h-5 w-20 bg-gray-200/60 rounded animate-pulse"></div>
                <div className="h-5 w-20 bg-gray-200/60 rounded animate-pulse"></div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/80 h-2 rounded-full overflow-hidden">
                <div className="bg-gray-200/60 h-2 rounded-full w-3/4 animate-pulse"></div>
            </div>

            {/* Candidate Cards */}
            <div className="pt-4 space-y-3">
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
                <CandidateCardSkeleton />
            </div>
        </div>
    </div>
);

// Calendar Skeleton
const CalendarSkeleton = () => (
    <div className="bg-white rounded-lg p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-40 bg-gray-100 rounded animate-pulse"></div>
            <div className="flex gap-2">
                <div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"></div>
                ))}
            </div>

            {/* Calendar Days */}
            {[...Array(5)].map((_, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-2">
                    {[...Array(7)].map((_, dayIndex) => (
                        <div key={dayIndex} className="h-20 bg-gray-50 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

// Main Pipeline Skeleton Loader
const PipelineSkeletonLoader = () => {
    return (
        <div className="bg-[#FFFFFF]">
            <HeaderSkeleton />

            <div className="mx-auto max-w-[95vw] min-h-screen space-y-4">
                <JobInfoSkeleton />

                <div className="font-['Gellix',_sans-serif]">
                    <TabsSkeleton />

                    {/* Pipeline Content Skeleton */}
                    <div className="px-8 py-10 min-h-screen">
                        <div className="overflow-x-auto hide-scrollbar">
                            <div className="flex space-x-4 min-w-max pb-2">
                                <StageColumnSkeleton />
                                <StageColumnSkeleton />
                                <StageColumnSkeleton />
                                <StageColumnSkeleton />

                                {/* Add Stage Button Skeleton */}
                                <div className="w-96 h-[80vh] min-h-max bg-[#F5F9FB] rounded-lg flex flex-col items-center justify-center">
                                    <div className="space-y-3 flex flex-col items-center">
                                        <div className="w-14 h-14 bg-gray-200/60 rounded-full animate-pulse"></div>
                                        <div className="h-4 w-32 bg-gray-200/60 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Individual Component Skeletons for Export
export const PipelineStageSkeleton = () => (
    <div className="overflow-x-auto hide-scrollbar">
        <div className="flex space-x-4 min-w-max pb-2">
            <StageColumnSkeleton />
            <StageColumnSkeleton />
            <StageColumnSkeleton />
        </div>
    </div>
);

export const CandidateProfileSkeleton = () => (
    <div className="fixed inset-0 bg-black bg-opacity-20 z-[60] flex">
        <div className="ml-auto w-2/3 bg-gray-50 shadow-xl h-full overflow-y-auto py-6">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between px-8 mb-6">
                    <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-sm p-8 mx-8">
                    <div className="flex items-start gap-6 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse"></div>
                        <div className="flex-1 space-y-3">
                            <div className="h-6 w-48 bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex gap-4">
                            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                        <div className="h-10 w-40 bg-gray-100 rounded-lg animate-pulse"></div>
                    </div>
                </div>

                {/* Content Sections */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl shadow-sm p-8 mx-8">
                        <div className="h-5 w-32 bg-gray-100 rounded mb-4 animate-pulse"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const FeedbackModalSkeleton = () => (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-[60] flex justify-center items-center p-4">
        <div className="bg-white w-full max-w-xl shadow-2xl rounded-3xl overflow-hidden p-6">
            {/* Title */}
            <div className="text-center mb-6 space-y-2">
                <div className="h-5 w-56 bg-gray-100 rounded mx-auto animate-pulse"></div>
                <div className="h-5 w-40 bg-gray-100 rounded mx-auto animate-pulse"></div>
            </div>

            {/* Candidate Card */}
            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Stage Transition */}
            <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                <div className="w-5 h-5 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
            </div>

            {/* Comment Box */}
            <div className="mb-6 space-y-2">
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-24 w-full bg-gray-100 rounded-lg animate-pulse"></div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
                <div className="flex-1 h-11 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="flex-1 h-11 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
        </div>
    </div>
);

export default PipelineSkeletonLoader;