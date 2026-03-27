import React, { useState } from 'react';
import {
  Swords,
  Trophy,
  Clock,
  Users,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { ContestListItem } from '../../services/apiTypes';
import StatusBadge from '../../components/ui/StatusBadge';
import { useCountdown } from '../../hooks/useCountdown';
import { formatDateTime } from '../../utils/formatDateTime';
import { statusAccentClass, CONTEST_STORAGE_KEY } from '../../utils/contestHelpers';
import type { ContestNav } from './contestTypes';

const ContestCard: React.FC<{
  item: ContestListItem;
  onNavigate: (nav: ContestNav) => void;
  onRegister: (id: number) => void;
  registeringId: number | null;
  t: (k: string) => string;
}> = ({ item, onNavigate, onRegister, registeringId, t }) => {
  const [pressed, setPressed] = useState(false);

  // Check if user has already submitted this contest
  const localPlay = (() => {
    try {
      const raw = localStorage.getItem(CONTEST_STORAGE_KEY(item.id));
      return raw ? JSON.parse(raw) as { submitted?: boolean; score?: number; total?: number } : null;
    } catch { return null; }
  })();
  const isSubmitted = localPlay?.submitted === true;

  const countdown = useCountdown(
    item.status === 'scheduled' ? item.scheduled_start :
    item.status === 'open' ? item.scheduled_end : null
  );

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status === 'scheduled' && !item.is_registered) {
      onRegister(item.id);
    } else if (item.status === 'open' && item.is_registered) {
      onNavigate({ view: 'play', contestId: item.id });
    } else if (item.status === 'finalized') {
      onNavigate({ view: 'detail', contestId: item.id });
    }
  };

  const actionBtn = () => {
    if (item.status === 'scheduled') {
      if (item.is_registered) {
        return (
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-input text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 cursor-default tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('contestRegistered')}
          </span>
        );
      }
      return (
        <button
          onClick={handleAction}
          disabled={registeringId === item.id}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-input text-[10px] font-bold font-mono text-white bg-brand-primary hover:bg-brand-primary/90 shadow-sm shadow-brand-primary/30 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-150 disabled:opacity-60 tracking-wide"
        >
          {registeringId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
          {t('contestRegister')}
        </button>
      );
    }
    if (item.status === 'open') {
      if (item.is_registered) {
        if (isSubmitted) {
          return (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-input text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 cursor-default tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {localPlay?.score !== undefined ? `${localPlay.score}/${localPlay.total}` : t('contestSubmitted')}
            </span>
          );
        }
        return null; // rendered as full-width banner below
      }
      return (
        <span className="inline-flex items-center px-3 py-2 rounded-input text-[10px] font-bold font-mono text-text-theme-muted dark:text-text-theme-dark-muted bg-surface-secondary dark:bg-surface-dark-secondary cursor-not-allowed tracking-wide">
          {t('contestRegistrationClosed')}
        </span>
      );
    }
    if (item.status === 'finalized') {
      return (
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-input text-[10px] font-bold font-mono text-brand-primary hover:bg-brand-primary/10 border border-brand-primary/30 hover:border-brand-primary/50 hover:scale-[1.02] active:scale-95 transition-all duration-150 tracking-wide"
        >
          <Trophy className="w-3.5 h-3.5" />
          {t('contestViewResults')}
        </button>
      );
    }
    return null;
  };

  return (
    <div
      onClick={() => onNavigate({ view: 'detail', contestId: item.id })}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className={`bg-surface-primary dark:bg-surface-dark-primary rounded-card border border-gray-100 dark:border-slate-800 overflow-hidden shadow-card dark:shadow-card-dark
        hover:border-brand-primary/25 dark:hover:border-brand-primary/20
        hover:shadow-lg dark:hover:shadow-brand-primary/5
        transition-all duration-fast cursor-pointer group
        ${statusAccentClass(item.status)}
        ${pressed ? 'scale-[0.99]' : 'hover:-translate-y-0.5'}
      `}
    >
      {/* Gradient top edge accent */}
      {item.status === 'open' && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
      )}
      {item.status === 'scheduled' && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-h4 text-gray-900 dark:text-text-theme-dark-primary group-hover:text-brand-primary transition-colors duration-fast tracking-tight">
              {t('vocabContest')} #{item.number}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={item.status} t={t} />
              {(item.status === 'scheduled' || item.status === 'open') && (
                <span className="text-caption font-mono text-text-theme-muted dark:text-text-theme-dark-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.status === 'scheduled' ? t('contestStartsIn') : t('contestEndsIn')}: <span className="font-bold text-text-theme-secondary dark:text-text-theme-dark-secondary ml-0.5">{countdown}</span>
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-text-theme-dark-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all duration-fast shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-4 text-caption font-mono text-text-theme-muted dark:text-text-theme-dark-muted mb-4">
          <span className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-brand-primary/60" />
            {t('contestQuestions').replace('{count}', String(item.question_count))}
          </span>
          <span className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-brand-primary/60" />
            {t('contestRegistrations').replace('{count}', String(item.registration_count))}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-brand-primary/60" />
            {t('contestDuration')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-caption font-mono text-text-theme-muted dark:text-text-theme-dark-muted flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDateTime(item.scheduled_start)}
          </div>
          {actionBtn()}
        </div>

        {/* Full-width CTA for open+registered+not submitted */}
        {item.status === 'open' && item.is_registered && !isSubmitted && (
          <button
            onClick={handleAction}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-input font-bold font-mono text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
          >
            <Swords className="w-4 h-4" />
            {t('contestEnter')} →
          </button>
        )}

        {/* Hint for registered+upcoming: tell them what happens next */}
        {item.status === 'scheduled' && item.is_registered && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-input px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{t('contestRegisteredHint')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestCard;
