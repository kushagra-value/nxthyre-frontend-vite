import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import candidateService from "../../../../../services/candidateService";
import { useAuthContext } from "../../../../../context/AuthContext";
import { auth } from "../../../../../config/firebase";
import { callStateCache } from "../../../../call/components/callStateCache";
import { showToast } from "../../../../../utils/toast";

export interface CandidateNoteItem {
  id?: string | number;
  noteId?: string;
  content: string;
  is_team_note?: boolean;
  is_community_note?: boolean;
  postedBy?: any;
  posted_at: string;
  organisation?: {
    orgId?: string;
    orgName?: string;
  };
  role?: string;
}

export interface NotesTabProps {
  candidateId?: string;
  candidate?: any;
  notes?: string;
  onChangeNotes?: (notes: string) => void;
  onSaveNotes?: (isSilent?: boolean) => Promise<void> | void;
  activeTags?: string[];
  onToggleTag?: (tag: string) => void;
  isSaving?: boolean;
  callUuid?: string | null;
  [key: string]: any;
}

export default function NotesTab({
  candidateId,
  candidate,
  onChangeNotes,
  onSaveNotes,
}: NotesTabProps) {
  const [notesList, setNotesList] = useState<CandidateNoteItem[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Determine current recruiter's display name
  let currentUserFullName = "Recruiter";
  try {
    const authCtx = useAuthContext();
    if (authCtx?.user?.fullName) {
      currentUserFullName = authCtx.user.fullName;
    }
  } catch {
    currentUserFullName =
      auth.currentUser?.displayName || auth.currentUser?.email || "Recruiter";
  }

  const effectiveCandidateId = candidateId || candidate?.id || "";

  // Auto-scroll to latest note
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Load existing notes for this candidate
  useEffect(() => {
    if (!effectiveCandidateId) {
      setNotesList([]);
      return;
    }

    let isMounted = true;
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const fetched = await candidateService.getCandidateNotes(
          effectiveCandidateId
        );

        if (isMounted) {
          if (Array.isArray(fetched) && fetched.length > 0) {
            setNotesList(fetched);
          } else {
            // Check local cache fallback
            const cached = localStorage.getItem(
              `nxthyre_notes_${effectiveCandidateId}`
            );
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setNotesList(parsed);
                  return;
                }
              } catch { }
            }

            // If candidate has a latest call note, use it; otherwise empty
            if (candidate?.latest_manual_call_note) {
              setNotesList([
                {
                  noteId: "cand-call-note",
                  content: candidate.latest_manual_call_note,
                  postedBy: currentUserFullName,
                  role: "Recruiter",
                  posted_at:
                    candidate.latest_manual_call_at || new Date().toISOString(),
                },
              ]);
            } else {
              setNotesList([]);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch notes from server, checking cache:", err);
        if (isMounted) {
          const cached = localStorage.getItem(
            `nxthyre_notes_${effectiveCandidateId}`
          );
          if (cached) {
            try {
              setNotesList(JSON.parse(cached));
              return;
            } catch { }
          }
          setNotesList([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setTimeout(() => scrollToBottom("auto"), 100);
        }
      }
    };

    fetchNotes();

    return () => {
      isMounted = false;
    };
  }, [effectiveCandidateId, candidate?.latest_manual_call_note]);

  // Format timestamp e.g. "Today, 09:12 am"
  const formatNoteTimestamp = (dateInput: string | Date): string => {
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return "Today, 09:12 am";

      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();

      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeStr = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;

      if (isToday) {
        return `Today, ${timeStr}`;
      }
      if (isYesterday) {
        return `Yesterday, ${timeStr}`;
      }

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${d.getDate()} ${monthNames[d.getMonth()]}, ${timeStr}`;
    } catch {
      return "Today, 09:12 am";
    }
  };

  const getAuthorName = (note: CandidateNoteItem): string => {
    if (typeof note.postedBy === "string" && note.postedBy.trim()) {
      return note.postedBy;
    }
    if (note.postedBy && typeof note.postedBy === "object") {
      return (
        note.postedBy.userName ||
        note.postedBy.full_name ||
        note.postedBy.name ||
        note.postedBy.email ||
        currentUserFullName
      );
    }
    return currentUserFullName || "Recruiter";
  };

  const getAuthorRole = (note: CandidateNoteItem): string => {
    return note.role || "Recruiter";
  };

  const getInitials = (name: string): string => {
    if (!name) return "R";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Submit new note
  const handleSendNote = async () => {
    const text = newNote.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);
    const nowIso = new Date().toISOString();

    const optimisticNote: CandidateNoteItem = {
      noteId: `local-${Date.now()}`,
      content: text,
      postedBy: currentUserFullName,
      role: "Recruiter",
      posted_at: nowIso,
      is_team_note: true,
      is_community_note: false,
    };

    const updatedNotes = [...notesList, optimisticNote];
    setNotesList(updatedNotes);
    setNewNote("");
    setTimeout(() => scrollToBottom("smooth"), 50);

    // Save to local cache so data is never lost
    if (effectiveCandidateId) {
      try {
        localStorage.setItem(
          `nxthyre_notes_${effectiveCandidateId}`,
          JSON.stringify(updatedNotes)
        );
      } catch { }

      // Update call table notes column & cache
      try {
        const existing = sessionStorage.getItem("nxthyre_last_call_completed");
        const parsed = existing ? JSON.parse(existing) : {};
        sessionStorage.setItem(
          "nxthyre_last_call_completed",
          JSON.stringify({
            ...parsed,
            candidateId: effectiveCandidateId,
            noteText: text,
            callTime: nowIso,
          })
        );
      } catch { }

      callStateCache.updateCandidate(effectiveCandidateId, {
        latest_manual_call_note: text,
        latest_manual_call_at: nowIso,
      });
    }

    // Notify CandidateCallPage
    onChangeNotes?.(text);
    onSaveNotes?.(true);

    // Post to existing backend API
    if (effectiveCandidateId && effectiveCandidateId !== "fallback") {
      try {
        await candidateService.postCandidateNote(effectiveCandidateId, {
          teamNotes: text,
        });
      } catch (err) {
        console.warn(
          "Server postCandidateNote failed (retained locally):",
          err
        );
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full w-full justify-between bg-white select-none">
      {/* ── Messages Scroll Area ── */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-6 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#0F47F2] mb-2" />
            <span className="text-xs">Loading notes...</span>
          </div>
        ) : notesList.length === 0 ? null : (
          notesList.map((note, index) => {
            const author = getAuthorName(note);
            const role = getAuthorRole(note);
            const formattedTime = formatNoteTimestamp(note.posted_at);

            return (
              <div
                key={note.noteId || `note-${index}`}
                className="flex flex-col"
              >
                {/* Centered Date Header matching screenshot: "Today, 09:12 am" */}
                <div className="flex justify-center mb-3">
                  <span className="text-xs text-[#9CA3AF] font-normal tracking-wide">
                    {formattedTime}
                  </span>
                </div>

                {/* Note Author & Content Item */}
                <div className="flex flex-col">
                  {/* Author Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D1D5DB] flex items-center justify-center text-slate-600 font-semibold text-xs shrink-0 select-none">
                      {getInitials(author)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] font-semibold text-[#111827] leading-snug truncate">
                        {author}
                      </span>
                      <span className="text-[12px] text-[#9CA3AF] font-normal leading-tight">
                        {role}
                      </span>
                    </div>
                  </div>

                  {/* Note Bubble matching screenshot */}
                  <div className="mt-2.5 bg-[#F4F5F7] rounded-2xl p-4 text-[13px] text-[#4B5563] leading-relaxed shadow-2xs">
                    {note.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Bottom Input Bar matching screenshot ── */}
      <div className="pt-4 mt-auto">
        <div className="bg-[#F4F5F7] rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 border border-slate-200/50 focus-within:border-blue-400 focus-within:bg-white transition-all">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendNote();
              }
            }}
            placeholder="Add a note"
            className="bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none flex-1 py-1"
          />
          <button
            type="button"
            onClick={handleSendNote}
            disabled={!newNote.trim() || isSubmitting}
            className="w-9 h-9 rounded-xl bg-[#0F47F2] hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-[#0F47F2] flex items-center justify-center text-white shrink-0 shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Send Note"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 -translate-x-[1px] translate-y-[1px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
