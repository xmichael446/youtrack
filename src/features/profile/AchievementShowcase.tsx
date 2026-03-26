import React, { useState } from 'react';
import { Lock } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';
import type { Achievement } from '../../services/apiTypes';
import { RARITY_COLORS, formatRelative } from './profileHelpers';

const AchievementShowcase: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);

  // Sort: Earned first
  const sorted = [...achievements].sort((a, b) => {
    const aEarned = !!a.earned_at;
    const bEarned = !!b.earned_at;
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    return 0;
  });

  const selectedDef = sorted.find(d => d.key === selected);
  const earnedCount = achievements.filter(a => !!a.earned_at).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="section-label">
          {t('achievements')}
        </p>
        <span className="text-xs text-gray-400 dark:text-slate-500">
          {earnedCount}/{achievements.length}
        </span>
      </div>

      {/* Badge cards — horizontal scroll */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar items-stretch">
        {sorted.map((def, idx) => {
          const earned = !!def.earned_at;
          const prevEarned = idx > 0 ? !!sorted[idx - 1].earned_at : true;

          // Show separator if this one is NOT earned but the previous one WAS earned
          const showSeparator = idx > 0 && !earned && prevEarned;

          const borderColor = RARITY_COLORS[def.rarity] || '#9ca3af';
          const isSelected = selected === def.key;

          return (
            <React.Fragment key={def.key}>
              {showSeparator && (
                <div className="w-px self-stretch bg-gray-100 dark:bg-slate-800 mx-1" />
              )}
              <button
                onClick={() => setSelected(isSelected ? null : def.key)}
                aria-expanded={isSelected}
                aria-controls={`badge-detail-${def.key}`}
                aria-label={`${def.name} — ${def.rarity}`}
                className="shrink-0 w-[88px] flex flex-col items-center p-2.5 rounded-xl transition-all duration-200 text-left relative"
                style={{
                  border: `1.5px solid ${isSelected ? borderColor : earned ? `${borderColor}60` : 'transparent'}`,
                  backgroundColor: isSelected
                    ? `${borderColor}18`
                    : earned ? `${borderColor}08` : undefined,
                  boxShadow: isSelected ? `0 0 0 3px ${borderColor}20` : undefined,
                }}
              >
                <span className="text-2xl leading-none mt-0.5 mb-1.5">{def.icon}</span>
                <p className="text-xs font-medium text-center leading-tight text-gray-700 dark:text-slate-200 line-clamp-2 w-full flex-1">
                  {def.name}
                </p>
                <span className="mt-auto text-xs font-medium px-1.5 py-0.5 rounded-full leading-none"
                  style={{ backgroundColor: `${borderColor}20`, color: borderColor }}>
                  {def.rarity}
                </span>
                {earned ? (
                  <p className="text-xs text-brand-primary leading-none mt-1">
                    ✓ {formatRelative(def.earned_at, t)}
                  </p>
                ) : (
                  <div className="absolute top-1.5 right-1.5 bg-white/80 dark:bg-slate-900/80 rounded-full p-0.5 shadow-sm">
                    <Lock className="w-2.5 h-2.5 text-gray-400" />
                  </div>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Inline detail panel — shown when a badge is selected */}
      {selectedDef && (
        <div id={`badge-detail-${selectedDef.key}`} className="mt-3 p-3.5 rounded-xl border animate-in fade-in duration-200"
          style={{
            borderColor: `${RARITY_COLORS[selectedDef.rarity] || '#9ca3af'}40`,
            backgroundColor: `${RARITY_COLORS[selectedDef.rarity] || '#9ca3af'}08`,
          }}>
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none shrink-0 mt-0.5">
              {selectedDef.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="text-sm font-semibold text-brand-dark dark:text-white">
                  {selectedDef.name}
                </p>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${RARITY_COLORS[selectedDef.rarity] || '#9ca3af'}25`,
                    color: RARITY_COLORS[selectedDef.rarity] || '#9ca3af',
                  }}>
                  {selectedDef.rarity}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
                {selectedDef.description}
              </p>
              {selectedDef.earned_at ? (
                <p className="text-xs text-brand-primary font-medium mt-1.5">
                  ✓ {t('earned')} {formatRelative(selectedDef.earned_at, t)}
                </p>
              ) : (
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                  🔒 {t('notYetEarned')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementShowcase;
