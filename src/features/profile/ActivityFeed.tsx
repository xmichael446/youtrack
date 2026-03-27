import React from 'react';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';
import type { ActivityEntry } from '../../services/apiTypes';
import { formatRelative } from './profileHelpers';
import { Card, Button } from '../../components/ui';

const ActivityFeed: React.FC<{
  entries: ActivityEntry[];
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
}> = ({ entries, hasMore, onLoadMore, loadingMore }) => {
  const { t } = useLanguage();

  if (entries.length === 0) {
    return (
      <Card variant="default" padding="lg" className="text-center">
        <p className="text-body text-text-theme-secondary dark:text-text-theme-dark-secondary leading-relaxed">{t('noActivity')}</p>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-secondary/70 dark:border-surface-dark-elevated/70">
        <p className="section-label">
          {t('activityFeed')}
        </p>
      </div>
      <div className="divide-y divide-surface-secondary dark:divide-surface-dark-elevated/50">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center px-4 py-3 gap-3">
            <div className={`w-7 h-7 rounded-input flex items-center justify-center shrink-0 ${
              entry.negative ? 'bg-red-50 dark:bg-red-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10'}`}>
              {entry.negative
                ? <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                : <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body text-brand-dark dark:text-text-theme-dark-primary truncate">{entry.reason}</p>
              <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">{formatRelative(entry.datetime, t)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-body font-bold tabular-nums ${entry.negative ? 'text-red-500' : 'text-emerald-500'}`}>
                {entry.negative ? '-' : '+'}{entry.xp} XP
              </p>
              {entry.coins !== 0 && (
                <p className={`text-caption tabular-nums ${entry.negative ? 'text-red-400' : 'text-amber-500'}`}>
                  {entry.negative ? '-' : '+'}{entry.coins} coins
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="px-4 py-3 border-t border-surface-secondary/70 dark:border-surface-dark-elevated/70">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={onLoadMore}
            loading={loadingMore}
            icon={<ChevronDown className="w-3.5 h-3.5" />}
            iconPosition="left"
          >
            {t('loadMore')}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ActivityFeed;
