import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Edit3, Settings, Camera, TrendingUp, TrendingDown,
  Lock, ChevronDown, Coins, Zap, Flame, CheckCircle, XCircle, AlertCircle,
  Medal, Trophy,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';
import { apiService } from '../services/ApiService';
import LoadingScreen from '../components/LoadingScreen';
import type { ProfileData, ActivityEntry, HeatmapEntry, Achievement, ContestBadge } from '../services/apiTypes';

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const RARITY_COLORS: Record<string, string> = {
  common:    '#9ca3af',
  rare:      '#3b82f6',
  epic:      '#8b5cf6',
  legendary: '#f59e0b',
};

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0] ?? '').join('').toUpperCase();
}
function getAvatarBg(id: number) {
  return `hsl(${(id * 137) % 360}, 60%, 50%)`;
}
function getProgressColor(pct: number) {
  if (pct >= 80) return '#22c55e';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
}
function formatRelative(dateStr: string | null, t: (k: string) => string) {
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function buildHeatmapGrid(entries: HeatmapEntry[]) {
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
function heatmapColor(count: number) {
  if (count === 0) return null;
  if (count <= 2)  return '#bbf7d0';
  if (count <= 4)  return '#4ade80';
  return '#16a34a';
}

// ---------------------------------------------------------------------------
// Small reusable UI
// ---------------------------------------------------------------------------

const CircularRing: React.FC<{ pct: number; color: string; size?: number }> = ({ pct, color, size = 72 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={5} fill="none"
        className="stroke-gray-100 dark:stroke-slate-800" />
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={5} fill="none"
        stroke={color} strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
    </svg>
  );
};

const Toast: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => (
  <div className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-white text-sm font-medium font-mono animate-in fade-in duration-300
    ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
    {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
    {message}
  </div>
);

// ---------------------------------------------------------------------------
// ProfileHero — includes avatar, bio, streak, compact stats and level bar
// ---------------------------------------------------------------------------

const ProfileHero: React.FC<{
  profile: ProfileData;
  enrollmentId: number | null;
  onEdit: () => void;
  onSettings: () => void;
}> = ({ profile, enrollmentId, onEdit, onSettings }) => {
  const { t } = useLanguage();
  const { navigateBack } = useNavigation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const avatarUrl = profile.avatar ? `${baseUrl}${profile.avatar}` : null;
  const id = enrollmentId ?? 0;
  const { level, stats } = profile;
  const hasAttendance = 'attendance_pct' in stats;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <button onClick={navigateBack}
          className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors text-[12px] font-bold font-mono uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        {profile.is_own_profile && (
          <div className="flex items-center gap-2">
            <button onClick={onSettings}
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-brand-primary/10 text-brand-primary text-[11px] font-bold font-mono uppercase tracking-wide hover:bg-brand-primary/20 transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
              {t('editProfile')}
            </button>
          </div>
        )}
      </div>

      {/* Avatar + info */}
      <div className="px-5 pb-4 flex items-start gap-4">
        <div className="shrink-0 relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt={profile.full_name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-slate-700" />
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-xl font-bold ring-2 ring-gray-100 dark:ring-slate-700"
              style={{ backgroundColor: getAvatarBg(id) }}>
              {getInitials(profile.full_name)}
            </div>
          )}
          {profile.rank > 0 && (
            <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-lg bg-brand-primary text-white text-[10px] font-bold font-mono shadow-md">
              #{profile.rank}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-brand-dark dark:text-white tracking-tight leading-tight">
            {profile.full_name}
          </h2>
          <p className="text-[12px] text-gray-500 dark:text-slate-400 font-medium mt-0.5">
            {profile.group_name} &middot; {profile.course_name}
          </p>
          
          {/* Pills Row: Streak, Coins, XP */}
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.streak > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span className="text-[11px] font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">{t('streakDays').replace('{count}', String(profile.streak))}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 shadow-sm">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">{stats.balance ?? 0}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-primary/10 border border-brand-primary/20 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/20" />
              <span className="text-[11px] font-bold font-mono text-brand-primary tabular-nums">{stats.total_points} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance & Assignments Info Row — Simple & Clean */}
      <div className="px-5 pb-4 flex items-center gap-6 divide-x divide-gray-100 dark:divide-slate-800">
        {hasAttendance && (
          <div className="flex flex-col">
            <span className="text-[9px] font-bold font-mono text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('attendance')}</span>
            <span className="text-sm font-bold text-brand-dark dark:text-white font-mono tabular-nums">{Math.round(stats.attendance_pct!)}%</span>
          </div>
        )}
        {hasAttendance && (
          <div className="flex flex-col pl-6">
            <span className="text-[9px] font-bold font-mono text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('assignments')}</span>
            <span className="text-sm font-bold text-brand-dark dark:text-white font-mono tabular-nums">{Math.round(stats.assignment_pct ?? 0)}%</span>
          </div>
        )}
      </div>
      
      {/* Contest Badges - Moved inside main card */}
      {profile.contest_badges && profile.contest_badges.length > 0 && (
        <div className="px-5 pb-4 overflow-x-auto no-scrollbar flex gap-2.5">
          {profile.contest_badges.map(badge => {
            const isGold = badge.place === 1;
            const isSilver = badge.place === 2;
            const isBronze = badge.place === 3;
            return (
              <div key={badge.id} 
                className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100/50 dark:border-slate-700/50 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm
                  ${isGold ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' : 
                    isSilver ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-400' :
                    isBronze ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-400' :
                    'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                  {isGold ? <Trophy className="w-4 h-4" /> : <Medal className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-brand-dark dark:text-white leading-tight truncate max-w-[120px]">
                    {badge.reward_name}
                  </p>
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-medium font-mono">
                    #{badge.place} &middot; {badge.contest_name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bio */}
      <div className="px-5 pb-4">
        {profile.bio ? (
          <p className="text-[13px] text-gray-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
        ) : profile.is_own_profile ? (
          <button onClick={onEdit}
            className="text-[12px] text-brand-primary/70 italic hover:text-brand-primary transition-colors">
            {t('bioPlaceholder')}
          </button>
        ) : (
          <p className="text-[12px] text-gray-400 dark:text-slate-500 italic">{t('noBioPeer')}</p>
        )}
      </div>

      {/* Level bar */}
      <div className="px-5 pb-5 border-t border-gray-50 dark:border-slate-800/70 pt-4">
        {level ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{level.icon}</span>
                <span className="text-[13px] font-bold text-brand-dark dark:text-white font-mono">
                  {t('level')} {level.number} &middot; {level.name}
                </span>
              </div>
              <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">
                {level.xp_next ? t('levelNextLabel').replace('{n}', String(level.number + 1)) : t('maxLevel')}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${level.progress_percent}%`, backgroundColor: level.badge_color }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">{level.xp_current} XP</span>
              <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">
                {level.xp_next ? `${level.xp_next} XP` : '—'}
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono italic mb-2">{t('noLevel')}</p>
            <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full" />
          </>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// AchievementShowcase
// ---------------------------------------------------------------------------

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
        <p className="text-[11px] font-bold font-mono uppercase tracking-wider text-gray-400 dark:text-slate-500">
          {t('achievements')}
        </p>
        <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">
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
                <p className="text-[10px] font-bold text-center leading-tight text-gray-700 dark:text-slate-200 line-clamp-2 w-full flex-1">
                  {def.name}
                </p>
                <span className="mt-auto text-[7px] font-bold uppercase font-mono px-1.5 py-0.5 rounded-full leading-none"
                  style={{ backgroundColor: `${borderColor}20`, color: borderColor }}>
                  {def.rarity}
                </span>
                {earned ? (
                  <p className="text-[8px] font-mono text-brand-primary leading-none mt-1">
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
        <div className="mt-3 p-3.5 rounded-xl border animate-in fade-in duration-200"
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
                <p className="text-[13px] font-bold text-brand-dark dark:text-white">
                  {selectedDef.name}
                </p>
                <span className="text-[8px] font-bold uppercase font-mono px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${RARITY_COLORS[selectedDef.rarity] || '#9ca3af'}25`,
                    color: RARITY_COLORS[selectedDef.rarity] || '#9ca3af',
                  }}>
                  {selectedDef.rarity}
                </span>
              </div>
              <p className="text-[12px] text-gray-500 dark:text-slate-400 leading-relaxed">
                {selectedDef.description}
              </p>
              {selectedDef.earned_at ? (
                <p className="text-[10px] text-brand-primary font-mono mt-1.5 font-bold">
                  ✓ {t('earned')} {formatRelative(selectedDef.earned_at, t)}
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono mt-1.5">
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

// ---------------------------------------------------------------------------
// ActivityHeatmap
// ---------------------------------------------------------------------------

const ActivityHeatmap: React.FC<{ entries: HeatmapEntry[] }> = ({ entries }) => {
  const { t } = useLanguage();
  const [tooltip, setTooltip] = useState<number | null>(null);
  const grid = buildHeatmapGrid(entries);
  const firstDate = new Date(grid[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const lastDate  = new Date(grid[grid.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 shadow-sm">
      <p className="text-[11px] font-bold font-mono uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">
        {t('activityHeatmap')}
      </p>
      <div className="flex gap-1 flex-wrap">
        {grid.map((cell, i) => {
          const bg = heatmapColor(cell.count);
          return (
            <div key={cell.date} className="relative">
              <button
                className="w-6 h-6 rounded-md transition-transform hover:scale-110"
                onMouseEnter={() => setTooltip(i)}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => setTooltip(tooltip === i ? null : i)}
              >
                <div
                  className={`w-full h-full rounded-md ${bg ? '' : 'bg-gray-100 dark:bg-slate-800'}`}
                  style={bg ? { backgroundColor: bg } : undefined}
                />
              </button>
              {tooltip === i && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 whitespace-nowrap bg-slate-900 dark:bg-slate-950 text-white text-[10px] font-mono rounded-lg px-2.5 py-1.5 shadow-lg border border-slate-700 pointer-events-none">
                  {cell.count > 0 ? t('heatmapActivities').replace('{count}', String(cell.count)) : t('heatmapNoActivity')}
                  <div className="text-slate-400">{cell.date}</div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-slate-900 dark:border-t-slate-950" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[9px] font-mono text-gray-300 dark:text-slate-600">{firstDate}</span>
        <span className="text-[9px] font-mono text-gray-300 dark:text-slate-600">{lastDate}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ActivityFeed
// ---------------------------------------------------------------------------

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
        <p className="text-[12px] text-gray-400 dark:text-slate-500 font-mono leading-relaxed">{t('noActivity')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-50 dark:border-slate-800/70">
        <p className="text-[11px] font-bold font-mono uppercase tracking-wider text-gray-400 dark:text-slate-500">
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
              <p className="text-[13px] font-medium text-brand-dark dark:text-white truncate">{entry.reason}</p>
              <p className="text-[10px] font-mono text-gray-400 dark:text-slate-500">{formatRelative(entry.datetime, t)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-[12px] font-bold font-mono tabular-nums ${entry.negative ? 'text-red-500' : 'text-emerald-500'}`}>
                {entry.negative ? '-' : '+'}{entry.xp} XP
              </p>
              {entry.coins !== 0 && (
                <p className={`text-[10px] font-mono tabular-nums ${entry.negative ? 'text-red-400' : 'text-amber-500'}`}>
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
            className="w-full h-9 rounded-xl bg-gray-50 dark:bg-slate-800 text-[11px] font-bold font-mono uppercase tracking-wider text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
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

// ---------------------------------------------------------------------------
// ProfileEdit sub-view
// ---------------------------------------------------------------------------

const ProfileEdit: React.FC<{
  profile: ProfileData;
  enrollmentId: number | null;
  onSave: (bio: string, avatar?: File) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}> = ({ profile, enrollmentId, onSave, onBack, saving }) => {
  const { t } = useLanguage();
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(profile.avatar ? `${baseUrl}${profile.avatar}` : null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const id = enrollmentId ?? 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setFileError(t('avatarTooBig')); return; }
    setFileError(null);
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 hover:text-brand-primary transition-colors text-[12px] font-bold font-mono uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        <h2 className="text-lg font-bold text-brand-dark dark:text-white">{t('editProfile')}</h2>
      </div>

      <form onSubmit={async e => { e.preventDefault(); await onSave(bio, avatar ?? undefined); }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            {preview ? (
              <img src={preview} alt="avatar" className="w-24 h-24 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-slate-700" />
            ) : (
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ring-2 ring-gray-100 dark:ring-slate-700"
                style={{ backgroundColor: getAvatarBg(id) }}>
                {getInitials(profile.full_name)}
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="text-[12px] text-brand-primary font-bold font-mono uppercase tracking-wide hover:text-brand-primary/80 transition-colors">
            {t('uploadPhoto')}
          </button>
          {fileError && (
            <div className="flex items-center gap-1.5 text-red-500 text-[11px] font-mono">
              <AlertCircle className="w-3.5 h-3.5" />{fileError}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-[11px] font-bold font-mono uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">{t('bio')}</label>
          <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 280))} placeholder={t('bioPlaceholder')} rows={4}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] text-brand-dark dark:text-white placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary resize-none font-sans transition-all" />
          <p className="text-right text-[10px] font-mono text-gray-300 dark:text-slate-600 mt-1">{bio.length} / 280</p>
        </div>

        <button type="submit" disabled={saving}
          className="w-full h-12 rounded-xl bg-brand-primary text-white font-bold text-[13px] uppercase tracking-wider font-mono hover:bg-brand-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20">
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {t('saveChanges')}
        </button>
      </form>
    </div>
  );
};

// ---------------------------------------------------------------------------
// PrivacySettings sub-view
// ---------------------------------------------------------------------------

const PrivacySettings: React.FC<{
  profile: ProfileData;
  onToggle: (field: 'hide_balance' | 'hide_activity', value: boolean) => Promise<void>;
  onBack: () => void;
}> = ({ profile, onToggle, onBack }) => {
  const { t } = useLanguage();
  const [pending, setPending] = useState<string | null>(null);
  const [localPrivacy, setLocalPrivacy] = useState(profile.privacy);

  const handleToggle = async (field: 'hide_balance' | 'hide_activity') => {
    const newVal = !localPrivacy[field];
    const prev = localPrivacy[field];
    setPending(field);
    setLocalPrivacy(p => ({ ...p, [field]: newVal }));
    try {
      await onToggle(field, newVal);
    } catch {
      setLocalPrivacy(p => ({ ...p, [field]: prev }));
    } finally {
      setPending(null);
    }
  };

  const ToggleRow: React.FC<{ field: 'hide_balance' | 'hide_activity'; label: string; desc: string }> = ({ field, label, desc }) => {
    const checked = localPrivacy[field];
    return (
      <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-50 dark:border-slate-800/70 last:border-0">
        <div className="flex-1">
          <p className="text-[14px] font-medium text-brand-dark dark:text-white">{label}</p>
          <p className="text-[12px] text-gray-400 dark:text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
        </div>
        <button onClick={() => handleToggle(field)} disabled={pending !== null}
          className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 mt-0.5 disabled:opacity-60 ${checked ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-slate-700'}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 hover:text-brand-primary transition-colors text-[12px] font-bold font-mono uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        <h2 className="text-lg font-bold text-brand-dark dark:text-white">{t('privacySettings')}</h2>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm px-5">
        <ToggleRow field="hide_balance" label={t('hideBalance')} desc={t('hideBalanceDesc')} />
        <ToggleRow field="hide_activity" label={t('hideActivity')} desc={t('hideActivityDesc')} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Profile page
// ---------------------------------------------------------------------------

const Profile: React.FC = () => {
  const { profileEnrollmentId } = useNavigation();
  const { t } = useLanguage();
  const [subView, setSubView] = useState<'view' | 'edit' | 'settings'>('view');

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [hasMoreActivity, setHasMoreActivity] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<'notFound' | 'general' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = profileEnrollmentId
        ? await apiService.getProfileView(profileEnrollmentId)
        : await apiService.getProfile();
      setProfile(res.data);

      const showActivity = res.data.is_own_profile || !res.data.privacy.hide_activity;
      if (showActivity) {
        const [heatRes, actRes] = await Promise.all([
          apiService.getProfileHeatmap(profileEnrollmentId ?? null),
          apiService.getProfileActivity(1, profileEnrollmentId ?? null),
        ]);
        setHeatmap(heatRes.data);
        setActivity(actRes.data.entries);
        setActivityPage(1);
        setHasMoreActivity(actRes.data.has_next);
      }
    } catch (err: any) {
      setError(err.status === 404 ? 'notFound' : 'general');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    setSubView('view');
  }, [profileEnrollmentId]);

  const handleLoadMore = async () => {
    if (!profile) return;
    setLoadingMore(true);
    try {
      const res = await apiService.getProfileActivity(activityPage + 1, profileEnrollmentId ?? null);
      setActivity(prev => [...prev, ...res.data.entries]);
      setActivityPage(activityPage + 1);
      setHasMoreActivity(res.data.has_next);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSaveProfile = async (bio: string, avatar?: File) => {
    setSaving(true);
    try {
      const res = await apiService.updateProfile(bio, avatar);
      setProfile(res.data);
      setSubView('view');
      showToast(t('profileUpdated'));
    } catch (err: any) {
      showToast(err?.data?.message ?? err?.message ?? 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePrivacy = async (field: 'hide_balance' | 'hide_activity', value: boolean) => {
    await apiService.updatePrivacy({ [field]: value });
    setProfile(prev => prev ? { ...prev, privacy: { ...prev.privacy, [field]: value } } : prev);
    showToast(t('settingsSaved'));
  };

  if (loading) {
    return <LoadingScreen message={t('loading')} />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-gray-400 dark:text-slate-500" />
        </div>
        <div>
          <p className="text-base font-bold text-brand-dark dark:text-white">
            {error === 'notFound' ? t('studentNotFound') : t('somethingWentWrong')}
          </p>
          <p className="text-[12px] text-gray-400 dark:text-slate-500 font-mono mt-1">
            {error === 'notFound' ? t('studentNotFoundDesc') : t('somethingWentWrongDesc')}
          </p>
        </div>
        <button onClick={loadProfile}
          className="px-4 h-9 rounded-xl bg-brand-primary/10 text-brand-primary text-[11px] font-bold font-mono uppercase tracking-wide hover:bg-brand-primary/20 transition-colors">
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  const showActivity = profile.is_own_profile || !profile.privacy.hide_activity;

  return (
    <div className="space-y-4 pb-10 animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {subView === 'edit' && (
        <ProfileEdit profile={profile} enrollmentId={profileEnrollmentId}
          onSave={handleSaveProfile} onBack={() => setSubView('view')} saving={saving} />
      )}

      {subView === 'settings' && (
        <PrivacySettings profile={profile} onToggle={handleTogglePrivacy} onBack={() => setSubView('view')} />
      )}

      {subView === 'view' && (
        <>
          <ProfileHero profile={profile} enrollmentId={profileEnrollmentId}
            onEdit={() => setSubView('edit')} onSettings={() => setSubView('settings')} />
          <AchievementShowcase achievements={profile.achievements} />
          {showActivity && (
            <>
              <ActivityHeatmap entries={heatmap} />
              <ActivityFeed entries={activity} hasMore={hasMoreActivity}
                onLoadMore={handleLoadMore} loadingMore={loadingMore} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
