import React, { useState } from 'react';
import { Trophy, Star, TrendingUp, TrendingDown, Minus, Crown, Flame, Users, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLeaderboard } from '../context/LeaderboardContext';
import { useDashboard } from '../context/DashboardContext';

const Leaderboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'group' | 'course'>('group');
  const { groupLeaderboard, courseLeaderboard, enrollment, loading } = useLeaderboard();
  const { user } = useDashboard();

  React.useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  }, []);

  if (loading || !user.id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm px-12 py-10 flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-[3px] border-brand-primary/10 rounded-full" />
            <div className="absolute inset-0 border-[3px] border-transparent border-t-brand-primary rounded-full animate-spin" />
            <div className="absolute inset-2 rounded-full bg-brand-primary/5 animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[11px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
              {t('loading')}
            </p>
            <p className="text-[10px] text-gray-300 dark:text-slate-600 font-mono">Fetching rankings…</p>
          </div>
        </div>
      </div>
    );
  }

  const activeLeaderboard = activeTab === 'group' ? groupLeaderboard : courseLeaderboard;

  const currentRank = enrollment ? (activeTab === 'group' ? enrollment.group_rank : enrollment.rank) : null;
  const lastRank = enrollment ? (activeTab === 'group' ? enrollment.last_group_rank : enrollment.rank) : null;

  const renderRankChange = (rank: number, lastRankVal: number) => {
    if (rank < lastRankVal) {
      return (
        <div className="flex items-center text-emerald-500 gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold font-mono">+{lastRankVal - rank}</span>
        </div>
      );
    } else if (rank > lastRankVal) {
      return (
        <div className="flex items-center text-red-500 gap-1">
          <TrendingDown className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold font-mono">-{rank - lastRankVal}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-300 dark:text-slate-600">
          <Minus className="w-3.5 h-3.5" />
        </div>
      );
    }
  };


  const getRankBadge = (rank: number) => {
    if (rank === 1) return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/40 ring-2 ring-amber-400/30">
        <Crown className="w-5 h-5 text-amber-900 fill-amber-900" />
      </div>
    );
    if (rank === 2) return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 flex items-center justify-center shadow-md shadow-slate-400/30 ring-2 ring-slate-300/30">
        <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">2</span>
      </div>
    );
    if (rank === 3) return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-md shadow-orange-400/30 ring-2 ring-orange-400/30">
        <span className="text-sm font-bold font-mono text-orange-900">3</span>
      </div>
    );
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <span className="text-[13px] font-bold text-gray-300 dark:text-slate-700 tabular-nums font-mono">#{rank.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  const getPodiumRowClasses = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-brand-primary/5 dark:bg-brand-primary/8';
    }
    if (rank === 1) return 'bg-amber-50/50 dark:bg-amber-500/5';
    if (rank === 2) return 'bg-slate-50/50 dark:bg-slate-700/5';
    if (rank === 3) return 'bg-orange-50/50 dark:bg-orange-500/5';
    return 'hover:bg-gray-50/60 dark:hover:bg-slate-800/30';
  };

  const getPodiumBorderColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-brand-primary';
    if (rank === 1) return 'bg-amber-400';
    if (rank === 2) return 'bg-slate-400';
    if (rank === 3) return 'bg-orange-400';
    return '';
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* Header */}
      <div className="flex items-start gap-4 px-1">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/30 shrink-0 ring-2 ring-amber-400/20">
          <Trophy className="w-7 h-7 md:w-8 md:h-8 text-white fill-white/80" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-[800] tracking-tight text-brand-dark dark:text-white">
            {t('leaderboard')}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-0.5">
            Top {activeLeaderboard.length > 0 ? activeLeaderboard.length : 20} &middot; {t('competePeers').split(',')[0]}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="max-w-sm mx-auto w-full">
        <div className="bg-gray-100 dark:bg-slate-800/80 p-1 rounded-2xl flex border border-gray-200/50 dark:border-slate-700/50 shadow-inner">
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 h-12 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 font-mono flex items-center justify-center gap-2
              ${activeTab === 'group'
                ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-md shadow-black/5 dark:shadow-black/20'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            {t('groupRank')}
          </button>
          <button
            onClick={() => setActiveTab('course')}
            className={`flex-1 h-12 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 font-mono flex items-center justify-center gap-2
              ${activeTab === 'course'
                ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-md shadow-black/5 dark:shadow-black/20'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            {t('courseRank')}
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">

        {/* Desktop Table Header */}
        <div className="hidden sm:grid px-6 py-3 border-b border-gray-100 dark:border-slate-800/70 bg-gray-50/80 dark:bg-slate-800/40"
          style={{ gridTemplateColumns: '3.5rem 1fr 6rem 5rem 7rem 5rem' }}
        >
          <div className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{t('rank')}</div>
          <div className="ml-5 text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{t('student')}</div>
          <div className="text-center text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{t('level')}</div>
          <div className="text-center text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{t('streak')}</span>
          </div>
          <div className="text-right text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{t('points')}</div>
          <div className="text-center text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{t('change')}</div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
          {activeLeaderboard.map((entry, i) => {
            const isCurrentUser = activeTab === 'group'
              ? entry.full_name === user.name
              : entry.id === user.id;

            const showAccentBorder = isCurrentUser || entry.rank <= 3;
            const borderColor = getPodiumBorderColor(entry.rank, isCurrentUser);

            return (
              <div
                key={entry.id || i}
                className={`group relative transition-all duration-200
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
                  className="hidden sm:grid items-center px-6 py-2.5"
                  style={{ gridTemplateColumns: '3.5rem 1fr 6rem 5rem 7rem 5rem' }}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-start shrink-0">
                    {getRankBadge(entry.rank)}
                  </div>

                  {/* Student Info */}
                  <div className="min-w-0 ml-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-bold text-brand-dark dark:text-white truncate leading-tight">
                        {entry.full_name}
                      </p>
                      {isCurrentUser && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25 shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Level column */}
                  <div className="flex items-center justify-center">
                    {entry.level ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                        style={{
                          backgroundColor: `${entry.level.badge_color || '#6366f1'}18`,
                          color: entry.level.badge_color || '#6366f1',
                          border: `1px solid ${entry.level.badge_color || '#6366f1'}30`,
                        }}
                      >
                        <span>{entry.level.icon}</span>
                        <span>Lvl&nbsp;{entry.level.number}</span>
                      </span>
                    ) : (
                      <Minus className="w-3 h-3 text-gray-200 dark:text-slate-700" />
                    )}
                  </div>

                  {/* Streak column */}
                  <div className="flex items-center justify-center">
                    {entry.streak > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                        🔥 {entry.streak}
                      </span>
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-gray-200 dark:text-slate-700" />
                    )}
                  </div>

                  {/* Points */}
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-lg font-bold text-brand-dark dark:text-white tabular-nums tracking-tight font-mono">
                      {entry.total_points.toLocaleString()}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <Star className="w-3 h-3 text-brand-primary fill-brand-primary" />
                    </div>
                  </div>

                  {/* Change */}
                  <div className="flex items-center justify-center">
                    {renderRankChange(entry.rank, entry.last_rank)}
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="flex sm:hidden items-center px-4 py-3">
                  {/* Rank */}
                  <div className="w-12 flex items-center justify-center shrink-0">
                    {getRankBadge(entry.rank)}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0 px-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-brand-dark dark:text-white truncate leading-tight">
                        {entry.full_name}
                      </p>
                      {isCurrentUser && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25 shrink-0">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {entry.level && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono"
                          style={{
                            backgroundColor: `${entry.level.badge_color || '#6366f1'}18`,
                            color: entry.level.badge_color || '#6366f1',
                            border: `1px solid ${entry.level.badge_color || '#6366f1'}30`,
                          }}
                        >
                          <span>{entry.level.icon}</span>
                          <span>Lvl {entry.level.number} &middot; {entry.level.name}</span>
                        </span>
                      )}
                      {entry.streak > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                          🔥 {entry.streak} days
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Points + Change stacked */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-brand-dark dark:text-white tabular-nums tracking-tight font-mono">
                        {entry.total_points.toLocaleString()}
                      </span>
                      <div className="w-5 h-5 rounded-md bg-brand-primary/10 flex items-center justify-center">
                        <Star className="w-3 h-3 text-brand-primary fill-brand-primary" />
                      </div>
                    </div>
                    {renderRankChange(entry.rank, entry.last_rank)}
                  </div>
                </div>
              </div>
            );
          })}

          {activeLeaderboard.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-gray-300 dark:text-slate-600" />
              </div>
              <p className="text-sm font-bold text-gray-400 dark:text-slate-500">No rankings yet</p>
              <p className="text-[11px] text-gray-300 dark:text-slate-600 font-mono">Attend lessons to earn your spot</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
