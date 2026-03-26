import React from 'react';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';
import type { ActivityEntry } from '../../services/apiTypes';
import { formatRelative } from './profileHelpers';

const ActivityFeed: React.FC<{
  entries: ActivityEntry[];
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
}> = ({ entries, hasMore, onLoadMore, loadingMore }) => {
  const { t } = useLanguage();

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow-sm text-center">
        <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{t('noActivity')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-50 dark:border-slate-800/70">
        <p className="section-label">
          {t('activityFeed')}
        </p>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center px-5 py-3 gap-3">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              entry.negative ? 'bg-red-50 dark:bg-red-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10'}`}>
              {entry.negative
                ? <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                : <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-dark dark:text-white truncate">{entry.reason}</p>
              <p className="text-xs font-normal text-gray-400 dark:text-slate-500">{formatRelative(entry.datetime, t)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold tabular-nums ${entry.negative ? 'text-red-500' : 'text-emerald-500'}`}>
                {entry.negative ? '-' : '+'}{entry.xp} XP
              </p>
              {entry.coins !== 0 && (
                <p className={`text-xs tabular-nums ${entry.negative ? 'text-red-400' : 'text-amber-500'}`}>
                  {entry.negative ? '-' : '+'}{entry.coins} coins
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="px-5 py-3 border-t border-gray-50 dark:border-slate-800/70">
          <button onClick={onLoadMore} disabled={loadingMore}
            className="w-full h-9 rounded-xl bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loadingMore
              ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <ChevronDown className="w-3.5 h-3.5" />}
            {t('loadMore')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
