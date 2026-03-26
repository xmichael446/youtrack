import React from 'react';
import { Crown } from 'lucide-react';

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1)
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.4)] ring-2 ring-amber-200 dark:ring-amber-500/30">
        <Crown className="w-5 h-5 text-amber-900 fill-amber-900/20" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center shadow-[0_4px_12px_rgba(148,163,184,0.3)] ring-2 ring-slate-100 dark:ring-slate-500/30">
        <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-100">2</span>
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-orange-400 dark:from-orange-700 dark:to-orange-800 flex items-center justify-center shadow-[0_4px_12px_rgba(251,146,60,0.3)] ring-2 ring-orange-100 dark:ring-orange-600/30">
        <span className="text-sm font-bold font-mono text-orange-900 dark:text-orange-100">3</span>
      </div>
    );

  return (
    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center border border-gray-100 dark:border-slate-700">
      <span className="text-[12px] font-bold text-gray-400 dark:text-slate-500 font-mono">#{rank}</span>
    </div>
  );
};

export default RankBadge;
