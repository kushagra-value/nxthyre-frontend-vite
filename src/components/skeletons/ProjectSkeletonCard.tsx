import { SkeletonWrapper } from "react-skeletonify";

const ProjectSkeletonCard = () => (
    <div className="bg-white rounded-[10px] shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <SkeletonWrapper loading={true}>
            <div className="p-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="h-7 bg-gray-100 rounded-full w-28"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-8 bg-gray-100 rounded-full"></div>
                    </div>
                </div>
                <div className="h-5 bg-gray-100 rounded w-3/5 mb-6"></div>
                <div className="h-8 bg-gray-100 rounded-lg w-4/5 mb-3"></div>
                <div className="flex flex-wrap gap-2 mb-8">
                    <div className="h-8 bg-gray-100 rounded-full px-4 w-24"></div>
                    <div className="h-8 bg-gray-100 rounded-full px-4 w-24"></div>
                    <div className="h-8 bg-gray-100 rounded-full px-4 w-24"></div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 bg-gray-100 rounded-full w-8"></div>
                        <div className="h-8 bg-gray-100 rounded-full w-8"></div>
                        <div className="h-8 bg-gray-100 rounded-full w-8"></div>
                        <div className="h-8 bg-gray-100 rounded-full w-8"></div>
                    </div>
                </div>
            </div>
        </SkeletonWrapper>
    </div>
);

export default ProjectSkeletonCard;
