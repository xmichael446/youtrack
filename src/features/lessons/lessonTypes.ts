export type ShowToast = (message: string, type: 'success' | 'error') => void;

export const humanizeStatus = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const assignmentStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'approved') return 'text-emerald-600 dark:text-emerald-400';
  if (s === 'rejected' || s === 'missed') return 'text-red-500 dark:text-red-400';
  if (s === 'submitted' || s === 'pending' || s.includes('awaiting')) return 'text-amber-600 dark:text-amber-500';
  return 'text-text-theme-secondary dark:text-text-theme-dark-secondary';
};

export const assignmentStatusDot = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'approved') return 'bg-emerald-500';
  if (s === 'rejected' || s === 'missed') return 'bg-red-500';
  if (s === 'submitted' || s === 'pending' || s.includes('awaiting')) return 'bg-amber-400';
  return 'bg-gray-400';
};

export const assignmentStatusBg = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'approved') return 'bg-emerald-500/10';
  if (s === 'rejected' || s === 'missed') return 'bg-red-500/10';
  if (s === 'submitted' || s === 'pending' || s.includes('awaiting')) return 'bg-amber-500/10';
  return 'bg-gray-500/10';
};
