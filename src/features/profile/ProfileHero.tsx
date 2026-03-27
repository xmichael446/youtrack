import React from 'react';
import {
  ArrowLeft, Edit3, Settings, Flame, Coins, Zap, Trophy, Medal,
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import type { ProfileData } from '../../services/apiTypes';
import { getInitials, getAvatarBg } from './profileHelpers';
import { Card, Button, Badge } from '../../components/ui';

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
    <Card variant="default" padding="none" className="overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <button onClick={() => goBack('dashboard')}
          className="flex items-center gap-1 text-text-theme-secondary dark:text-text-theme-dark-secondary hover:text-brand-primary dark:hover:text-brand-primary transition-colors text-caption">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        {profile.is_own_profile && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettings}
              aria-label={t('settings')}
              icon={<Settings className="w-4 h-4" />}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
              icon={<Edit3 className="w-3.5 h-3.5" />}
            >
              {t('editProfile')}
            </Button>
          </div>
        )}
      </div>

      {/* Avatar + info */}
      <div className="px-4 pb-4 flex items-start gap-4">
        <div className="shrink-0 relative">
          {avatarUrl ? (
            <img src={avatarUrl} alt={profile.full_name}
              className="w-20 h-20 rounded-pill object-cover ring-2 ring-surface-secondary dark:ring-surface-dark-elevated" />
          ) : (
            <div className="w-20 h-20 rounded-pill flex items-center justify-center text-white text-h2 ring-2 ring-surface-secondary dark:ring-surface-dark-elevated"
              style={{ backgroundColor: getAvatarBg(id) }}>
              {getInitials(profile.full_name)}
            </div>
          )}
          {profile.rank > 0 && (
            <div className="absolute -top-2 -right-2">
              <Badge variant="brand" size="sm">#{profile.rank}</Badge>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-h2 text-brand-dark dark:text-text-theme-dark-primary tracking-tight leading-tight">
            {profile.full_name}
          </h2>
          <p className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary mt-0.5">
            {profile.group_name} &middot; {profile.course_name}
          </p>

          {/* Stats row: Streak, Coins, XP */}
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-input bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                <span className="text-caption font-bold text-amber-600 dark:text-amber-400 tabular-nums">{t('streakDays').replace('{count}', String(profile.streak))}</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-1 rounded-input bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 shadow-sm">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-caption font-bold text-amber-600 dark:text-amber-400 tabular-nums">{stats.balance ?? 0}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-input bg-brand-primary/10 border border-brand-primary/20 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-brand-primary fill-brand-primary/20" />
              <span className="text-caption font-bold text-brand-primary tabular-nums">{stats.total_points} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance & Assignments Info Row */}
      {hasAttendance && (
        <div className="px-4 pb-4 flex items-center gap-6 divide-x divide-surface-secondary dark:divide-surface-dark-elevated">
          <div className="flex flex-col">
            <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">{t('attendance')}</span>
            <span className="text-body font-bold text-brand-dark dark:text-text-theme-dark-primary tabular-nums">{Math.round(stats.attendance_pct!)}%</span>
          </div>
          <div className="flex flex-col pl-6">
            <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">{t('assignments')}</span>
            <span className="text-body font-bold text-brand-dark dark:text-text-theme-dark-primary tabular-nums">{Math.round(stats.assignment_pct ?? 0)}%</span>
          </div>
        </div>
      )}

      {/* Contest Badges */}
      {profile.contest_badges && profile.contest_badges.length > 0 && (
        <div className="px-4 pb-4 overflow-x-auto no-scrollbar flex gap-2">
          {profile.contest_badges.map(badge => {
            const isGold = badge.place === 1;
            const isSilver = badge.place === 2;
            const isBronze = badge.place === 3;
            return (
              <div key={badge.id}
                className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-input bg-surface-secondary/50 dark:bg-surface-dark-secondary/40 border border-surface-secondary/50 dark:border-surface-dark-elevated/50 transition-all hover:bg-surface-primary dark:hover:bg-surface-dark-secondary hover:shadow-sm">
                <div className={`shrink-0 w-7 h-7 rounded-button flex items-center justify-center shadow-sm
                  ${isGold ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' :
                    isSilver ? 'bg-surface-secondary dark:bg-surface-dark-elevated/50 text-text-theme-muted' :
                    isBronze ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-400' :
                    'bg-surface-secondary dark:bg-surface-dark-secondary text-text-theme-muted'}`}>
                  {isGold ? <Trophy className="w-4 h-4" /> : <Medal className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-caption text-brand-dark dark:text-text-theme-dark-primary leading-tight truncate max-w-[120px]">
                    {badge.reward_name}
                  </p>
                  <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">
                    #{badge.place} &middot; {badge.contest_name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bio */}
      <div className="px-4 pb-4">
        {profile.bio ? (
          <p className="text-body text-text-theme-secondary dark:text-text-theme-dark-secondary leading-relaxed">{profile.bio}</p>
        ) : profile.is_own_profile ? (
          <button onClick={onEdit}
            className="text-caption text-brand-primary/70 italic hover:text-brand-primary transition-colors">
            {t('bioPlaceholder')}
          </button>
        ) : (
          <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted italic">{t('noBioPeer')}</p>
        )}
      </div>

      {/* Level bar */}
      <div className="px-4 pb-4 border-t border-surface-secondary/70 dark:border-surface-dark-elevated/70 pt-4">
        {level ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-h4 leading-none">{level.icon}</span>
                <span className="text-body font-bold text-brand-dark dark:text-text-theme-dark-primary">
                  {t('level')} {level.number} &middot; {level.name}
                </span>
              </div>
              <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">
                {level.xp_next ? t('levelNextLabel').replace('{n}', String(level.number + 1)) : t('maxLevel')}
              </span>
            </div>
            <div className="h-2 bg-surface-secondary dark:bg-surface-dark-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${level.progress_percent}%`, backgroundColor: level.badge_color }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">{level.xp_current} XP</span>
              <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">
                {level.xp_next ? `${level.xp_next} XP` : '—'}
              </span>
            </div>
          </>
        ) : (
          <>
            <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted italic mb-2">{t('noLevel')}</p>
            <div className="h-2 bg-surface-secondary dark:bg-surface-dark-secondary rounded-full" />
          </>
        )}
      </div>
    </Card>
  );
};

export default ProfileHero;
