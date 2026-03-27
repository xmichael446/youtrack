import React, { useState } from 'react';
import { Trophy, Star, Minus, Crown, Flame, Users, Globe, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LoadingScreen from '../components/LoadingScreen';
import { useLeaderboard, LeaderboardProvider } from '../context/LeaderboardContext';
import { useDashboard } from '../context/DashboardContext';
import { useNavigation } from '../context/NavigationContext';

const LeaderboardContent: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'group' | 'course'>('group');
  const { groupLeaderboard, courseLeaderboard, enrollment, loading } = useLeaderboard();
  const { user } = useDashboard();
  const { navigateToProfile } = useNavigation();

  React.useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  }, []);

  if (loading && groupLeaderboard.length === 0) {
    return <LoadingScreen message={t('fetchingRankings')} />;
  }

  const activeLeaderboard = activeTab === 'group' ? groupLeaderboard : courseLeaderboard;

  const currentRank = enrollment ? (activeTab === 'group' ? enrollment.group_rank : enrollment.rank) : null;
  const lastRank = enrollment ? (activeTab === 'group' ? enrollment.last_group_rank : enrollment.rank) : null;

  const renderRankChangeInline = (rank: number, lastRankVal: number) => {
    if (rank < lastRankVal) {
      return (
        <div className="flex items-center gap-0.5 text-emerald-500">
          <ArrowUp className="w-2.5 h-2.5" />
          <span className="text-xs font-medium tabular-nums">{lastRankVal - rank}</span>
        </div>
      );
    } else if (rank > lastRankVal) {
      return (
        <div className="flex items-center gap-0.5 text-red-500">
          <ArrowDown className="w-2.5 h-2.5" />
          <span className="text-xs font-medium tabular-nums">{rank - lastRankVal}</span>
        </div>
      );
    } else {
      return <Minus className="w-2.5 h-2.5 text-surface-secondary dark:text-surface-dark-elevated" />;
    }
  };


  const getRankBadge = (rank: number, lastRank?: number) => {
    const change = lastRank !== undefined ? renderRankChangeInline(rank, lastRank) : null;
    const badge = (() => {
      if (rank === 1) return (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40 ring-2 ring-amber-400/30">
          <Crown className="w-5 h-5 text-amber-900 fill-amber-900" />
        </div>
      );
      if (rank === 2) return (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 flex items-center justify-center shadow-md shadow-slate-400/30 ring-2 ring-slate-300/30">
          <span className="text-body tabular-nums text-slate-700 dark:text-text-theme-dark-primary">2</span>
        </div>
      );
      if (rank === 3) return (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-md shadow-orange-400/30 ring-2 ring-orange-400/30">
          <span className="text-sm font-bold tabular-nums text-orange-900">3</span>
        </div>
      );
      return (
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="text-body text-surface-secondary dark:text-surface-dark-elevated tabular-nums">#{rank.toString().padStart(2, '0')}</span>
        </div>
      );
    })();
    return (
      <div className="flex items-center gap-2">
        {badge}
        {change}
      </div>
    );
  };

  const getPodiumRowClasses = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-brand-primary/5 dark:bg-brand-primary/8';
    }
    if (rank === 1) return 'bg-amber-50/50 dark:bg-amber-500/5';
    if (rank === 2) return 'bg-surface-secondary/50 dark:bg-surface-dark-elevated/5';
    if (rank === 3) return 'bg-orange-50/50 dark:bg-orange-500/5';
    return 'hover:bg-surface-secondary/60 dark:hover:bg-surface-dark-elevated/30';
  };

  const getPodiumBorderColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-brand-primary';
    if (rank === 1) return 'bg-amber-400';
    if (rank === 2) return 'bg-slate-400'; // intentional metallic silver accent
    if (rank === 3) return 'bg-orange-400';
    return '';
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-10">

      {/* Header */}
      <div className="px-1">
        <h1 className="text-h1 tracking-tight text-brand-dark dark:text-text-theme-dark-primary flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400 fill-amber-400/20 shrink-0" />
          {t('leaderboard')}
        </h1>
        <p className="text-body text-text-theme-secondary dark:text-text-theme-dark-secondary mt-1">
          {t('topN', { count: activeLeaderboard.length > 0 ? activeLeaderboard.length : 20 })} &middot; {t('attendToEarnSpot')}
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="max-w-sm mx-auto w-full">
        <div role="tablist" aria-label={t('leaderboard')} className="bg-surface-secondary dark:bg-surface-dark-elevated/80 p-1 rounded-2xl flex border border-surface-secondary/50 dark:border-surface-dark-elevated/50 shadow-inner">
          <button
            role="tab"
            aria-selected={activeTab === 'group'}
            aria-controls="leaderboard-panel"
            onClick={() => setActiveTab('group')}
            className={`flex-1 h-12 rounded-xl text-body transition-all duration-300 flex items-center justify-center gap-2
              ${activeTab === 'group'
                ? 'bg-surface-primary dark:bg-surface-dark-elevated text-brand-primary shadow-md shadow-black/5 dark:shadow-black/20'
                : 'text-text-theme-secondary dark:text-text-theme-dark-secondary hover:text-text-theme-primary dark:hover:text-text-theme-dark-primary'}`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            {t('groupRank')}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'course'}
            aria-controls="leaderboard-panel"
            onClick={() => setActiveTab('course')}
            className={`flex-1 h-12 rounded-xl text-body transition-all duration-300 flex items-center justify-center gap-2
              ${activeTab === 'course'
                ? 'bg-surface-primary dark:bg-surface-dark-elevated text-brand-primary shadow-md shadow-black/5 dark:shadow-black/20'
                : 'text-text-theme-secondary dark:text-text-theme-dark-secondary hover:text-text-theme-primary dark:hover:text-text-theme-dark-primary'}`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            {t('courseRank')}
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div id="leaderboard-panel" role="tabpanel" aria-label={activeTab === 'group' ? t('groupRank') : t('courseRank')} className="bg-surface-primary dark:bg-surface-dark-secondary rounded-3xl border border-surface-secondary dark:border-surface-dark-elevated shadow-card dark:shadow-card-dark overflow-hidden">

        {/* Desktop Table Header */}
        <div className="hidden sm:grid px-6 py-3 border-b border-surface-secondary dark:border-surface-dark-elevated/70 bg-surface-secondary/80 dark:bg-surface-dark-elevated/40"
          style={{ gridTemplateColumns: '7rem 1fr auto' }}
        >
          <div className="section-label">{t('rank')}</div>
          <div className="ml-3 section-label">{t('student')}</div>
          <div className="text-right section-label">{t('points')}</div>
        </div>

        <div className="divide-y divide-surface-secondary dark:divide-surface-dark-elevated/50">
          {activeLeaderboard.map((entry, i) => {
            const isCurrentUser = activeTab === 'group'
              ? entry.full_name === user.name
              : entry.id === user.id;

            const showAccentBorder = isCurrentUser || entry.rank <= 3;
            const borderColor = getPodiumBorderColor(entry.rank, isCurrentUser);

            const handleActivate = () =>
              isCurrentUser ? navigateToProfile(null) : (entry.id && navigateToProfile(entry.id));

            return (
              <div
                key={entry.id || i}
                role="button"
                tabIndex={0}
                aria-label={`${entry.full_name}${isCurrentUser ? ` (${t('youLabel')})` : ''}, ${t('rank')} ${entry.rank}, ${entry.total_points.toLocaleString()} ${t('points')}`}
                onClick={handleActivate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleActivate();
                  }
                }}
                className={`group relative transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary
                  ${getPodiumRowClasses(entry.rank, isCurrentUser)}
                  ${entry.rank <= 3 ? 'sm:py-1' : ''}
                `}
              >
                {/* Left accent border */}
                {showAccentBorder && (
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full ${borderColor}`} />
                )}

                {/* Desktop layout */}
                <div
                  className="hidden sm:grid items-center px-6 py-2"
                  style={{ gridTemplateColumns: '7rem 1fr auto' }}
                >
                  {/* Rank + inline change */}
                  <div className="flex items-center justify-start shrink-0">
                    {getRankBadge(entry.rank, entry.last_rank)}
                  </div>

                  {/* Student Info */}
                  <div className="min-w-0 ml-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-body text-brand-dark dark:text-text-theme-dark-primary truncate leading-tight">
                        {entry.full_name}
                      </p>
                      {isCurrentUser && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25 shrink-0">
                          {t('youLabel')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Points + Streak unified */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-h4 text-brand-dark dark:text-text-theme-dark-primary tabular-nums">
                        {entry.total_points.toLocaleString()}
                      </span>
                      <Star className="w-3.5 h-3.5 text-brand-primary fill-brand-primary shrink-0" />
                    </div>
                    {entry.streak > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 dark:text-amber-400">
                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {entry.streak}
                      </span>
                    ) : (
                      <span className="text-caption text-surface-secondary dark:text-surface-dark-elevated">—</span>
                    )}
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="flex sm:hidden items-center px-4 py-3">
                  {/* Rank + inline change */}
                  <div className="w-12 flex items-center justify-center shrink-0">
                    {getRankBadge(entry.rank, entry.last_rank)}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0 px-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-body text-brand-dark dark:text-text-theme-dark-primary truncate leading-tight">
                        {entry.full_name}
                      </p>
                      {isCurrentUser && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25 shrink-0">
                          {t('youLabel')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Points + Streak unified */}
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-body text-brand-dark dark:text-text-theme-dark-primary tabular-nums">
                        {entry.total_points.toLocaleString()}
                      </span>
                      <Star className="w-3 h-3 text-brand-primary fill-brand-primary shrink-0" />
                    </div>
                    {entry.streak > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-500 dark:text-amber-400">
                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {entry.streak}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {activeLeaderboard.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Trophy className="w-10 h-10 text-surface-secondary dark:text-surface-dark-elevated mb-2" />
              <p className="text-body text-text-theme-muted dark:text-text-theme-dark-muted">{t('noRankings')}</p>
              <p className="text-caption text-surface-secondary dark:text-surface-dark-elevated">{t('attendToEarnSpot')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Leaderboard: React.FC = () => {
    const { user } = useDashboard();
    return (
        <LeaderboardProvider accessCode={user?.accessCode} enrollmentId={user?.id}>
            <LeaderboardContent />
        </LeaderboardProvider>
    );
};

export default Leaderboard;
