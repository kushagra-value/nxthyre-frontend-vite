import React from 'react';
import CompanyInfoTab from "../../../components/candidatePool/CompanyInfoTab";
import { CompanyResearchData } from "../../../services/organizationService";

interface CompanyInfoDrawerProps {
    isOpen: boolean;
    loading: boolean;
    data: CompanyResearchData | null;
    onClose: () => void;
    onEdit?: () => void;
    onCreateJob?: () => void;
}

const CompanyInfoDrawer: React.FC<CompanyInfoDrawerProps> = ({
    isOpen,
    loading,
    data,
    onClose,
    onEdit = () => { },
    onCreateJob = () => { }
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-start justify-end overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F47F2]"></div>
                        <span className="text-sm text-[#8E8E93]">Loading company info...</span>
                    </div>
                ) : data ? (
                    <CompanyInfoTab
                        data={data}
                        onBack={onClose}
                        onEdit={onEdit}
                        onCreateJob={onCreateJob}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 gap-2">
                        <span className="text-sm text-[#8E8E93]">No company details available.</span>
                        <button onClick={onClose} className="text-sm text-[#0F47F2] hover:underline">Close</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyInfoDrawer;
