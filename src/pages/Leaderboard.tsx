import React, { useState } from 'react';
import { Trophy, Star, Zap, TrendingUp, TrendingDown, Minus, Crown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLeaderboard } from '../context/LeaderboardContext';
import { useDashboard } from '../context/DashboardContext';

const Leaderboard: React.FC = () => {
  const { t, language } = useLanguage();
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
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-[3px] border-brand-primary/10 rounded-full"></div>
            <div className="absolute inset-0 border-[3px] border-transparent border-t-brand-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const activeLeaderboard = activeTab === 'group' ? groupLeaderboard : courseLeaderboard;

  const renderRankChange = (rank: number, lastRank: number) => {
    if (rank < lastRank) {
      return (
        <div className="flex items-center text-emerald-500 gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold font-mono">+{lastRank - rank}</span>
        </div>
      );
    } else if (rank > lastRank) {
      return (
        <div className="flex items-center text-red-500 gap-1">
          <TrendingDown className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold font-mono">-{rank - lastRank}</span>
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
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/30">
        <Crown className="w-5 h-5 text-amber-900 fill-amber-900" />
      </div>
    );
    if (rank === 2) return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md ring-2 ring-slate-300/30">
        <span className="text-sm font-bold font-mono text-slate-700">2</span>
      </div>
    );
    if (rank === 3) return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-md ring-2 ring-orange-400/30">
        <span className="text-sm font-bold font-mono text-orange-900">3</span>
      </div>
    );
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <span className="text-[13px] font-bold text-gray-300 dark:text-slate-700 tabular-nums font-mono">#{rank.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* Header */}
      <div className="space-y-1 px-1">
        <h1 className="text-2xl md:text-3xl font-[800] tracking-tight text-brand-dark dark:text-white">
          {t('leaderboard')}
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
          {t('competePeers')}
        </p>
      </div>

      {/* My Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-5">
        {[
          {
            icon: Trophy,
            label: activeTab === 'group' ? t('groupRank') : t('yourRank'),
            value: enrollment ? `#${activeTab === 'group' ? enrollment.group_rank : enrollment.rank}` : '—',
            color: 'text-amber-500',
            bg: 'bg-amber-500/8 dark:bg-amber-500/10',
            glow: 'shadow-amber-500/10',
          },
          {
            icon: Star,
            label: t('weeklyPoints'),
            value: enrollment ? enrollment.week_points.toString() : '—',
            suffix: 'xp',
            color: 'text-brand-primary',
            bg: 'bg-brand-primary/8 dark:bg-brand-primary/10',
            glow: 'shadow-brand-primary/10',
          },
          {
            icon: Zap,
            label: t('totalXp'),
            value: enrollment ? enrollment.total_points.toString() : '—',
            suffix: 'xp',
            color: 'text-violet-500',
            bg: 'bg-violet-500/8 dark:bg-violet-500/10',
            glow: 'shadow-violet-500/10',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 px-3 py-5 md:px-6 md:py-7 flex flex-col items-center text-center`}
          >
            <div className={`w-10 h-10 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 font-mono">{stat.label}</p>
            <span className="text-xl md:text-3xl font-[800] text-brand-dark dark:text-white tabular-nums tracking-tighter leading-none">{stat.value}</span>
            {stat.suffix && (
              <span className="text-[9px] md:text-[10px] font-bold text-brand-primary font-mono uppercase tracking-wider mt-1">{stat.suffix}</span>
            )}
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="max-w-sm mx-auto w-full">
        <div className="bg-gray-100 dark:bg-slate-800/80 p-1 rounded-2xl flex border border-gray-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 h-11 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 font-mono
              ${activeTab === 'group'
                ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
          >
            {t('groupRank')}
          </button>
          <button
            onClick={() => setActiveTab('course')}
            className={`flex-1 h-11 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-300 font-mono
              ${activeTab === 'course'
                ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
          >
            {t('courseRank')}
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Header (Desktop) */}
        <div className="hidden sm:flex items-center px-6 py-4 border-b border-gray-50 dark:border-slate-800/70 bg-gray-50/50 dark:bg-slate-800/30">
          <div className="w-14 text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{t('rank')}</div>
          <div className="flex-1 ml-4 text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{t('student')}</div>
          <div className="w-28 text-right text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{t('points')}</div>
          <div className="w-20 text-center ml-4 text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{t('change')}</div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
          {activeLeaderboard.map((entry, i) => {
            const isCurrentUser = activeTab === 'group'
              ? entry.full_name === user.name
              : entry.id === user.id;

            return (
              <div
                key={entry.id || i}
                className={`group flex items-center px-4 py-4 sm:px-6 sm:py-5 transition-all duration-200 relative
                  ${isCurrentUser
                    ? 'bg-brand-primary/5 dark:bg-brand-primary/8'
                    : 'hover:bg-gray-50/60 dark:hover:bg-slate-800/30'
                  }
                  ${entry.rank <= 3 ? 'py-5 sm:py-6' : ''}
                `}
              >
                {/* Current user accent line */}
                {isCurrentUser && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-primary rounded-r-full"></div>
                )}

                {/* Rank */}
                <div className="w-12 sm:w-14 flex items-center justify-center sm:justify-start shrink-0">
                  {getRankBadge(entry.rank)}
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0 px-3 sm:px-5">
                  <p className="text-sm sm:text-[15px] font-bold text-brand-dark dark:text-white truncate leading-tight">
                    {entry.full_name}
                  </p>
                  {isCurrentUser && (
                    <span className="text-[9px] font-mono font-bold text-brand-primary uppercase tracking-wider mt-0.5 block">{t('student')} (YOU)</span>
                  )}
                </div>

                {/* Points + Change */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-8 shrink-0">
                  <div className="flex items-center gap-2 sm:w-28 justify-end">
                    <span className="text-base sm:text-xl font-bold text-brand-dark dark:text-white tabular-nums tracking-tight font-mono">{entry.total_points}</span>
                    <div className="w-6 h-6 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                      <Star className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" />
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center sm:w-20">
                    {renderRankChange(entry.rank, entry.last_rank)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
