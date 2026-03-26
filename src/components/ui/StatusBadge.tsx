import React from 'react';

interface StatusConfig {
  label: string;
  cls: string;
  dotCls: string;
  pulse?: boolean;
}

const StatusBadge: React.FC<{ status: string; t: (k: string) => string }> = ({ status, t }) => {
  const map: Record<string, StatusConfig> = {
    scheduled: {
      label: t('contestScheduled'),
      cls: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30',
      dotCls: 'bg-blue-500',
    },
    open: {
      label: t('contestOpen'),
      cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/30',
      dotCls: 'bg-emerald-500',
      pulse: true,
    },
    finalized: {
      label: t('contestFinalized'),
      cls: 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      dotCls: 'bg-gray-400 dark:bg-slate-500',
    },
    closed: {
      label: t('contestClosed'),
      cls: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/30',
      dotCls: 'bg-orange-500',
    },
  };

  const cfg = map[status] ?? {
    label: status,
    cls: 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    dotCls: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotCls} ${cfg.pulse ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
