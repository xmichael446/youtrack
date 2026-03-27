import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/35 hover:scale-[1.01] active:scale-[0.99]',
  secondary:
    'bg-surface-secondary dark:bg-surface-dark-secondary text-text-theme-primary dark:text-text-theme-dark-primary border border-surface-secondary dark:border-surface-dark-elevated hover:bg-surface-secondary/80 dark:hover:bg-surface-dark-elevated hover:scale-[1.01] active:scale-[0.99]',
  ghost:
    'bg-transparent text-text-theme-secondary dark:text-text-theme-dark-secondary hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary hover:scale-[1.01] active:scale-[0.99]',
  danger:
    'bg-status-error text-white shadow-lg shadow-status-error/20 hover:bg-red-600 dark:hover:bg-red-400 hover:scale-[1.01] active:scale-[0.99]',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-caption gap-1.5',
  md: 'px-4 py-2.5 text-body gap-2',
  lg: 'px-6 py-3.5 text-body gap-2.5',
};

const loaderSizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center font-bold rounded-button transition-all duration-fast disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    const loaderSize = loaderSizeClasses[size];
    const spinner = <Loader2 className={`${loaderSize} animate-spin`} />;

    const leftIcon = iconPosition === 'left' ? (loading ? spinner : icon) : null;
    const rightIcon = iconPosition === 'right' ? (loading && !icon ? null : loading ? spinner : icon) : null;
    // When loading with no icon prop, show spinner on the left regardless of iconPosition
    const showFallbackSpinner = loading && !icon;

    const classes = [
      BASE_CLASSES,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} disabled={disabled || loading} className={classes} {...rest}>
        {showFallbackSpinner && <Loader2 className={`${loaderSize} animate-spin`} />}
        {!showFallbackSpinner && leftIcon}
        {children}
        {!showFallbackSpinner && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
