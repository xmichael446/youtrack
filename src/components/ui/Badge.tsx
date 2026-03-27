import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'muted';
  size?: 'sm' | 'md';
  dot?: boolean;
  pulse?: boolean;
}

const variantClassMap: Record<NonNullable<BadgeProps['variant']>, string> = {
  brand: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/30',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/30',
  error: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/30',
  muted: 'bg-surface-secondary text-text-theme-secondary border border-surface-secondary dark:bg-surface-dark-secondary dark:text-text-theme-dark-secondary dark:border-surface-dark-elevated',
};

const dotColorMap: Record<NonNullable<BadgeProps['variant']>, string> = {
  brand: 'bg-brand-primary',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  muted: 'bg-gray-400',
};

const sizeMap: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-1 text-label',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'muted',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = [
    'inline-flex items-center gap-1.5 rounded-pill font-semibold uppercase tracking-wider',
    variantClassMap[variant],
    sizeMap[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={baseClasses} {...props}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColorMap[variant]} ${pulse ? 'animate-pulse' : ''}`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
