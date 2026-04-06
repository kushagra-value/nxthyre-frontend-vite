import React, { useState, useEffect } from "react";
import { X, Trash2, Pencil, Send, MessageSquare, Loader2, Check, XCircle } from "lucide-react";
import { jobPostService, JobNote } from "../../../services/jobPostService";
import { showToast } from "../../../utils/toast";

interface JobNotesModalProps {
    jobId: number;
    isOpen: boolean;
    onClose: () => void;
}

const JobNotesModal: React.FC<JobNotesModalProps> = ({ jobId, isOpen, onClose }) => {
    const [notes, setNotes] = useState<JobNote[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");

    useEffect(() => {
        if (isOpen && jobId) {
            fetchNotes();
        } else {
            setNotes([]);
            setNewNoteContent("");
            setEditingNoteId(null);
        }
    }, [isOpen, jobId]);

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const data = await jobPostService.getJobNotes(jobId);
            setNotes(data || []);
        } catch (error) {
            showToast.error("Failed to load notes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const content = newNoteContent.trim();
        if (!content) return;

        setIsSubmitting(true);
        try {
            const newNote = await jobPostService.addJobNote(jobId, content);
            setNotes([newNote, ...notes]);
            setNewNoteContent("");
            showToast.success("Note added");
        } catch (error) {
            showToast.error("Failed to add note");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateNote = async (noteId: number) => {
        const content = editContent.trim();
        if (!content) return;

        try {
            const updatedNote = await jobPostService.updateJobNote(jobId, noteId, content);
            setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
            setEditingNoteId(null);
            showToast.success("Note updated");
        } catch (error) {
            showToast.error("Failed to update note");
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        if (!confirm("Are you sure you want to delete this note?")) return;

        try {
            await jobPostService.deleteJobNote(jobId, noteId);
            setNotes(notes.filter(n => n.id !== noteId));
            showToast.success("Note deleted");
        } catch (error) {
            showToast.error("Failed to delete note");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden m-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-800">
                        <MessageSquare className="w-5 h-5 text-[#0F47F2]" />
                        <h2 className="text-lg font-semibold">Job Notes</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 custom-scrollbar flex flex-col gap-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-8 text-gray-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 text-sm flex flex-col items-center">
                            <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                            <p>No notes yet</p>
                            <p className="text-xs opacity-70 mt-1">Add a note below to keep track of important job updates.</p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div key={note.id} className="bg-white border text-sm border-gray-100 rounded-xl p-4 shadow-sm relative group hover:border-[#0F47F2]/20 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-[#E7EDFF] text-[#0F47F2] font-semibold text-xs flex items-center justify-center uppercase">
                                            {note.created_by_name?.charAt(0) || "U"}
                                        </div>
                                        <span className="font-semibold text-gray-700 text-xs">{note.created_by_name || "User"}</span>
                                        <span className="text-[10px] text-gray-400">• {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => {
                                                setEditingNoteId(note.id);
                                                setEditContent(note.content);
                                            }} 
                                            className="p-1 text-gray-400 hover:text-[#0F47F2] hover:bg-[#E7EDFF] rounded"
                                            title="Edit note"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteNote(note.id)} 
                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            title="Delete note"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                {editingNoteId === note.id ? (
                                    <div className="mt-2">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-[#0F47F2] resize-none min-h-[60px]"
                                            autoFocus
                                        />
                                        <div className="flex items-center justify-end gap-2 mt-2">
                                            <button 
                                                onClick={() => setEditingNoteId(null)}
                                                className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Cancel
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateNote(note.id)}
                                                disabled={!editContent.trim()}
                                                className="px-3 py-1.5 text-xs bg-[#0F47F2] text-white hover:bg-[#0c39c2] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            >
                                                <Check className="w-3.5 h-3.5" /> Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <form onSubmit={handleAddNote} className="relative">
                        <textarea
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            placeholder="Add a new note..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#0F47F2] focus:ring-1 focus:ring-[#0F47F2] resize-none overflow-hidden"
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddNote();
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!newNoteContent.trim() || isSubmitting}
                            className="absolute right-3 bottom-3 p-2 bg-[#0F47F2] text-white rounded-lg hover:bg-[#0c39c2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </form>
                    <div className="text-[10px] text-gray-400 mt-2 text-right">Press Enter to send, Shift+Enter for new line</div>
                </div>
            </div>
        </div>
    );
};

export default JobNotesModal;
