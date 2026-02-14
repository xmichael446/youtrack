import React, { useState } from 'react';
import { Trophy, Star, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLeaderboard } from '../context/LeaderboardContext';
import { useDashboard } from '../context/DashboardContext';

const Leaderboard: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'group' | 'course'>('group');
  const { groupLeaderboard, courseLeaderboard, enrollment, loading } = useLeaderboard();
  const { user } = useDashboard();

  // Show loader while data is being fetched
  if (loading || !user.id) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-slate-400 font-bold">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const activeLeaderboard = activeTab === 'group' ? groupLeaderboard : courseLeaderboard;

  // Helper function to render rank change indicator
  const renderRankChange = (rank: number, lastRank: number) => {
    if (rank < lastRank) {
      return (
        <div className="flex items-center text-emerald-500">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-bold ml-1">+{lastRank - rank}</span>
        </div>
      );
    } else if (rank > lastRank) {
      return (
        <div className="flex items-center text-red-500">
          <TrendingDown className="w-3 h-3" />
          <span className="text-xs font-bold ml-1">-{rank - lastRank}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-400 dark:text-slate-500">
          <Minus className="w-3 h-3" />
        </div>
      );
    }
  };

  return (
    <div className="space-y-[clamp(1.5rem,4vw,2.5rem)] animate-in fade-in slide-in-from-bottom-4 duration-700 px-px pb-10">
      {/* Header & Tabs Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-brand-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-brand-dark dark:text-white tracking-tight">{t('leaderboard')}</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base leading-relaxed">{t('competePeers')}</p>
        </div>
      </div>

      {/* User Stats Summary (Forced Side-by-Side on Mobile) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        {[
          {
            icon: Trophy,
            label: t('yourRank'),
            value: enrollment ? `#${enrollment.rank}` : '-',
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
          },
          {
            icon: Star,
            label: t('weeklyPoints') || 'Points',
            value: enrollment ? enrollment.week_points.toString() : '-',
            color: 'text-brand-primary',
            bg: 'bg-brand-primary/10'
          },
          {
            icon: Zap,
            label: t('totalXp'),
            value: enrollment ? enrollment.total_points.toString() : '-',
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 px-2 py-4 sm:px-6 sm:py-8 rounded-[24px] sm:rounded-[32px] border-2 border-gray-300 dark:border-slate-800 shadow-sm flex flex-col items-center text-center group hover:scale-[1.02] transition-transform duration-500">
            <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} mb-3 sm:mb-4 group-hover:rotate-12 transition-transform`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-[8px] sm:text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <span className="text-base sm:text-2xl font-black text-brand-dark dark:text-white tabular-nums">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center mb-6 md:mb-8">
        {/* Tab System Hardening */}
        <div className="bg-gray-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1.5 md:p-2 rounded-2xl md:rounded-[20px] flex items-center shadow-sm w-full md:w-auto scale-100 origin-center transition-transform">
          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 md:flex-none h-11 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl font-black text-xs md:text-base uppercase tracking-wider transition-all duration-300 min-w-[100px] md:min-w-[200px]
                ${activeTab === 'group' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-lg shadow-brand-primary/5 scale-[1.02]' : 'text-gray-500 dark:text-slate-400 hover:text-brand-primary/80'}`}
          >
            {t('groupRank')}
          </button>
          <button
            onClick={() => setActiveTab('course')}
            className={`flex-1 md:flex-none h-11 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl font-black text-xs md:text-base uppercase tracking-wider transition-all duration-300 min-w-[100px] md:min-w-[200px]
                ${activeTab === 'course' ? 'bg-white dark:bg-slate-700 text-brand-primary shadow-lg shadow-brand-primary/5 scale-[1.02]' : 'text-gray-500 dark:text-slate-400 hover:text-brand-primary/80'}`}
          >
            {t('courseRank')}
          </button>
        </div>
      </div>

      {/* Leaderboard Table (Flexible Flex-Row implementation) */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-gray-300 dark:border-slate-800 shadow-sm overflow-hidden p-[clamp(0.5rem,2vw,1.5rem)]">
        <div className="hidden sm:flex items-center px-6 py-4 border-b-2 border-gray-300 dark:border-slate-800 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
          <div className="w-16">{t('rank')}</div>
          <div className="flex-1">{t('student')}</div>
          <div className="w-24 text-right">{t('points')}</div>
          <div className="w-24 text-center">{t('change') || 'Change'}</div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-slate-800/50">
          {activeLeaderboard.map((entry, i) => {
            // For group tab, match by full_name; for course tab, match by id
            const isCurrentUser = activeTab === 'group'
              ? entry.full_name === user.name
              : entry.id === user.id;

            return (
              <div
                key={entry.id || i}
                className={`group flex items-center p-4 sm:p-6 transition-all hover:bg-gray-50/50 dark:hover:bg-slate-800/30 rounded-2xl sm:rounded-none ${isCurrentUser ? 'bg-brand-primary/5 dark:bg-brand-primary/10 relative z-10 shadow-sm ring-1 ring-brand-primary/20' : ''
                  }`}
              >
                {/* Rank Badge */}
                <div className="w-12 sm:w-16 flex items-center justify-center sm:justify-start">
                  {entry.rank <= 3 ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg
                    ${entry.rank === 1 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900' :
                        entry.rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800' :
                          'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900'}`}>
                      {entry.rank}
                    </div>
                  ) : (
                    <span className="text-sm font-black text-gray-400 dark:text-slate-500 tabular-nums">#{entry.rank}</span>
                  )}
                </div>

                {/* Student Info - Hardened Single Line */}
                <div className="flex-1 min-w-0 px-4 sm:px-6">
                  <p className="text-sm sm:text-base font-black text-brand-dark dark:text-white truncate leading-none">
                    {entry.full_name}
                  </p>
                </div>

                {/* Points & Stats (Stacked on mobile, row on desktop) */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-8 text-right shrink-0">
                  <div className="flex items-center space-x-2 sm:w-24 justify-end">
                    <span className="text-base sm:text-lg font-black text-brand-dark dark:text-white tabular-nums">{entry.total_points}</span>
                    <div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center">
                      <Star className="w-3 h-3 text-brand-primary fill-brand-primary" />
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center sm:w-24">
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