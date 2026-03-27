import React from 'react';

const LeaderboardAvatar: React.FC<{
  avatar?: string | null;
  name: string;
  className?: string;
}> = ({ avatar, name, className = 'w-7 h-7 sm:w-8 sm:h-8' }) => {
  if (avatar) {
    const url = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')}/${avatar.replace(/^\/+/, '')}`;
    return (
      <img
        src={url}
        alt={name}
        className={`${className} rounded-full object-cover shrink-0 bg-surface-secondary dark:bg-surface-dark-secondary ring-1 ring-surface-secondary dark:ring-surface-dark-elevated`}
      />
    );
  }
  return (
    <div
      className={`${className} rounded-full shrink-0 flex items-center justify-center text-[10px] sm:text-caption font-bold text-white bg-gradient-to-br from-brand-primary to-cyan-600 ring-1 ring-brand-primary/20`}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
};

export default LeaderboardAvatar;
