import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Loader2, MessageSquare } from "lucide-react";
import { jobPostService, JobTimelineEvent, JobTimelineSummary } from "../../../services/jobPostService";
import { showToast } from "../../../utils/toast";

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


interface JobTimelineDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: number;
    jobTitle?: string;
}

const JobTimelineDrawer: React.FC<JobTimelineDrawerProps> = ({ isOpen, onClose, jobId }) => {
    const [activeTab, setActiveTab] = useState<"notes" | "shortlisted" | "hired">("notes");
    const [events, setEvents] = useState<JobTimelineEvent[]>([]);
    const [summary, setSummary] = useState<JobTimelineSummary>({ total_activities: 0, notes: 0, shortlisted: 0, hired: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    
    const drawerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isLoadingRef = useRef(false);

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    const fetchTimeline = async (pageNum: number, currentTab: string, append: boolean = false) => {
        if (!jobId) return;
        setIsLoading(true);
        try {
            const res = await jobPostService.getJobTimeline(jobId, currentTab, pageNum, 10);
            if (res.success && res.data) {
                setSummary(res.data.summary);
                setEvents(prev => append ? [...prev, ...res.data.timeline] : res.data.timeline);
                setHasMore(res.data.pagination.has_more);
                setPage(pageNum);
            }
        } catch (error) {
            console.error("Failed to fetch timeline", error);
            showToast.error("Failed to load timeline events.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && jobId) {
            setEvents([]);
            setPage(1);
            setHasMore(false);
            fetchTimeline(1, activeTab, false);
        } else {
            setEvents([]);
            setActiveTab("notes");
            setSummary({ total_activities: 0, notes: 0, shortlisted: 0, hired: 0 });
            setPage(1);
            setHasMore(false);
        }
    }, [isOpen, jobId, activeTab]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    const handleScroll = () => {
        if (!scrollContainerRef.current || isLoadingRef.current || !hasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        if (scrollHeight - scrollTop - clientHeight < 50) {
            fetchTimeline(page + 1, activeTab, true);
        }
    };

    const handleDeleteNote = async (eventId: string) => {
        try {
            // Extract numeric ID if prefixed, or just parse it
            const numericId = parseInt(eventId.replace(/\D/g, ''), 10) || parseInt(eventId, 10);
            await jobPostService.deleteJobNote(jobId, numericId);
            setEvents(events.filter(e => e.id !== eventId));
            setSummary(prev => ({ ...prev, total_activities: Math.max(0, prev.total_activities - 1), notes: Math.max(0, prev.notes - 1) }));
            showToast.success("Note deleted");
        } catch { 
            showToast.error("Failed to delete note"); 
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const tabs = [
        { key: "notes" as const, label: "Notes", count: summary.notes, icon: <NotesIcon /> },
        { key: "shortlisted" as const, label: "Shortlisted", count: summary.shortlisted, icon: <ShortlistedIcon /> },
        { key: "hired" as const, label: "Hired", count: summary.hired, icon: <HiredIcon /> },
    ];

    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={onClose} />
            <div ref={drawerRef} className="fixed top-0 right-0 h-full w-[420px] max-w-[90vw] bg-white shadow-[-8px_0_30px_rgba(0,0,0,0.08)] z-[9999] flex flex-col overflow-hidden" style={{ animation: "slideInRight 0.3s cubic-bezier(0.16,1,0.3,1) forwards" }}>

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-[#F0F0F0]">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-[18px] font-semibold text-[#1C1C1E]">Timeline</h2>
                            <p className="text-[13px] text-[#8E8E93] mt-0.5">{summary.total_activities} total activities</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#F9FAFB] transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 py-4 bg-[#F9FAFB] border-b border-[#F0F0F0]">
                    <div className="flex items-center gap-2">
                        {tabs.map(t => (
                            <button key={t.key} onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${activeTab === t.key ? "bg-white text-[#0F47F2] border border-[#0F47F2] shadow-sm" : "bg-white text-[#6B7280] border border-[#E5E7EB] hover:border-[#D1D1D6]"}`}>
                                {t.icon}
                                {t.label}
                                <span className={`text-[11px] font-semibold ${activeTab === t.key ? "text-[#0F47F2]" : "text-[#AEAEB2]"}`}>{t.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div 
                    className="flex-1 overflow-y-auto custom-scrollbar" 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                >
                    <div className="px-6 py-4">
                        <p className="text-[11px] font-semibold uppercase text-[#8E8E93] tracking-wider mb-4">
                            {activeTab === "notes" ? "NOTES" : activeTab === "shortlisted" ? "SHORTLISTED" : "HIRED"}
                        </p>

                        {events.length === 0 && !isLoading ? (
                            <EmptyState 
                                text={`No ${activeTab} activities`} 
                                sub={activeTab === "notes" ? "Add notes to track important updates for this job." : `${activeTab} candidates will appear here.`} 
                            />
                        ) : (
                            <div className="flex flex-col">
                                {events.map((event, i) => {
                                    const isNote = event.event_type === "NOTE_ADDED";
                                    const isShortlist = event.event_type === "CANDIDATE_SHORTLISTED" || activeTab === "shortlisted";
                                    const isHired = event.event_type === "CANDIDATE_HIRED" || activeTab === "hired";
                                    
                                    let Icon = NotesIcon;
                                    let iconBg = "bg-[#F3F5F7]";
                                    let iconColor = "text-[#6B7280]";
                                    
                                    if (isShortlist) {
                                        Icon = ShortlistedIcon;
                                        iconBg = "bg-[#EBFFEE]";
                                        iconColor = "text-[#14AE5C]";
                                    } else if (isHired) {
                                        Icon = HiredIcon;
                                        iconBg = "bg-[#E7EDFF]";
                                        iconColor = "text-[#0F47F2]";
                                    }

                                    return (
                                        <div key={event.id}>
                                            <div className="py-4 group">
                                                <div className="flex items-start gap-3">
                                                    {activeTab !== "notes" && (
                                                        <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                                                            <Icon />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        {activeTab === "notes" ? (
                                                            <p className="text-[13px] font-medium text-[#0F47F2] mb-1.5">{formatDate(event.date)}</p>
                                                        ) : (
                                                            <p className="text-[10px] text-[#AEAEB2] mb-0.5">{formatDate(event.date)}</p>
                                                        )}
                                                        <p className="text-[15px] font-medium text-[#1C1C1E] leading-snug mb-1">{event.title}</p>
                                                        {event.description && (
                                                            <p className={`text-[12px] ${activeTab === "notes" ? "text-[#1C1C1E] font-medium mb-1" : "text-[#AEAEB2]"}`}>
                                                                {event.description}
                                                            </p>
                                                        )}
                                                        {activeTab === "notes" && event.created_by?.name && (
                                                            <p className="text-[12px] text-[#AEAEB2]">{event.created_by.name} added this note</p>
                                                        )}
                                                    </div>
                                                    {isNote && (
                                                        <button 
                                                            onClick={() => handleDeleteNote(event.id)} 
                                                            className="p-2 text-[#D1D1D6] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-all opacity-0 group-hover:opacity-100 ml-3 shrink-0" 
                                                            title="Delete note"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {i < events.length - 1 && <div className="h-px bg-[#F0F0F0]" />}
                                        </div>
                                    );
                                })}
                                
                                {isLoading && (
                                    <div className="flex items-center justify-center p-4 text-[#AEAEB2]">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
        </>,
        document.body
    );
};

const EmptyState = ({ text, sub }: { text: string; sub: string }) => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 bg-[#F3F5F7] rounded-full flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5 text-[#AEAEB2]" />
        </div>
        <p className="text-[14px] font-medium text-[#6B7280]">{text}</p>
        <p className="text-[12px] text-[#AEAEB2] mt-1">{sub}</p>
    </div>
);

export default JobTimelineDrawer;
