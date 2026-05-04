import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Loader2, MessageSquare, ChevronUp, ChevronDown } from "lucide-react";
import { jobPostService, JobNote } from "../../../services/jobPostService";
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

// ── Dummy data ──

const DUMMY_NOTES = [
    { id: 101, content: "Immediate notice period extended to 45 days", created_by_name: "Sana", created_at: "2026-01-22T10:30:00Z" },
    { id: 102, content: "Budget is increased upto 25 LPA", created_by_name: "Sana", created_at: "2026-01-08T14:00:00Z" },
    { id: 103, content: "Specific candidates from Pharma industry add on plus", created_by_name: "Sana", created_at: "2026-01-04T09:15:00Z" },
    { id: 104, content: "2 Position are required as of now", created_by_name: "Sana", created_at: "2025-12-21T11:00:00Z" },
    { id: 105, content: "Client prefers candidates with React + Node.js stack", created_by_name: "Ravi", created_at: "2025-12-15T16:00:00Z" },
];

interface ShortlistGroup {
    id: number;
    summary: string;
    count: number;
    date: string;
    people: { name: string; time: string }[];
}

const DUMMY_SHORTLISTED: ShortlistGroup[] = [
    {
        id: 201, summary: "Gopikrishnan B and 9 more people moved to Shortlist stage", count: 10, date: "2026-01-20T05:45:00Z",
        people: [
            { name: "Gopikrishnan B", time: "5:45 AM" }, { name: "Priya Sharma", time: "5:45 AM" },
            { name: "Ankit Verma", time: "5:44 AM" }, { name: "Meera Nair", time: "5:44 AM" },
            { name: "Rohit Kumar", time: "5:43 AM" }, { name: "Sneha Patel", time: "5:43 AM" },
            { name: "Vikram Singh", time: "5:42 AM" }, { name: "Deepa Iyer", time: "5:42 AM" },
            { name: "Arjun Das", time: "5:41 AM" }, { name: "Kavita Rao", time: "5:41 AM" },
        ],
    },
    {
        id: 202, summary: "Shikha and 2 more people moved to Shortlist stage", count: 3, date: "2026-01-18T10:30:00Z",
        people: [
            { name: "Shikha Gupta", time: "10:30 AM" }, { name: "Amit Joshi", time: "10:29 AM" },
            { name: "Neha Kapoor", time: "10:28 AM" },
        ],
    },
];

interface HiredEntry {
    id: number;
    summary: string;
    date: string;
    people: { name: string; role: string; company: string; time: string }[];
}

const DUMMY_HIRED: HiredEntry[] = [
    {
        id: 301, summary: "Hendric Ferguson hired for Software Engineer in Jupiter", date: "2026-01-15T14:00:00Z",
        people: [{ name: "Hendric Ferguson", role: "Software Engineer", company: "Jupiter", time: "2:00 PM" }],
    },
];

// ── Component ──

interface JobTimelineDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: number;
    jobTitle?: string;
}

