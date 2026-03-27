import React, { useState } from 'react';
import { Trophy, Star, Minus, Crown, Flame, Users, Globe, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LoadingScreen from '../components/LoadingScreen';
import { useLeaderboard, LeaderboardProvider } from '../context/LeaderboardContext';
import { useDashboard } from '../context/DashboardContext';
import { useNavigation } from '../context/NavigationContext';
import { Card, Button, Badge, EmptyState } from '../components/ui';

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
      return <Minus className="w-2.5 h-2.5 text-text-theme-muted dark:text-text-theme-dark-muted" />;
    }
  };


  const getRankBadge = (rank: number, lastRank?: number) => {
    const change = lastRank !== undefined ? renderRankChangeInline(rank, lastRank) : null;
    const badge = (() => {
      if (rank === 1) return (
        <div className="w-10 h-10 rounded-card bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40 ring-2 ring-amber-400/30">
          <Crown className="w-5 h-5 text-amber-900 fill-amber-900" />
        </div>
      );
      if (rank === 2) return (
        <div className="w-10 h-10 rounded-card bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 flex items-center justify-center shadow-md shadow-slate-400/30 ring-2 ring-slate-300/30">
          <span className="text-body tabular-nums text-slate-700 dark:text-text-theme-dark-primary">2</span>
        </div>
      );
      if (rank === 3) return (
        <div className="w-10 h-10 rounded-card bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-md shadow-orange-400/30 ring-2 ring-orange-400/30">
          <span className="text-sm font-bold tabular-nums text-orange-900">3</span>
        </div>
      );
      return (
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="text-body text-text-theme-muted dark:text-text-theme-dark-muted tabular-nums">#{rank.toString().padStart(2, '0')}</span>
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

  const topThree = activeLeaderboard.slice(0, 3);
  const restOfLeaderboard = activeLeaderboard.slice(3);

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
        <div
          role="tablist"
          aria-label={t('leaderboard')}
          className="bg-surface-secondary dark:bg-surface-dark-elevated/80 p-1 rounded-card flex border border-surface-secondary/50 dark:border-surface-dark-elevated/50 shadow-inner gap-1"
        >
          <Button
            role="tab"
            aria-selected={activeTab === 'group'}
            aria-controls="leaderboard-panel"
            variant={activeTab === 'group' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Users className="w-3.5 h-3.5" />}
            onClick={() => setActiveTab('group')}
            className="flex-1 h-10 rounded-input"
          >
            {t('groupRank')}
          </Button>
          <Button
            role="tab"
            aria-selected={activeTab === 'course'}
            aria-controls="leaderboard-panel"
            variant={activeTab === 'course' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Globe className="w-3.5 h-3.5" />}
            onClick={() => setActiveTab('course')}
            className="flex-1 h-10 rounded-input"
          >
            {t('courseRank')}
          </Button>
        </div>
      </div>

      {/* Current User Rank Banner */}
      {currentRank && lastRank && (
        <Card variant="bordered" padding="sm" className="border-brand-primary/20 bg-brand-primary/5 dark:bg-brand-primary/8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-input bg-brand-primary/10 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-brand-primary" />
              </div>
              <div>
                <p className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary uppercase tracking-wider">{t('yourRank') || 'Your Rank'}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="brand" size="md">#{currentRank}</Badge>
                  {renderRankChangeInline(currentRank, lastRank)}
                </div>
              </div>
            </div>
            {enrollment && (
              <div className="text-right">
                <p className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary">{t('points')}</p>
                <div className="flex items-center gap-1">
                  <span className="text-h4 text-brand-dark dark:text-text-theme-dark-primary tabular-nums">
                    {enrollment.total_points?.toLocaleString() || '—'}
                  </span>
                  <Star className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {activeLeaderboard.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={<Trophy className="w-6 h-6" />}
            message={t('noRankings')}
          />
        </Card>
      ) : (
        <>
          {/* Top-3 Podium */}
          {topThree.length >= 2 && (
            <div className="flex items-end gap-2 md:gap-3 mb-2">
              {/* 2nd place (left) */}
              {topThree[1] && (() => {
                const entry = topThree[1];
                const isCurrentUser = activeTab === 'group' ? entry.full_name === user.name : entry.id === user.id;
                return (
                  <Card
                    hoverable
                    padding="md"
                    className="flex-1 min-w-0 flex flex-col items-center gap-1.5 border-t-4 border-slate-400 cursor-pointer"
                    onClick={() => isCurrentUser ? navigateToProfile(null) : (entry.id && navigateToProfile(entry.id))}
                  >
                    <div className="w-9 h-9 rounded-card bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 flex items-center justify-center shadow-md shadow-slate-400/30 ring-2 ring-slate-300/30">
                      <span className="text-caption font-bold tabular-nums text-slate-700 dark:text-white">2</span>
                    </div>
                    <p className="text-caption text-brand-dark dark:text-text-theme-dark-primary text-center w-full leading-tight line-clamp-2">
                      {entry.full_name}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-caption tabular-nums text-text-theme-secondary dark:text-text-theme-dark-secondary">
                        {entry.total_points.toLocaleString()}
                      </span>
                      <Star className="w-2.5 h-2.5 text-brand-primary fill-brand-primary shrink-0" />
                    </div>
                    {isCurrentUser && <Badge variant="brand" size="sm">{t('youLabel')}</Badge>}
                  </Card>
                );
              })()}

              {/* 1st place (center, taller) */}
              {topThree[0] && (() => {
                const entry = topThree[0];
                const isCurrentUser = activeTab === 'group' ? entry.full_name === user.name : entry.id === user.id;
                return (
                  <Card
                    hoverable
                    padding="md"
                    className="flex-1 min-w-0 flex flex-col items-center gap-1.5 border-t-4 border-amber-400 pb-4 cursor-pointer"
                    onClick={() => isCurrentUser ? navigateToProfile(null) : (entry.id && navigateToProfile(entry.id))}
                  >
                    <div className="w-10 h-10 rounded-card bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40 ring-2 ring-amber-400/30">
                      <Crown className="w-5 h-5 text-amber-900 fill-amber-900" />
                    </div>
                    <p className="text-body text-brand-dark dark:text-text-theme-dark-primary text-center w-full leading-tight line-clamp-2">
                      {entry.full_name}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-body tabular-nums text-brand-dark dark:text-text-theme-dark-primary">
                        {entry.total_points.toLocaleString()}
                      </span>
                      <Star className="w-3.5 h-3.5 text-brand-primary fill-brand-primary shrink-0" />
                    </div>
                    {entry.streak > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                        <Flame className="w-3 h-3 fill-amber-400" />{entry.streak}
                      </span>
                    )}
                    {isCurrentUser && <Badge variant="brand" size="sm">{t('youLabel')}</Badge>}
                  </Card>
                );
              })()}

              {/* 3rd place (right) */}
              {topThree[2] && (() => {
                const entry = topThree[2];
                const isCurrentUser = activeTab === 'group' ? entry.full_name === user.name : entry.id === user.id;
                return (
                  <Card
                    hoverable
                    padding="md"
                    className="flex-1 min-w-0 flex flex-col items-center gap-1.5 border-t-4 border-orange-400 cursor-pointer"
                    onClick={() => isCurrentUser ? navigateToProfile(null) : (entry.id && navigateToProfile(entry.id))}
                  >
                    <div className="w-9 h-9 rounded-card bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-md shadow-orange-400/30 ring-2 ring-orange-400/30">
                      <span className="text-caption font-bold tabular-nums text-orange-900">3</span>
                    </div>
                    <p className="text-caption text-brand-dark dark:text-text-theme-dark-primary text-center w-full leading-tight line-clamp-2">
                      {entry.full_name}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-caption tabular-nums text-text-theme-secondary dark:text-text-theme-dark-secondary">
                        {entry.total_points.toLocaleString()}
                      </span>
                      <Star className="w-2.5 h-2.5 text-brand-primary fill-brand-primary shrink-0" />
                    </div>
                    {isCurrentUser && <Badge variant="brand" size="sm">{t('youLabel')}</Badge>}
                  </Card>
                );
              })()}
            </div>
          )}

          {/* Rank List (4th place onwards, or all if less than 3 in podium) */}
          <Card
            id="leaderboard-panel"
            padding="none"
            role="tabpanel"
            aria-label={activeTab === 'group' ? t('groupRank') : t('courseRank')}
            className="overflow-hidden"
          >
            {/* Desktop Table Header */}
            <div className="hidden sm:grid px-6 py-3 border-b border-surface-secondary dark:border-surface-dark-elevated/70 bg-surface-secondary/80 dark:bg-surface-dark-elevated/40"
              style={{ gridTemplateColumns: '7rem 1fr auto' }}
            >
              <div className="section-label">{t('rank')}</div>
              <div className="ml-3 section-label">{t('student')}</div>
              <div className="text-right section-label">{t('points')}</div>
            </div>

            <div className="divide-y divide-surface-secondary dark:divide-surface-dark-elevated/50">
              {(topThree.length >= 3 ? restOfLeaderboard : activeLeaderboard).map((entry, i) => {
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
                    className={`group relative transition-all duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary
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
                            <Badge variant="brand" size="sm">{t('youLabel')}</Badge>
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
                          <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">—</span>
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
                            <Badge variant="brand" size="sm">{t('youLabel')}</Badge>
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
            </div>
          </Card>
        </>
      )}
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
