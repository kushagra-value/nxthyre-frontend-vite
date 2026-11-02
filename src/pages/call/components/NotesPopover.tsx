import React, { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, MessageSquare } from "lucide-react";
import candidateService from "../../../services/candidateService";
import { callStateCache } from "./callStateCache";
import { useAuthContext } from "../../../context/AuthContext";
import { auth } from "../../../config/firebase";
import { showToast } from "../../../utils/toast";

export interface NotesPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string | number;
  candidateName: string;
  onNoteAdded?: (noteText: string) => void;
}

interface NoteDisplayItem {
  id?: string | number;
  noteId?: string;
  content: string;
  postedBy?: any;
  posted_at?: string;
  role?: string;
}

export const NotesPopover: React.FC<NotesPopoverProps> = ({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  onNoteAdded,
}) => {
  const [notes, setNotes] = useState<NoteDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  let currentUserName = "Recruiter";
  try {
    const authCtx = useAuthContext();
    if (authCtx?.user?.fullName) {
      currentUserName = authCtx.user.fullName;
    }
  } catch {
    currentUserName =
      auth.currentUser?.displayName || auth.currentUser?.email || "Recruiter";
  }

  const effectiveId = String(candidateId || "");

  // Load notes on open
  useEffect(() => {
    if (!isOpen || !effectiveId) return;

    let mounted = true;
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const fetched = await candidateService.getCandidateNotes(effectiveId);
        if (mounted) {
          if (Array.isArray(fetched) && fetched.length > 0) {
            setNotes(fetched as NoteDisplayItem[]);
          } else {
            // Check local fallback
            const cached = localStorage.getItem(`nxthyre_notes_${effectiveId}`);
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setNotes(parsed);
                  return;
                }
              } catch {}
            }
            setNotes([]);
          }
        }
      } catch (err) {
        console.warn("Could not fetch notes from backend, using cache:", err);
        if (mounted) {
          const cached = localStorage.getItem(`nxthyre_notes_${effectiveId}`);
          if (cached) {
            try {
              setNotes(JSON.parse(cached));
              return;
            } catch {}
          }
          setNotes([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }, 100);
        }
      }
    };

    fetchNotes();

    return () => {
      mounted = false;
    };
  }, [isOpen, effectiveId]);

  if (!isOpen) return null;

  const handleSendNote = async () => {
    const text = newNote.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    const nowIso = new Date().toISOString();

    const optimisticNote: NoteDisplayItem = {
      noteId: `local-${Date.now()}`,
      content: text,
      postedBy: currentUserName,
      role: "Recruiter",
      posted_at: nowIso,
    };

    const updated = [...notes, optimisticNote];
    setNotes(updated);
    setNewNote("");

    // Persist to local cache for immediate tab synchronization
    try {
      localStorage.setItem(`nxthyre_notes_${effectiveId}`, JSON.stringify(updated));
    } catch {}

    // Update candidate in call listing cache
    callStateCache.updateCandidate(effectiveId, {
      latest_manual_call_note: text,
      latest_manual_call_at: nowIso,
    });

    onNoteAdded?.(text);

    try {
      await candidateService.postCandidateNote(effectiveId, {
        teamNotes: text,
        is_community_note: false,
      });
      showToast.success("Note added successfully");
    } catch (err) {
      console.warn("API call to post note failed, saved in session cache:", err);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  };

  const formatTimestamp = (dateStr?: string): string => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Just now";
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col h-[520px] overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">
                Candidate Notes
              </h3>
              <p className="text-xs text-gray-500 font-medium">{candidateName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notes Scroll Area */}
        <div
          ref={scrollRef}
          className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#F9FAFB] custom-scrollbar"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-[#0F47F2]" />
              <span className="text-xs">Loading notes...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
              <MessageSquare className="w-8 h-8 stroke-1" />
              <p className="text-xs">No notes added yet for this candidate.</p>
            </div>
          ) : (
            notes.map((item, idx) => {
              const author =
                typeof item.postedBy === "string"
                  ? item.postedBy
                  : item.postedBy?.full_name || item.postedBy?.userName || currentUserName;
              const initials = author
                ? author
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "RE";

              return (
                <div
                  key={item.id || item.noteId || idx}
                  className="bg-white rounded-xl p-3.5 border border-[#E5E7EB] shadow-xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-[#0F47F2] text-[10px] font-bold flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <span className="text-xs font-semibold text-gray-900">
                        {author}
                      </span>
                      <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {item.role || "Recruiter"}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {formatTimestamp(item.posted_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed pl-8">
                    {item.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Input Composer */}
        <div className="p-3.5 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendNote();
              }
            }}
            placeholder="Add a new note for this candidate... (Press Enter to send)"
            rows={2}
            className="flex-1 p-2.5 text-xs border border-[#D1D5DB] focus:border-[#0F47F2] rounded-xl focus:outline-none resize-none bg-white text-gray-800 placeholder-gray-400"
          />
          <button
            type="button"
            disabled={!newNote.trim() || isSubmitting}
            onClick={handleSendNote}
            className="w-10 h-10 flex items-center justify-center bg-[#0F47F2] hover:bg-[#0c39c2] text-white rounded-xl shadow-xs transition disabled:opacity-40 cursor-pointer shrink-0"
            title="Send note"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesPopover;

