import React from 'react';
import {
  ArrowLeft, Edit3, Settings, Flame, Coins, Zap, Trophy, Medal,
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import type { ProfileData } from '../../services/apiTypes';
import { getInitials, getAvatarBg } from './profileHelpers';

const ProfileHero: React.FC<{
  profile: ProfileData;
  enrollmentId: number | null;
  onEdit: () => void;
  onSettings: () => void;
}> = ({ profile, enrollmentId, onEdit, onSettings }) => {
  const { t } = useLanguage();
  const { goBack } = useNavigation();
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const avatarUrl = profile.avatar ? `${baseUrl}${profile.avatar}` : null;
  const id = enrollmentId ?? 0;
  const { level, stats } = profile;
  const hasAttendance = 'attendance_pct' in stats;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <button onClick={() => goBack('dashboard')}
          className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors text-xs font-medium">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        {profile.is_own_profile && (
          <div className="flex items-center gap-2">
            <button onClick={onSettings} aria-label={t('settings')}
              className="min-w-[44px] min-h-[44px] rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={onEdit}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-brand-primary/10 text-brand-primary text-xs font-medium hover:bg-brand-primary/20 transition-colors">
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
            <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-lg bg-brand-primary text-white text-xs font-bold tabular-nums shadow-md">
              #{profile.rank}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-brand-dark dark:text-white tracking-tight leading-tight">
            {profile.full_name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
            {profile.group_name} &middot; {profile.course_name}
          </p>

          {/* Pills Row: Streak, Coins, XP */}
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.streak > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">{t('streakDays').replace('{count}', String(profile.streak))}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 shadow-sm">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">{stats.balance ?? 0}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-primary/10 border border-brand-primary/20 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/20" />
              <span className="text-xs font-bold text-brand-primary tabular-nums">{stats.total_points} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance & Assignments Info Row */}
      <div className="px-5 pb-4 flex items-center gap-6 divide-x divide-gray-100 dark:divide-slate-800">
        {hasAttendance && (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-400 dark:text-slate-500">{t('attendance')}</span>
            <span className="text-sm font-bold text-brand-dark dark:text-white tabular-nums">{Math.round(stats.attendance_pct!)}%</span>
          </div>
        )}
        {hasAttendance && (
          <div className="flex flex-col pl-6">
            <span className="text-xs font-medium text-gray-400 dark:text-slate-500">{t('assignments')}</span>
            <span className="text-sm font-bold text-brand-dark dark:text-white tabular-nums">{Math.round(stats.assignment_pct ?? 0)}%</span>
          </div>
        )}
      </div>

      {/* Contest Badges */}
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
                  <p className="text-xs font-medium text-brand-dark dark:text-white leading-tight truncate max-w-[120px]">
                    {badge.reward_name}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 font-normal">
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
          <p className="text-sm font-normal text-gray-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
        ) : profile.is_own_profile ? (
          <button onClick={onEdit}
            className="text-xs text-brand-primary/70 italic hover:text-brand-primary transition-colors">
            {t('bioPlaceholder')}
          </button>
        ) : (
          <p className="text-xs text-gray-400 dark:text-slate-500 italic">{t('noBioPeer')}</p>
        )}
      </div>

      {/* Level bar */}
      <div className="px-5 pb-5 border-t border-gray-50 dark:border-slate-800/70 pt-4">
        {level ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{level.icon}</span>
                <span className="text-sm font-bold text-brand-dark dark:text-white">
                  {t('level')} {level.number} &middot; {level.name}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {level.xp_next ? t('levelNextLabel').replace('{n}', String(level.number + 1)) : t('maxLevel')}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${level.progress_percent}%`, backgroundColor: level.badge_color }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-gray-400 dark:text-slate-500">{level.xp_current} XP</span>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {level.xp_next ? `${level.xp_next} XP` : '—'}
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-400 dark:text-slate-500 italic mb-2">{t('noLevel')}</p>
            <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full" />
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileHero;
