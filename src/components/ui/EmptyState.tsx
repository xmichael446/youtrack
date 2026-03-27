import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-card bg-surface-secondary dark:bg-surface-dark-secondary flex items-center justify-center mb-4 text-text-theme-muted dark:text-text-theme-dark-muted">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-h4 text-text-theme-primary dark:text-text-theme-dark-primary mb-1">
          {title}
        </h3>
      )}
      <p className="text-body text-text-theme-muted dark:text-text-theme-dark-muted max-w-xs">
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
