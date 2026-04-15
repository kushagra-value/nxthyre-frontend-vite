const RequisitionSkeleton = () => (
    <div className="space-y-10 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg w-full max-w-xl mb-6"></div>
        <div className="flex gap-12 mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
            <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
        </div>
        <div>
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-4"></div>
            <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded w-11/12"></div>
                <div className="h-5 bg-gray-200 rounded w-10/12"></div>
            </div>
        </div>
        <div>
            <div className="h-8 bg-gray-200 rounded-lg w-80 mb-6"></div>
            <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-7 bg-gray-200 rounded w-96"></div>
                            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                ))}
            </div>
        </div>
        <div>
            <div className="h-8 bg-gray-200 rounded-lg w-96 mb-6"></div>
            <div className="space-y-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-7 bg-gray-200 rounded w-80"></div>
                            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default RequisitionSkeleton;
