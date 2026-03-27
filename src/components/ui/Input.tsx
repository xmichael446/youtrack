import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  as?: 'input' | 'textarea';
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  textareaRows?: number;
}

const sizeMap = {
  sm: 'px-3 py-2 text-caption',
  md: 'px-4 py-3 text-body',
  lg: 'px-4 py-4 text-body',
};

const iconPaddingMap = {
  sm: 'pl-9',
  md: 'pl-10',
  lg: 'pl-10',
};

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      as = 'input',
      label,
      helperText,
      error,
      icon,
      size = 'md',
      textareaRows = 4,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'w-full rounded-input border',
      error
        ? 'border-status-error dark:border-status-dark-error focus:ring-status-error/10'
        : 'border-surface-secondary dark:border-surface-dark-elevated focus:border-brand-primary focus:ring-brand-primary/10',
      'bg-surface-primary dark:bg-surface-dark-primary',
      'text-text-theme-primary dark:text-text-theme-dark-primary',
      'placeholder:text-text-theme-muted dark:placeholder:text-text-theme-dark-muted',
      'focus:outline-none focus:ring-4',
      'transition-all duration-fast',
      sizeMap[size],
      icon ? iconPaddingMap[size] : '',
      as === 'textarea' ? 'min-h-[100px] resize-y' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="group/input">
        {label && (
          <label className="block mb-2 text-label text-text-theme-muted dark:text-text-theme-dark-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-theme-muted dark:text-text-theme-dark-muted group-focus-within/input:text-brand-primary transition-colors duration-fast">
              {icon}
            </div>
          )}
          {as === 'textarea' ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={textareaRows}
              className={baseClasses}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              className={baseClasses}
              {...props}
            />
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-caption text-status-error dark:text-status-dark-error">{error}</p>
        )}
        {helperText && (
          <p className="mt-1.5 text-caption text-text-theme-muted dark:text-text-theme-dark-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
