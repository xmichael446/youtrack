import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default:
    'bg-surface-secondary dark:bg-surface-dark-secondary shadow-card dark:shadow-card-dark dark:ring-1 dark:ring-white/[0.07]',
  bordered:
    'bg-surface-secondary dark:bg-surface-dark-secondary border border-surface-secondary dark:border-surface-dark-elevated dark:ring-1 dark:ring-white/[0.07]',
  elevated:
    'bg-surface-elevated dark:bg-surface-dark-elevated shadow-modal dark:shadow-modal-dark dark:ring-1 dark:ring-white/[0.07]',
};

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const BASE_CLASSES = 'rounded-card transition-all duration-fast';

const HOVERABLE_CLASSES =
  'hover:shadow-modal dark:hover:shadow-modal-dark hover:scale-[1.01] active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-dark-primary';

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [
      BASE_CLASSES,
      variantClasses[variant],
      paddingClasses[padding],
      hoverable ? HOVERABLE_CLASSES : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
