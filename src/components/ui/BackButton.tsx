import React from 'react';
import { ChevronLeft } from 'lucide-react';

const BackButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 text-label font-mono text-text-theme-secondary dark:text-text-theme-dark-secondary hover:text-brand-primary dark:hover:text-brand-primary transition-colors duration-150 group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-dark-primary rounded-sm"
  >
    <ChevronLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
    {label}
  </button>
);

export default BackButton;
