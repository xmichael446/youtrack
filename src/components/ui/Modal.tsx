import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  closeOnOverlay?: boolean;
}

const maxWidthMap: Record<NonNullable<ModalProps['maxWidth']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  closeOnOverlay = true,
}) => {
  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClass = maxWidthMap[maxWidth];

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-normal"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal panel */}
      <div
        className={`bg-surface-primary dark:bg-surface-dark-primary rounded-t-[24px] md:rounded-[24px] shadow-modal dark:shadow-modal-dark w-full ${maxWidthClass} relative z-10 flex flex-col border border-surface-secondary dark:border-surface-dark-elevated overflow-hidden max-h-[90vh] animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95 duration-normal`}
      >
        {/* Header (only if title provided) */}
        {title && (
          <div className="p-4 md:p-6 border-b border-surface-secondary dark:border-surface-dark-elevated flex justify-between items-center bg-surface-secondary/50 dark:bg-surface-dark-secondary/50">
            <div>
              <h3 className="text-h3 md:text-h2 text-text-theme-primary dark:text-text-theme-dark-primary">{title}</h3>
              {subtitle && (
                <p className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary rounded-input transition-colors duration-fast"
            >
              <X className="w-4 h-4 text-text-theme-secondary dark:text-text-theme-dark-secondary" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer (only if provided) */}
        {footer && (
          <div className="p-4 md:p-6 border-t border-surface-secondary dark:border-surface-dark-elevated bg-surface-secondary/50 dark:bg-surface-dark-secondary/50">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
