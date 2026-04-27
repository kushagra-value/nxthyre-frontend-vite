import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Loader2, MessageSquare } from "lucide-react";
import { jobPostService, JobNote } from "../../../services/jobPostService";
import { showToast } from "../../../utils/toast";

// ── Tab icons ──

const NotesIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.3333 8V4.66667C13.3333 3.19391 13.3333 2.45753 12.8712 1.99545C12.4091 1.53333 11.6727 1.53333 10.2 1.53333H5.8C4.32724 1.53333 3.59087 1.53333 3.12878 1.99545C2.66667 2.45753 2.66667 3.19391 2.66667 4.66667V11.3333C2.66667 12.8061 2.66667 13.5425 3.12878 14.0046C3.59087 14.4667 4.32724 14.4667 5.8 14.4667H8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.33333 5.33333H10.6667" stroke="currentColor" strokeLinecap="round"/>
        <path d="M5.33333 8H8" stroke="currentColor" strokeLinecap="round"/>
        <path d="M5.33333 10.6667H6.66667" stroke="currentColor" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeLinecap="round"/>
    </svg>
);

const ShortlistedIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.52832 3.60575C6.37275 2.09092 6.79495 1.3335 7.42622 1.3335C8.05748 1.3335 8.47968 2.09091 9.32408 3.60574L9.54258 3.99765C9.78258 4.42812 9.90248 4.64336 10.0897 4.78537C10.2767 4.92738 10.5097 4.9801 10.9757 5.08553L11.3999 5.18152C13.0397 5.55254 13.8596 5.73804 14.0547 6.36532C14.2497 6.99256 13.6908 7.64623 12.5729 8.95343L12.2837 9.29163C11.966 9.6631 11.8071 9.84883 11.7357 10.0786C11.6643 10.3084 11.6883 10.5562 11.7363 11.0519L11.78 11.5031C11.949 13.2472 12.0335 14.1193 11.5229 14.507C11.0121 14.8946 10.2445 14.5412 8.70908 13.8343L8.31188 13.6514C7.87562 13.4505 7.65748 13.35 7.42622 13.35C7.19495 13.35 6.97682 13.4505 6.54055 13.6514L6.14335 13.8343C4.608 14.5412 3.84034 14.8946 3.32965 14.507C2.81896 14.1193 2.90347 13.2472 3.07248 11.5031L3.1162 11.0519C3.16424 10.5562 3.18825 10.3084 3.11679 10.0786C3.04534 9.84883 2.8865 9.6631 2.56883 9.29163L2.27962 8.95343C1.16172 7.64623 0.60276 6.99256 0.79783 6.36532C0.9929 5.73804 1.81279 5.55254 3.45258 5.18152L3.87681 5.08553C4.34278 4.9801 4.57577 4.92738 4.76284 4.78537C4.94992 4.64336 5.0699 4.42812 5.30986 3.99765L5.52832 3.60575Z" fill="#14AE5C" stroke="#14AE5C"/>
    </svg>
);

const HiredIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 8C9.38071 8 10.5 6.88071 10.5 5.5C10.5 4.11929 9.38071 3 8 3C6.61929 3 5.5 4.11929 5.5 5.5C5.5 6.88071 6.61929 8 8 8Z" stroke="#0F47F2" strokeLinecap="round"/>
        <path d="M12.974 14.6667C12.8414 12.2571 12.1037 10.5 7.99967 10.5C3.89567 10.5 3.158 12.2571 3.02539 14.6667" stroke="#0F47F2" strokeLinecap="round"/>
        <path d="M10 8L11.5 9.5L14 6.5" stroke="#0F47F2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

interface TimelineActivity {
    id: number;
    type: "note" | "shortlisted" | "hired";
    date: string;
    content: string;
    author: string;
    noteId?: number;
}

interface JobTimelineDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: number;
    jobTitle?: string;
}

