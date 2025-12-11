// utils/stageColors.ts
export const STAGE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  'shortlisted': { bg: '#3B82F6', border: '#3B82F6', label: 'Shortlisted' },
  'first-round': { bg: '#FFB800', border: '#FFB800', label: 'First Round' },
  'first-interview': { bg: '#FFB800', border: '#FFB800', label: 'First Interview' },
  'technical-round': { bg: '#10B981', border: '#10B981', label: 'Technical Round' },
  'face-to-face': { bg: '#8535EB', border: '#8535EB', label: 'Face to Face' },
  'f2f1': { bg: '#348AEF', border: '#348AEF', label: 'F2F Round 1' },
  'hr-round': { bg: '#2FD08D', border: '#2FD08D', label: 'HR Round' },
  'final-round': { bg: '#8B5CF6', border: '#8B5CF6', label: 'Final Round' },
  'offer-sent': { bg: '#EC4899', border: '#EC4899', label: 'Offer Sent' },
  'archives': { bg: '#6B7280', border: '#6B7280', label: 'Archives' }, 
};

// Fallback: generate consistent color from slug
export const getColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
    '#06B6D4', '#6366F1', '#84CC16', '#F43F5E'
  ];
  return colors[Math.abs(hash) % colors.length];
};