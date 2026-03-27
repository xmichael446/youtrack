import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return createPortal(
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 md:px-6 md:py-3 rounded-card shadow-modal flex items-center gap-2 animate-in duration-normal max-w-[90vw] ${
        type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      <span className="text-caption font-bold uppercase tracking-wide leading-snug">
        {message}
      </span>
    </div>,
    document.body
  );
};

export default Toast;
