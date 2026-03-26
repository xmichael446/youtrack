import type { HeatmapEntry } from '../../services/apiTypes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const RARITY_COLORS: Record<string, string> = {
  common:    '#9ca3af',
  rare:      '#3b82f6',
  epic:      '#8b5cf6',
  legendary: '#f59e0b',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0] ?? '').join('').toUpperCase();
}

export function getAvatarBg(id: number) {
  return `hsl(${(id * 137) % 360}, 60%, 50%)`;
}

export function formatRelative(dateStr: string | null, t: (k: string) => string) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const s = Math.floor(diffMs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (s < 60)  return t('justNow');
  if (m < 60)  return t('mAgo').replace('{m}', String(m));
  if (h < 24)  return t('hAgo').replace('{h}', String(h));
  if (d < 30)  return t('dAgo').replace('{d}', String(d));
  return date.toLocaleDateString(navigator.language, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function buildHeatmapGrid(entries: HeatmapEntry[]) {
  const countMap = new Map(entries.map(e => [e.date, e.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (entries.length === 0) {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - i));
      return { date: d.toISOString().split('T')[0], count: 0 };
    });
  }

  const sortedDates = entries.map(e => e.date).sort();
  const startDate = new Date(sortedDates[0]);
  startDate.setHours(0, 0, 0, 0);

  const cells: { date: string; count: number }[] = [];
  const cur = new Date(startDate);
  while (cur <= today) {
    const date = cur.toISOString().split('T')[0];
    cells.push({ date, count: countMap.get(date) ?? 0 });
    cur.setDate(cur.getDate() + 1);
  }
  return cells;
}

export function heatmapColorClass(count: number) {
  if (count === 0) return 'bg-gray-100 dark:bg-slate-800';
  if (count <= 2)  return 'bg-green-200 dark:bg-green-900/70';
  if (count <= 4)  return 'bg-green-400 dark:bg-green-600';
  return 'bg-green-600 dark:bg-green-500';
}
