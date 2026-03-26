import React from 'react';
import {
  Swords,
  Users,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { ContestDetailData } from '../../services/apiTypes';

const ContestActionButton: React.FC<{
  detail: ContestDetailData;
  onAction: () => void;
  loading: boolean;
  t: (k: string) => string;
}> = ({ detail, onAction, loading, t }) => {
  if (detail.status === 'scheduled') {
    if (detail.is_registered) {
      return (
        <div className="flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold font-mono text-sm">{t('contestRegistered')}</span>
        </div>
      );
    }
    return (
      <button
        onClick={onAction}
        disabled={loading || detail.question_count === 0}
        className="w-full py-3.5 rounded-2xl font-bold font-mono text-sm text-white bg-brand-primary hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
        {detail.question_count === 0 ? t('contestBeingPrepared') : t('contestRegister')}
      </button>
    );
  }
  if (detail.status === 'open' && detail.is_registered) {
    return (
      <button
        onClick={onAction}
        disabled={detail.question_count === 0}
        className="w-full py-3.5 rounded-2xl font-bold font-mono text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
      >
        <Swords className="w-5 h-5" />
        {t('contestEnter')}
      </button>
    );
  }
  if (detail.status === 'open' && !detail.is_registered) {
    return (
      <div className="flex items-center justify-center py-3.5 px-5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 font-mono font-bold text-sm cursor-not-allowed border border-gray-200 dark:border-slate-700">
        {t('contestRegistrationClosed')}
      </div>
    );
  }
  return null;
};

export default ContestActionButton;
