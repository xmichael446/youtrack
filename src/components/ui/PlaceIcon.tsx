import React from 'react';
import { Medal } from 'lucide-react';

const PlaceIcon: React.FC<{ place: number; className?: string }> = ({
  place,
  className = 'w-8 h-8',
}) => {
  const isSmall = className.includes('w-3');
  const medalSize = isSmall ? 'w-2.5 h-2.5' : 'w-4 h-4 sm:w-4 h-4';
  const fontSize = isSmall ? 'text-[10px]' : 'text-caption sm:text-body';

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
        className={`flex items-center justify-center ${className} rounded-full bg-surface-secondary dark:bg-surface-dark-secondary text-text-theme-muted shadow-sm border border-surface-secondary dark:border-surface-dark-elevated/50`}
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
      className={`${className} rounded-full bg-surface-secondary dark:bg-surface-dark-secondary/50 flex items-center justify-center ${fontSize} font-bold font-mono text-text-theme-muted dark:text-text-theme-dark-muted border border-surface-secondary dark:border-surface-dark-secondary/50`}
    >
      {place}
    </span>
  );
};

export default PlaceIcon;
