import React from 'react';
import { Medal } from 'lucide-react';

const PlaceIcon: React.FC<{ place: number; className?: string }> = ({
  place,
  className = 'w-8 h-8',
}) => {
  const isSmall = className.includes('w-3');
  const medalSize = isSmall ? 'w-2.5 h-2.5' : 'w-4 h-4 sm:w-5 sm:h-5';
  const fontSize = isSmall ? 'text-[10px]' : 'text-xs sm:text-sm';

  if (place === 1)
    return (
      <div
        className={`flex items-center justify-center ${className} rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 shadow-sm border border-amber-100 dark:border-amber-800/50`}
      >
        <Medal className={medalSize} />
      </div>
    );
  if (place === 2)
    return (
      <div
        className={`flex items-center justify-center ${className} rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700/50`}
      >
        <Medal className={medalSize} />
      </div>
    );
  if (place === 3)
    return (
      <div
        className={`flex items-center justify-center ${className} rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-400 shadow-sm border border-orange-100 dark:border-orange-800/50`}
      >
        <Medal className={medalSize} />
      </div>
    );

  return (
    <span
      className={`${className} rounded-full bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center ${fontSize} font-bold font-mono text-gray-400 dark:text-slate-500 border border-gray-100 dark:border-slate-800/50`}
    >
      {place}
    </span>
  );
};

export default PlaceIcon;
