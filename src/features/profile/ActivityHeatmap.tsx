import React, { useMemo, useState } from 'react';

import { useLanguage } from '../../context/LanguageContext';
import type { HeatmapEntry } from '../../services/apiTypes';
import { buildHeatmapGrid, heatmapColorClass } from './profileHelpers';

const ActivityHeatmap: React.FC<{ entries: HeatmapEntry[] }> = ({ entries }) => {
  const { t } = useLanguage();
  const [tooltip, setTooltip] = useState<number | null>(null);
  const grid = useMemo(() => buildHeatmapGrid(entries), [entries]);
  const firstDate = new Date(grid[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const lastDate  = new Date(grid[grid.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="bg-surface-primary dark:bg-surface-dark-primary rounded-card border border-surface-secondary dark:border-surface-dark-elevated p-4 shadow-sm">
      <p className="section-label mb-3">
        {t('activityHeatmap')}
      </p>
      <div className="flex gap-1 flex-wrap">
        {grid.map((cell, i) => {
          const colorCls = heatmapColorClass(cell.count);
          const ariaLabel = cell.count > 0
            ? t('heatmapActivities').replace('{count}', String(cell.count)) + ` — ${cell.date}`
            : t('heatmapNoActivity') + ` — ${cell.date}`;
          return (
            <div key={cell.date} className="relative">
              <button
                aria-label={ariaLabel}
                className="w-6 h-6 rounded-md transition-transform hover:scale-110"
                onMouseEnter={() => setTooltip(i)}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => setTooltip(tooltip === i ? null : i)}
              >
                <div className={`w-full h-full rounded-md ${colorCls}`} />
              </button>
              {tooltip === i && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 whitespace-nowrap bg-surface-dark-primary dark:bg-surface-dark-primary text-white text-caption rounded-button px-2 py-1 shadow-lg border border-surface-dark-elevated pointer-events-none">
                  {cell.count > 0 ? t('heatmapActivities').replace('{count}', String(cell.count)) : t('heatmapNoActivity')}
                  <div className="text-text-theme-dark-muted">{cell.date}</div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-surface-dark-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">{firstDate}</span>
        <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">{lastDate}</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