const JobTimelineDrawer: React.FC<JobTimelineDrawerProps> = ({ isOpen, onClose, jobId }) => {
    const [activeTab, setActiveTab] = useState<"notes" | "shortlisted" | "hired">("notes");
    const [notes, setNotes] = useState<JobNote[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && jobId) { fetchNotes(); } else { setNotes([]); setActiveTab("notes"); setExpandedIds(new Set()); }
    }, [isOpen, jobId]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (isOpen) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const data = await jobPostService.getJobNotes(jobId);
            setNotes(data && data.length > 0 ? data : []);
        } catch { /* fallback to empty */ } finally { setIsLoading(false); }
    };

    // Use real notes if available, else dummy
    const displayNotes = notes.length > 0 ? notes.map(n => ({
        id: n.id, content: n.content, author: n.created_by_name || "User", date: n.created_at,
    })) : DUMMY_NOTES.map(n => ({
        id: n.id, content: n.content, author: n.created_by_name, date: n.created_at,
    }));

    const handleDeleteNote = async (noteId: number) => {
        // Only delete real notes
        if (notes.find(n => n.id === noteId)) {
            try {
                await jobPostService.deleteJobNote(jobId, noteId);
                setNotes(notes.filter(n => n.id !== noteId));
                showToast.success("Note deleted");
            } catch { showToast.error("Failed to delete note"); }
        } else {
            showToast.success("Note deleted");
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const totalActivities = displayNotes.length + DUMMY_SHORTLISTED.length + DUMMY_HIRED.length;

    const tabs = [
        { key: "notes" as const, label: "Notes", count: displayNotes.length, icon: <NotesIcon /> },
        { key: "shortlisted" as const, label: "Shortlisted", count: DUMMY_SHORTLISTED.reduce((a, g) => a + g.count, 0), icon: <ShortlistedIcon /> },
        { key: "hired" as const, label: "Hired", count: DUMMY_HIRED.length, icon: <HiredIcon /> },
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
                            <p className="text-[13px] text-[#8E8E93] mt-0.5">{totalActivities} total activities</p>
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
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12 text-[#AEAEB2]"><Loader2 className="w-6 h-6 animate-spin" /></div>
                    ) : (
                        <div className="px-6 py-4">
                            <p className="text-[11px] font-semibold uppercase text-[#8E8E93] tracking-wider mb-4">
                                {activeTab === "notes" ? "NOTES" : activeTab === "shortlisted" ? "SHORTLISTED" : "HIRED"}
                            </p>

                            {/* ── NOTES TAB ── */}
                            {activeTab === "notes" && (
                                displayNotes.length === 0 ? (
                                    <EmptyState text="No notes yet" sub="Add notes to track important updates for this job." />
                                ) : (
                                    <div className="flex flex-col">
                                        {displayNotes.map((note, i) => (
                                            <div key={note.id}>
                                                <div className="py-4 group">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-medium text-[#0F47F2] mb-1.5">{formatDate(note.date)}</p>
                                                            <p className="text-[15px] font-medium text-[#1C1C1E] leading-snug mb-1">{note.content}</p>
                                                            <p className="text-[12px] text-[#AEAEB2]">{note.author} added this note</p>
                                                        </div>
                                                        <button onClick={() => handleDeleteNote(note.id)} className="p-2 text-[#D1D1D6] hover:text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-all opacity-0 group-hover:opacity-100 ml-3 shrink-0" title="Delete note">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {i < displayNotes.length - 1 && <div className="h-px bg-[#F0F0F0]" />}
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}

                            {/* ── SHORTLISTED TAB ── */}
                            {activeTab === "shortlisted" && (
                                DUMMY_SHORTLISTED.length === 0 ? (
                                    <EmptyState text="No shortlisted activities" sub="Shortlisted candidates will appear here." />
                                ) : (
                                    <div className="flex flex-col">
                                        {DUMMY_SHORTLISTED.map((group, i) => {
                                            const isExpanded = expandedIds.has(group.id);
                                            return (
                                                <div key={group.id}>
                                                    <div className="py-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-[#EBFFEE] flex items-center justify-center shrink-0 mt-0.5">
                                                                <ShortlistedIcon />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[15px] font-medium text-[#1C1C1E] leading-snug mb-1">{group.summary}</p>
                                                                <button onClick={() => toggleExpand(group.id)} className="flex items-center gap-1 text-[13px] font-medium text-[#14AE5C] hover:text-[#0D8A44] transition-colors">
                                                                    {isExpanded ? "Hide" : "View Shortlist"}
                                                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                                </button>
                                                            </div>
                                                            <span className="shrink-0 w-7 h-7 rounded-full bg-[#EBFFEE] text-[#14AE5C] text-[12px] font-bold flex items-center justify-center">{group.count}</span>
                                                        </div>

                                                        {/* Expanded people list */}
                                                        {isExpanded && (
                                                            <div className="ml-11 mt-3 border-l-2 border-[#E5E7EB] pl-4 flex flex-col gap-3">
                                                                {group.people.map((p, pi) => (
                                                                    <div key={pi} className="flex items-start gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-[#EBFFEE] flex items-center justify-center shrink-0">
                                                                            <ShortlistedIcon />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] text-[#AEAEB2] mb-0.5">{p.time}</p>
                                                                            <p className="text-[14px] font-semibold text-[#1C1C1E]">{p.name}</p>
                                                                            <p className="text-[12px] text-[#14AE5C]">Shortlisted · {p.time}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {i < DUMMY_SHORTLISTED.length - 1 && <div className="h-px bg-[#F0F0F0]" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            )}

                            {/* ── HIRED TAB ── */}
                            {activeTab === "hired" && (
                                DUMMY_HIRED.length === 0 ? (
                                    <EmptyState text="No hired activities" sub="Hired candidates will appear here." />
                                ) : (
                                    <div className="flex flex-col">
                                        {DUMMY_HIRED.map((entry, i) => {
                                            const isExpanded = expandedIds.has(entry.id);
                                            return (
                                                <div key={entry.id}>
                                                    <div className="py-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-[#E7EDFF] flex items-center justify-center shrink-0 mt-0.5">
                                                                <HiredIcon />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[15px] font-medium text-[#1C1C1E] leading-snug mb-1">{entry.summary}</p>
                                                                <button onClick={() => toggleExpand(entry.id)} className="flex items-center gap-1 text-[13px] font-medium text-[#14AE5C] hover:text-[#0D8A44] transition-colors">
                                                                    {isExpanded ? "Hide" : "View"}
                                                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="ml-11 mt-3 border-l-2 border-[#E5E7EB] pl-4 flex flex-col gap-3">
                                                                {entry.people.map((p, pi) => (
                                                                    <div key={pi} className="flex items-start gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-[#E7EDFF] flex items-center justify-center shrink-0">
                                                                            <HiredIcon />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[10px] text-[#AEAEB2] mb-0.5">{p.time}</p>
                                                                            <p className="text-[14px] font-semibold text-[#1C1C1E]">{p.name}</p>
                                                                            <p className="text-[12px] text-[#0F47F2]">{p.role} at {p.company}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {i < DUMMY_HIRED.length - 1 && <div className="h-px bg-[#F0F0F0]" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            )}
                        </div>
                    )}
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
