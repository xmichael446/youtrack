import React from 'react';
import { ChevronLeft } from 'lucide-react';

const BackButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-gray-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors duration-150 group active:scale-95"
  >
    <ChevronLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
    {label}
  </button>
);

export default BackButton;
