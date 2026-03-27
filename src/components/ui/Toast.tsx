import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// TODO: import Z_INDEX.toast from constants/zIndex when available
// z-[70] corresponds to Z_INDEX.toast in the shared z-index scale

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

const variantStyles: Record<ToastProps['type'], string> = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-brand-primary text-white',
};

const variantIcons: Record<ToastProps['type'], React.ReactElement> = {
  success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
  info: <Info className="w-4 h-4 shrink-0" />,
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return createPortal(
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 md:px-6 md:py-3 rounded-card shadow-modal flex items-center gap-2 animate-in duration-normal max-w-[90vw] ${variantStyles[type]}`}
    >
      {variantIcons[type]}
      <span className="text-caption font-bold uppercase tracking-wide leading-snug">
        {message}
      </span>
    </div>,
    document.body
  );
};

export default Toast;
