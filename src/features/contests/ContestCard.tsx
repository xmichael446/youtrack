import React from 'react';
import {
  Swords,
  Trophy,
  Clock,
  Users,
  CheckCircle2,
  ChevronRight,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { ContestListItem } from '../../services/apiTypes';
import { Card, Badge, Button } from '../../components/ui';
import { useCountdown } from '../../hooks/useCountdown';
import { formatDateTime } from '../../utils/formatDateTime';
import { statusAccentClass, CONTEST_STORAGE_KEY } from '../../utils/contestHelpers';
import type { ContestNav } from './contestTypes';

// Map contest status to Badge variant
const statusToBadgeVariant = (status: string): 'brand' | 'success' | 'warning' | 'error' | 'muted' => {
  switch (status) {
    case 'open': return 'success';
    case 'scheduled': return 'brand';
    case 'finalized': return 'muted';
    case 'closed': return 'error';
    default: return 'muted';
  }
};

const statusToLabel = (status: string, t: (k: string) => string): string => {
  switch (status) {
    case 'open': return t('contestStatusOpen') || 'Live';
    case 'scheduled': return t('contestStatusScheduled') || 'Upcoming';
    case 'finalized': return t('contestStatusFinalized') || 'Ended';
    case 'closed': return t('contestStatusClosed') || 'Closed';
    default: return status;
  }
};

const ContestCard: React.FC<{
  item: ContestListItem;
  onNavigate: (nav: ContestNav) => void;
  onRegister: (id: number) => void;
  registeringId: number | null;
  t: (k: string) => string;
}> = ({ item, onNavigate, onRegister, registeringId, t }) => {
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
          <Badge variant="success" size="sm">
            <CheckCircle2 className="w-3 h-3" />
            {t('contestRegistered')}
          </Badge>
        );
      }
      return (
        <Button
          variant="primary"
          size="sm"
          icon={<Users className="w-3.5 h-3.5" />}
          loading={registeringId === item.id}
          onClick={handleAction}
        >
          {t('contestRegister')}
        </Button>
      );
    }
    if (item.status === 'open') {
      if (item.is_registered) {
        if (isSubmitted) {
          return (
            <Badge variant="success" size="sm">
              <CheckCircle2 className="w-3 h-3" />
              {localPlay?.score !== undefined ? `${localPlay.score}/${localPlay.total}` : t('contestSubmitted')}
            </Badge>
          );
        }
        return null; // rendered as full-width banner below
      }
      return (
        <Badge variant="muted" size="sm">
          {t('contestRegistrationClosed')}
        </Badge>
      );
    }
    if (item.status === 'finalized') {
      return (
        <Button
          variant="ghost"
          size="sm"
          icon={<Trophy className="w-3.5 h-3.5" />}
          onClick={handleAction}
        >
          {t('contestViewResults')}
        </Button>
      );
    }
    return null;
  };

  return (
    <Card
      variant="default"
      padding="none"
      hoverable
      onClick={() => onNavigate({ view: 'detail', contestId: item.id })}
      className={`overflow-hidden cursor-pointer group ${statusAccentClass(item.status)}`}
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
              <Badge
                variant={statusToBadgeVariant(item.status)}
                size="sm"
                dot={item.status === 'open'}
                pulse={item.status === 'open'}
              >
                {statusToLabel(item.status, t)}
              </Badge>
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

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption font-mono text-text-theme-muted dark:text-text-theme-dark-muted mb-4">
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
          <Button
            variant="primary"
            size="md"
            fullWidth
            icon={<Swords className="w-4 h-4" />}
            onClick={handleAction}
            className="mt-3 bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/40 from-emerald-500 to-emerald-600"
          >
            {t('contestEnter')} →
          </Button>
        )}

        {/* Hint for registered+upcoming: tell them what happens next */}
        {item.status === 'scheduled' && item.is_registered && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-input px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{t('contestRegisteredHint')}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContestCard;
