import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import apiClient from '../../../services/api';
import dashboardService from '../../../services/dashboardService';
import { sortStages, SortableStage } from '../../../utils/stageUtils';
import { showToast } from '../../../utils/toast';

export interface MoveStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  role: string;
  company?: string;
  applicationId: number;
  jobRoleId: number;
  currentStageName?: string;
  nextStageId?: number;
  tabKey?: 'sourcing' | 'screening' | 'interview';
  onSuccess: () => void;
}

export default function MoveStageModal({
  isOpen,
  onClose,
  candidateName,
  role,
  company,
  applicationId,
  jobRoleId,
  currentStageName,
  nextStageId,
  tabKey,
  onSuccess,
}: MoveStageModalProps) {
  const [stages, setStages] = useState<SortableStage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isLoadingStages, setIsLoadingStages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !jobRoleId) return;

    let isMounted = true;
    setIsLoadingStages(true);

    apiClient
      .get(`/jobs/applications/stages/?job_id=${jobRoleId}`)
      .then((res) => {
        if (!isMounted) return;
        const fetched: SortableStage[] = res.data || [];
        const sorted = sortStages(fetched);
        setStages(sorted);

        // Pre-select nextStageId if valid, otherwise pick next non-archive stage
        if (nextStageId && sorted.some((s) => s.id === nextStageId)) {
          setSelectedStageId(nextStageId);
        } else {
          const eligible = sorted.filter((s) => s.slug !== 'archives');
          if (eligible.length > 0) {
            setSelectedStageId(eligible[0].id ?? null);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load stages for job:', err);
        setStages([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingStages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, jobRoleId, nextStageId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStageId) {
      showToast.error('Please select a target stage');
      return;
    }

    const targetStage = stages.find((s) => s.id === selectedStageId);
    const targetStageName = targetStage?.name || 'next stage';

    setIsSubmitting(true);
    try {
      // 1. Move stage via the applications API matching Kanban board implementation
      await apiClient.patch(`/jobs/applications/${applicationId}/?view=kanban`, {
        current_stage: selectedStageId,
        feedback: feedbackNote.trim()
          ? {
              subject: `Moved to ${targetStageName}`,
              comment: feedbackNote.trim(),
            }
          : undefined,
      });

      // 2. Mark priority action as completed
      await dashboardService.completePriorityAction({
        application_id: applicationId,
        tab: (tabKey as any) || 'interview',
        action_taken: `Moved to ${targetStageName}`,
      });

      showToast.success(`Candidate moved to ${targetStageName}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to move stage:', err);
      showToast.error(
        err.response?.data?.detail || err.response?.data?.error || 'Failed to move candidate to the selected stage'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <span>Move Stage</span>
              <ArrowRight className="w-4 h-4 text-[#0F47F2]" />
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Select the next pipeline stage for this interview candidate
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Summary Card */}
        <div className="p-6 pb-2">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <h4 className="text-sm font-bold text-[#0F172A] truncate">{candidateName}</h4>
              <p className="text-xs text-[#475569] truncate mt-0.5">
                {role} {company ? `• ${company}` : ''}
              </p>
            </div>
            {currentStageName && (
              <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                {currentStageName}
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 flex flex-col gap-4">
          {/* Target Stage Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-2 uppercase tracking-wider">
              Select Target Stage
            </label>
            {isLoadingStages ? (
              <div className="flex items-center justify-center py-6 text-xs text-[#64748B] gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0F47F2]" />
                <span>Loading available stages...</span>
              </div>
            ) : stages.length === 0 ? (
              <div className="text-xs text-[#94A3B8] py-3 text-center bg-slate-50 rounded-lg">
                No stages found for this job
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                {stages
                  .filter((stage) => stage.slug !== 'archives')
                  .map((stage) => {
                    const isSelected = selectedStageId === stage.id;
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => setSelectedStageId(stage.id ?? null)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#0F47F2] text-[#0F47F2] shadow-2xs'
                            : 'bg-white border-slate-200 text-[#334155] hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate pr-2">{stage.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0F47F2] shrink-0" />}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Feedback / Note Textarea */}
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1.5 uppercase tracking-wider">
              Feedback / Stage Note <span className="text-[#94A3B8] font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="Add feedback, interview assessment notes, or next action details..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0F47F2]/20 focus:border-[#0F47F2] resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-[#475569] hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStageId}
              className="px-5 py-2 rounded-xl bg-[#0F47F2] hover:bg-[#0D3ED4] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Moving...</span>
                </>
              ) : (
                <>
                  <span>Move Stage</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