const JobTimelineDrawer: React.FC<JobTimelineDrawerProps> = ({
    isOpen,
    onClose,
    jobId,
    jobTitle,
}) => {
    const [activeTab, setActiveTab] = useState<"notes" | "shortlisted" | "hired">("notes");
    const [notes, setNotes] = useState<JobNote[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);

    // Fetch notes when drawer opens
    useEffect(() => {
        if (isOpen && jobId) {
            fetchNotes();
        } else {
            setNotes([]);
            setActiveTab("notes");
        }
    }, [isOpen, jobId]);

    // Close drawer on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const data = await jobPostService.getJobNotes(jobId);
            setNotes(data || []);
        } catch (error) {
            console.error("Failed to load notes", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        try {
            await jobPostService.deleteJobNote(jobId, noteId);
            setNotes(notes.filter((n) => n.id !== noteId));
            showToast.success("Note deleted");
        } catch (error) {
            showToast.error("Failed to delete note");
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Build activities from notes
    const noteActivities: TimelineActivity[] = notes.map((note) => ({
        id: note.id,
        type: "note",
        date: note.created_at,
        content: note.content,
        author: note.created_by_name || "User",
        noteId: note.id,
    }));

    // Mock shortlisted and hired data (will integrate with real API later)
    const shortlistedActivities: TimelineActivity[] = [
        {
            id: 1001,
            type: "shortlisted",
            date: new Date().toISOString(),
            content: "Candidates moved to Shortlist stage",
            author: "System",
        },
    ];

    const hiredActivities: TimelineActivity[] = [
        {
            id: 2001,
            type: "hired",
            date: new Date().toISOString(),
            content: "Candidate hired successfully",
            author: "System",
        },
    ];

    const totalActivities = noteActivities.length + shortlistedActivities.length + hiredActivities.length;

    const getActiveActivities = () => {
        switch (activeTab) {
            case "notes":
                return noteActivities;
            case "shortlisted":
                return shortlistedActivities;
            case "hired":
                return hiredActivities;
            default:
                return [];
        }
    };

    const activities = getActiveActivities();

    if (!isOpen) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-[9998] transition-opacity duration-300"
                onClick={onClose}
                style={{ opacity: isOpen ? 1 : 0 }}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className="fixed top-0 right-0 h-full w-[420px] max-w-[90vw] bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.08)] z-[9999] flex flex-col overflow-hidden"
                style={{
                    animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
            >
                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-[#F0F0F0]">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <h2 className="text-[18px] font-semibold text-[#1C1C1E] leading-tight">
                                Timeline
                            </h2>
                            <p className="text-[13px] text-[#8E8E93] mt-0.5">
                                {totalActivities} total activities
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#D1D1D6] hover:bg-[#F9FAFB] transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 py-4 bg-[#F9FAFB] border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                        {/* Notes Tab */}
                        <button
                            onClick={() => setActiveTab("notes")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                                activeTab === "notes"
                                    ? "bg-white text-[#0F47F2] border border-[#0F47F2] shadow-sm"
                                    : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#D1D1D6] hover:text-[#4B5563]"
                            }`}
                        >
                            <NotesIcon />
                            Notes
                            <span
                                className={`ml-0.5 text-[11px] font-semibold ${
                                    activeTab === "notes" ? "text-[#0F47F2]" : "text-[#AEAEB2]"
                                }`}
                            >
                                {noteActivities.length}
                            </span>
                        </button>

                        {/* Shortlisted Tab */}
                        <button
                            onClick={() => setActiveTab("shortlisted")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                                activeTab === "shortlisted"
                                    ? "bg-white text-[#0F47F2] border border-[#0F47F2] shadow-sm"
                                    : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#D1D1D6] hover:text-[#4B5563]"
                            }`}
                        >
                            <ShortlistedIcon />
                            Shortlisted
                            <span
                                className={`ml-0.5 text-[11px] font-semibold ${
                                    activeTab === "shortlisted" ? "text-[#0F47F2]" : "text-[#AEAEB2]"
                                }`}
                            >
                                {shortlistedActivities.length}
                            </span>
                        </button>

                        {/* Hired Tab */}
                        <button
                            onClick={() => setActiveTab("hired")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                                activeTab === "hired"
                                    ? "bg-white text-[#0F47F2] border border-[#0F47F2] shadow-sm"
                                    : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#D1D1D6] hover:text-[#4B5563]"
                            }`}
                        >
                            <HiredIcon />
                            Hired
                            <span
                                className={`ml-0.5 text-[11px] font-semibold ${
                                    activeTab === "hired" ? "text-[#0F47F2]" : "text-[#AEAEB2]"
                                }`}
                            >
                                {hiredActivities.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12 text-[#AEAEB2]">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-12 h-12 bg-[#F3F5F7] rounded-full flex items-center justify-center mb-3">
                                <MessageSquare className="w-5 h-5 text-[#AEAEB2]" />
                            </div>
                            <p className="text-[14px] font-medium text-[#6B7280]">
                                No {activeTab} activities yet
                            </p>
                            <p className="text-[12px] text-[#AEAEB2] mt-1">
                                {activeTab === "notes"
                                    ? "Add notes to track important updates for this job."
                                    : activeTab === "shortlisted"
                                    ? "Shortlisted candidates will appear here."
                                    : "Hired candidates will appear here."}
                            </p>
                        </div>
                    ) : (
                        <div className="px-6 py-4">
                            {/* Section Header */}
                            <p className="text-[11px] font-semibold uppercase text-[#8E8E93] tracking-wider mb-4">
                                {activeTab === "notes"
                                    ? "NOTES"
                                    : activeTab === "shortlisted"
                                    ? "SHORTLISTED"
                                    : "HIRED"}
                            </p>

                            {/* Activity List */}
                            <div className="flex flex-col">
                                {activities.map((activity, index) => (
                                    <div key={activity.id}>
                                        {/* Activity Item */}
                                        <div className="py-4 group">
                                            {activity.type === "note" ? (
                                                /* Notes-specific layout */
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[13px] font-medium text-[#0F47F2] mb-1.5">
                                                            {formatDate(activity.date)}
                                                        </p>
                                                        <p className="text-[15px] font-medium text-[#1C1C1E] leading-snug mb-1">
                                                            {activity.content}
                                                        </p>
                                                        <p className="text-[12px] text-[#AEAEB2]">
                                                            {activity.author} added this note
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            activity.noteId &&
                                                            handleDeleteNote(activity.noteId)
                                                        }
                                                        className="p-2 text-[#D1D1D6] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-all opacity-0 group-hover:opacity-100 ml-3 shrink-0"
                                                        title="Delete note"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                /* Shortlisted/Hired layout */
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#EBFFEE] flex items-center justify-center shrink-0 mt-0.5">
                                                        <ShortlistedIcon />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[15px] font-medium text-[#1C1C1E] leading-snug mb-1">
                                                            {activity.content}
                                                        </p>
                                                        <button className="text-[13px] font-medium text-[#14AE5C] hover:text-[#0D8A44] transition-colors">
                                                            View{" "}
                                                            {activity.type === "shortlisted"
                                                                ? "Shortlist"
                                                                : "Hired"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Divider between items */}
                                        {index < activities.length - 1 && (
                                            <div className="h-px bg-[#F0F0F0]" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Slide-in animation */}
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
            `}</style>
        </>,
        document.body
    );
};

export default JobTimelineDrawer;
