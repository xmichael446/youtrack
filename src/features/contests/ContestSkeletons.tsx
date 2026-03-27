import React from 'react';
import Shimmer from '../../components/ui/Shimmer';

export const ContestListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[0, 1, 2].map(i => (
      <div key={i} className="bg-surface-primary dark:bg-surface-dark-primary rounded-2xl border border-gray-100 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Shimmer className="h-4 w-36 rounded-lg" />
            <Shimmer className="h-5 w-24 rounded-full" />
          </div>
          <Shimmer className="h-4 w-4 rounded" />
        </div>
        <div className="flex gap-4">
          <Shimmer className="h-3 w-20 rounded" />
          <Shimmer className="h-3 w-20 rounded" />
          <Shimmer className="h-3 w-16 rounded" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Shimmer className="h-3 w-28 rounded" />
          <Shimmer className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

export const DetailSkeleton: React.FC = () => (
  <div className="space-y-5">
    <Shimmer className="h-28 w-full rounded-2xl" />
    <div className="grid grid-cols-2 gap-3">
      {[0,1,2,3].map(i => <Shimmer key={i} className="h-16 rounded-xl" />)}
    </div>
    <Shimmer className="h-36 w-full rounded-2xl" />
  </div>
);

export default ContestListSkeleton;
