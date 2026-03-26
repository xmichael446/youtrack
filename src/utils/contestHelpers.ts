export function statusAccentClass(status: string): string {
  switch (status) {
    case 'open':
      return 'border-l-4 border-l-emerald-400';
    case 'scheduled':
      return 'border-l-4 border-l-blue-400';
    case 'finalized':
      return 'border-l-4 border-l-gray-300 dark:border-l-slate-600';
    default:
      return 'border-l-4 border-l-orange-400';
  }
}

export function prizeGradient(place: number): {
  card: string;
  badge: string;
  value: string;
} {
  if (place === 1)
    return {
      card: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/15 dark:to-yellow-900/10 border-amber-200/60 dark:border-amber-600/20',
      badge:
        'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-600/30',
      value: 'text-amber-600 dark:text-amber-400',
    };
  if (place === 2)
    return {
      card: 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700/20 dark:to-slate-800/20 border-slate-200/80 dark:border-slate-600/30',
      badge:
        'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-300/60 dark:border-slate-600/30',
      value: 'text-slate-600 dark:text-slate-300',
    };
  if (place === 3)
    return {
      card: 'bg-gradient-to-r from-orange-50 to-amber-50/50 dark:from-orange-900/15 dark:to-amber-900/10 border-orange-200/60 dark:border-orange-700/20',
      badge:
        'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300/60 dark:border-orange-700/30',
      value: 'text-orange-600 dark:text-orange-400',
    };
  return {
    card: 'bg-gray-50 dark:bg-slate-800/40 border-gray-100 dark:border-slate-700/40',
    badge:
      'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-600',
    value: 'text-gray-500 dark:text-slate-400',
  };
}

export const CONTEST_STORAGE_KEY = (id: number) => `contest_play_${id}`;

export interface ContestPlayState {
  questions: any[];
  contestEndTime: string;
  answers: any[];
  submitted: boolean;
  score?: number;
  total?: number;
}
