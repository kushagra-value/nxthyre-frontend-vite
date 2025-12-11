// utils/stageColors.ts
export const STAGE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  'shortlisted': { bg: '#accafbff', border: '#3B82F6', label: 'Shortlisted' },
  'first-round': { bg: '#ffe8aeff', border: '#FFB800', label: 'First Round' },
  'first-interview': { bg: '#f3d791ff', border: '#FFB800', label: 'First Interview' },
  'technical-round': { bg: '#7ff0caff', border: '#10B981', label: 'Technical Round' },
  'face-to-face': { bg: '#c99fffff', border: '#8535EB', label: 'Face to Face' },
  'f2f1': { bg: '#9cc6f7ff', border: '#348AEF', label: 'F2F Round 1' },
  'hr-round': { bg: '#9bfad2ff', border: '#2FD08D', label: 'HR Round' },
  'final-round': { bg: '#d3c0ffff', border: '#8B5CF6', label: 'Final Round' },
  'offer-sent': { bg: '#f9a9d1ff', border: '#EC4899', label: 'Offer Sent' },
  'archives': { bg: '#b0c3e9ff', border: '#6B7280', label: 'Archives' }, 
};

// Fallback: generate consistent color from slug
export const getColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#fda4a4ff', '#ffdda3ff', '#a8fbdfff', '#b8d0f6ff',
    '#c3aef3ff', '#fcc0deff', '#aef9f0ff', '#f8d0b3ff',
    '#afeef9ff', '#c6c7f6ff', '#def7b9ff', '#ffc8d1ff'
  ];
  return colors[Math.abs(hash) % colors.length];
};