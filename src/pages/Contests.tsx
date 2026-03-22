import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Swords,
  Trophy,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Calendar,
  Award,
  RefreshCw,
  BookOpen,
  Medal,
  Coins,
  Search,
  X,
  Crown,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';
import LoadingScreen from '../components/LoadingScreen';
import { ContestProvider, useContests } from '../context/ContestContext';
import { useNavigation } from '../context/NavigationContext';
import {
  ContestListItem,
  ContestDetailData,
  ContestStartResponse,
  ContestSubmitResponse,
  ContestResultsData,
  ContestLeaderboardEntry,
  ContestLiveLeaderboardResponse,
  QuizQuestion,
  ContestAnswer,
} from '../services/apiTypes';

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return createPortal(
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in duration-300 ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
      <span className="text-sm font-bold font-mono uppercase tracking-wider">{message}</span>
    </div>,
    document.body
  );
};

// ── Shimmer Skeleton ───────────────────────────────────────────────────────────
const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-gray-100 dark:bg-slate-800 rounded-xl ${className}`}>
    <div
      className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite]"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
      }}
    />
  </div>
);

const ContestListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {[0, 1, 2].map(i => (
      <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Shimmer className="h-4 w-36 rounded-lg" />
            <Shimmer className="h-5 w-24 rounded-full" />
          </div>
          <Shimmer className="h-4 w-4 rounded" />
        </div>
        <div className="flex gap-4">
          <Shimmer className="h-3 w-20 rounded" />
          <Shimmer className="h-3 w-20 rounded" />
          <Shimmer className="h-3 w-16 rounded" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Shimmer className="h-3 w-28 rounded" />
          <Shimmer className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const DetailSkeleton: React.FC = () => (
  <div className="space-y-5">
    <Shimmer className="h-28 w-full rounded-2xl" />
    <div className="grid grid-cols-2 gap-3">
      {[0,1,2,3].map(i => <Shimmer key={i} className="h-16 rounded-xl" />)}
    </div>
    <Shimmer className="h-36 w-full rounded-2xl" />
  </div>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch { return iso; }
}

function formatCountdown(targetIso: string): string {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getMsRemaining(targetIso: string): number {
  return Math.max(0, new Date(targetIso).getTime() - Date.now());
}

function useCountdown(targetIso: string | null): string {
  const [display, setDisplay] = useState('--');
  useEffect(() => {
    if (!targetIso) return;
    const tick = () => setDisplay(formatCountdown(targetIso));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return display;
}

// Returns 'normal' | 'warning' | 'critical' based on ms remaining
function useTimerUrgency(targetIso: string | null): 'normal' | 'warning' | 'critical' {
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical'>('normal');
  useEffect(() => {
    if (!targetIso) return;
    const tick = () => {
      const ms = getMsRemaining(targetIso);
      if (ms <= 60_000) setUrgency('critical');
      else if (ms <= 300_000) setUrgency('warning');
      else setUrgency('normal');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return urgency;
}

// Status badge colors & labels
function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const map: Record<string, { label: string; cls: string; dotCls: string; pulse?: boolean }> = {
    scheduled: {
      label: t('contestScheduled'),
      cls: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30',
      dotCls: 'bg-blue-500',
    },
    open: {
      label: t('contestOpen'),
      cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/30',
      dotCls: 'bg-emerald-500',
      pulse: true,
    },
    finalized: {
      label: t('contestFinalized'),
      cls: 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
      dotCls: 'bg-gray-400 dark:bg-slate-500',
    },
    closed: {
      label: t('contestClosed'),
      cls: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/30',
      dotCls: 'bg-orange-500',
    },
  };
  const cfg = map[status] ?? {
    label: status,
    cls: 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    dotCls: 'bg-gray-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotCls} ${cfg.pulse ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

// Place medal/icon for table list
function PlaceIcon({ place, className = "w-8 h-8" }: { place: number; className?: string }) {
  const isSmall = className.includes('w-3');
  const medalSize = isSmall ? "w-2.5 h-2.5" : "w-4 h-4 sm:w-5 sm:h-5";
  const fontSize = isSmall ? "text-[10px]" : "text-xs sm:text-sm";
  if (place === 1) return <div className={`flex items-center justify-center ${className} rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 shadow-sm border border-amber-100 dark:border-amber-800/50`}><Medal className={medalSize} /></div>;
  if (place === 2) return <div className={`flex items-center justify-center ${className} rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700/50`}><Medal className={medalSize} /></div>;
  if (place === 3) return <div className={`flex items-center justify-center ${className} rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-400 shadow-sm border border-orange-100 dark:border-orange-800/50`}><Medal className={medalSize} /></div>;
  return (
    <span className={`${className} rounded-full bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center ${fontSize} font-bold font-mono text-gray-400 dark:text-slate-500 border border-gray-100 dark:border-slate-800/50`}>
      {place}
    </span>
  );
}

function LeaderboardAvatar({ avatar, name, className = "w-7 h-7 sm:w-8 sm:h-8" }: { avatar?: string | null; name: string; className?: string }) {
  if (avatar) {
    const url = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')}/${avatar.replace(/^\/+/, '')}`;
    return <img src={url} alt={name} className={`${className} rounded-full object-cover shrink-0 bg-gray-100 dark:bg-slate-800 ring-1 ring-gray-200 dark:ring-slate-700`} />;
  }
  return (
    <div className={`${className} rounded-full shrink-0 flex items-center justify-center text-[10px] sm:text-[12px] font-bold text-white bg-gradient-to-br from-brand-primary to-cyan-600 ring-1 ring-brand-primary/20`}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

// Prize place gradient config
function prizeGradient(place: number): { card: string; badge: string; value: string } {
  if (place === 1) return {
    card: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/15 dark:to-yellow-900/10 border-amber-200/60 dark:border-amber-600/20',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-600/30',
    value: 'text-amber-600 dark:text-amber-400',
  };
  if (place === 2) return {
    card: 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700/20 dark:to-slate-800/20 border-slate-200/80 dark:border-slate-600/30',
    badge: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-300/60 dark:border-slate-600/30',
    value: 'text-slate-600 dark:text-slate-300',
  };
  if (place === 3) return {
    card: 'bg-gradient-to-r from-orange-50 to-amber-50/50 dark:from-orange-900/15 dark:to-amber-900/10 border-orange-200/60 dark:border-orange-700/20',
    badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-300/60 dark:border-orange-700/30',
    value: 'text-orange-600 dark:text-orange-400',
  };
  return {
    card: 'bg-gray-50 dark:bg-slate-800/40 border-gray-100 dark:border-slate-700/40',
    badge: 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-600',
    value: 'text-gray-500 dark:text-slate-400',
  };
}

// ── CONTEST LIST VIEW ──────────────────────────────────────────────────────────
type ContestView = 'list' | 'detail' | 'play' | 'review';

interface ContestNav {
  view: ContestView;
  contestId: number | null;
}

// Hoisted so both ContestCard and ContestDetailView can reference it
const CONTEST_STORAGE_KEY_FN = (id: number) => `contest_play_${id}`;

interface ContestPlayState {
  questions: QuizQuestion[];
  contestEndTime: string;
  answers: ContestAnswer[];
  submitted: boolean;
  score?: number;
  total?: number;
}

// Status → left accent border color
function statusAccentClass(status: string): string {
  switch (status) {
    case 'open': return 'border-l-4 border-l-emerald-400';
    case 'scheduled': return 'border-l-4 border-l-blue-400';
    case 'finalized': return 'border-l-4 border-l-gray-300 dark:border-l-slate-600';
    default: return 'border-l-4 border-l-orange-400';
  }
}

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
      const raw = localStorage.getItem(CONTEST_STORAGE_KEY_FN(item.id));
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
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 cursor-default tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('contestRegistered')}
          </span>
        );
      }
      return (
        <button
          onClick={handleAction}
          disabled={registeringId === item.id}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono text-white bg-brand-primary hover:bg-brand-primary/90 shadow-sm shadow-brand-primary/30 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-150 disabled:opacity-60 tracking-wide"
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
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 cursor-default tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {localPlay?.score !== undefined ? `${localPlay.score}/${localPlay.total}` : t('contestSubmitted')}
            </span>
          );
        }
        return null; // rendered as full-width banner below
      }
      return (
        <span className="inline-flex items-center px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-800/60 cursor-not-allowed tracking-wide">
          {t('contestRegistrationClosed')}
        </span>
      );
    }
    if (item.status === 'finalized') {
      return (
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold font-mono text-brand-primary hover:bg-brand-primary/10 border border-brand-primary/30 hover:border-brand-primary/50 hover:scale-[1.02] active:scale-95 transition-all duration-150 tracking-wide"
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
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden
        hover:border-brand-primary/25 dark:hover:border-brand-primary/20
        hover:shadow-lg dark:hover:shadow-brand-primary/5
        transition-all duration-200 cursor-pointer group
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

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-100 group-hover:text-brand-primary transition-colors duration-200 tracking-tight">
              {t('vocabContest')} #{item.number}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <StatusBadge status={item.status} t={t} />
              {(item.status === 'scheduled' || item.status === 'open') && (
                <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.status === 'scheduled' ? t('contestStartsIn') : t('contestEndsIn')}: <span className="font-bold text-gray-600 dark:text-slate-300 ml-0.5">{countdown}</span>
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-gray-400 dark:text-slate-500 mb-4">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-brand-primary/60" />
            {t('contestQuestions').replace('{count}', String(item.question_count))}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-primary/60" />
            {t('contestRegistrations').replace('{count}', String(item.registration_count))}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-primary/60" />
            {t('contestDuration')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono text-gray-400 dark:text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDateTime(item.scheduled_start)}
          </div>
          {actionBtn()}
        </div>

        {/* Full-width CTA for open+registered+not submitted */}
        {item.status === 'open' && item.is_registered && !isSubmitted && (
          <button
            onClick={handleAction}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold font-mono text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150"
          >
            <Swords className="w-4 h-4" />
            {t('contestEnter')} →
          </button>
        )}

        {/* Hint for registered+upcoming: tell them what happens next */}
        {item.status === 'scheduled' && item.is_registered && (
          <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{t('contestRegisteredHint')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ContestListView: React.FC<{ onNavigate: (nav: ContestNav) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { contests, loading, error, fetchContests, registerForContest } = useContests();
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchContests(); }, [fetchContests]);

  const handleRegister = async (id: number) => {
    setRegisteringId(id);
    try {
      const res = await registerForContest(id);
      setToast({ msg: res.message || t('contestRegistered'), type: 'success' });
    } catch (err: any) {
      setToast({ msg: err?.data?.message || err?.message || t('somethingWentWrong'), type: 'error' });
    } finally {
      setRegisteringId(null);
    }
  };

  // Show full-screen loader before any contests are loaded (hides header too)
  if (loading && contests.length === 0) {
    return <LoadingScreen message={t('findingBattles')} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-2">
          <Swords className="w-6 h-6 text-brand-primary shrink-0" />
          {t('contests')}
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">
          {t('contestsSubtitle')}
        </p>
        <button
          onClick={fetchContests}
          disabled={loading}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-brand-primary transition-all duration-200 active:scale-90 mt-1"
          title={t('refresh')}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-500/10">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-sm text-red-500 font-medium text-center px-4">{error}</p>
          <button
            onClick={fetchContests}
            className="text-[11px] font-mono font-bold text-brand-primary hover:text-brand-primary/80 border border-brand-primary/30 hover:border-brand-primary/50 px-4 py-2 rounded-xl transition-colors"
          >
            {t('loading')}
          </button>
        </div>
      ) : contests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center">
            <Swords className="w-7 h-7 text-gray-300 dark:text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{t('contestNoContests')}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{t('contestUpcomingHint')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {contests.map((item, idx) => (
            <div
              key={item.id}
              className="animate-in fade-in fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <ContestCard
                item={item}
                onNavigate={onNavigate}
                onRegister={handleRegister}
                registeringId={registeringId}
                t={t}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── CONTEST DETAIL VIEW ────────────────────────────────────────────────────────
const ContestDetailView: React.FC<{
  contestId: number;
  onNavigate: (nav: ContestNav) => void;
}> = ({ contestId, onNavigate }) => {
  const { t } = useLanguage();
  const { user } = useDashboard();
  const { navigateToProfile } = useNavigation();
  const { getContestDetail, registerForContest, getContestResults, getContestLeaderboard } = useContests();
  const [detail, setDetail] = useState<ContestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [results, setResults] = useState<ContestResultsData | null>(null);
  const [liveLeaderboard, setLiveLeaderboard] = useState<ContestLiveLeaderboardResponse | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Find my entry in the leaderboard to get the rank
  const myLeaderboardEntry = results?.leaderboard?.find(entry => {
    const profileId = entry.id || entry.enrollment_id;
    return profileId === user.id;
  });
  const myRank = results?.my_attempt?.rank || liveLeaderboard?.my_rank || myLeaderboardEntry?.rank;

  // Read submitted play state from localStorage once on mount
  const [localPlayState] = useState<ContestPlayState | null>(() => {
    try {
      const raw = localStorage.getItem(CONTEST_STORAGE_KEY_FN(contestId));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const isSubmitted = localPlayState?.submitted === true;

  const countdown = useCountdown(
    detail?.status === 'scheduled' ? detail.scheduled_start :
    detail?.status === 'open' ? detail.scheduled_end : null
  );

  useEffect(() => {
    setLoading(true);
    getContestDetail(contestId)
      .then(d => { setDetail(d); setError(null); })
      .catch(e => setError(e?.message || t('contestNotFound')))
      .finally(() => setLoading(false));
  }, [contestId, getContestDetail]);

  // Live-refresh every 30 s while contest is open
  useEffect(() => {
    if (!detail || detail.status !== 'open') return;
    const id = setInterval(() => {
      getContestDetail(contestId).then(d => setDetail(d)).catch(() => {});
      getContestLeaderboard(contestId).then(l => setLiveLeaderboard(l)).catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, [detail?.status, contestId, getContestDetail, getContestLeaderboard]);

  // Load full results when finalized, or live leaderboard when open/closed
  useEffect(() => {
    if (!detail) return;
    if (detail.status === 'finalized') {
      getContestResults(contestId).then(r => setResults(r)).catch(() => {});
    } else if (detail.status === 'open' || detail.status === 'closed') {
      getContestLeaderboard(contestId)
        .then(l => setLiveLeaderboard(l))
        .catch(err => console.error("Live Leaderboard Error:", err));
    }
  }, [detail?.status, contestId, getContestResults, getContestLeaderboard]);

  const handleAction = async () => {
    if (!detail) return;
    if (detail.status === 'scheduled' && !detail.is_registered) {
      setRegistering(true);
      try {
        const res = await registerForContest(contestId);
        setDetail(d => d ? { ...d, is_registered: true, registration_count: res.registration_count } : d);
        setToast({ msg: res.message, type: 'success' });
      } catch (e: any) {
        setToast({ msg: e?.data?.message || e?.message || 'Registration failed', type: 'error' });
      } finally {
        setRegistering(false);
      }
    } else if (detail.status === 'open' && detail.is_registered && !isSubmitted) {
      onNavigate({ view: 'play', contestId });
    }
  };

  if (loading) return (
    <div className="space-y-5 animate-in fade-in duration-300 min-h-[60vh] flex flex-col items-center justify-center">
      <LoadingScreen message={t('inspectingBattle')} />
    </div>
  );

  if (error || !detail) return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <BackBtn label={t('contestBackToList')} onClick={() => onNavigate({ view: 'list', contestId: null })} />
      <div className="flex flex-col items-center gap-3 py-20 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-500/10">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-red-500 font-medium">{error || t('contestNotFound')}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <BackBtn label={t('contestBackToList')} onClick={() => onNavigate({ view: 'list', contestId: null })} />

      {/* Header card — light theme consistent with lesson cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Brand accent top strip */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-primary via-cyan-400 to-brand-primary/40" />

        <div className="p-5 md:p-6">
          {/* Title + badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] font-mono text-brand-primary uppercase tracking-[3px] mb-1">{t('contestDetails')}</p>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{t('vocabContest')} #{detail.number}</h2>
            </div>
            <StatusBadge status={detail.status} t={t} />
          </div>

          {/* Compact info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            {[
              { label: t('contestInfoStart'), value: formatDateTime(detail.scheduled_start), icon: Calendar },
              { label: t('contestInfoDuration'), value: t('contestDuration'), icon: Clock },
              { label: t('contestInfoQuestions'), value: String(detail.question_count), icon: BookOpen },
              { label: t('contestInfoRegistered'), value: String(detail.registration_count), icon: Users, live: detail.status === 'open' },
            ].map(({ label, value, icon: Icon, live }) => (
              <div key={label} className="flex items-center gap-1.5 min-w-0">
                <Icon className="w-3 h-3 text-brand-primary/50 shrink-0" />
                <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate">{label}</span>
                <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300 ml-auto shrink-0 tabular-nums">{value}</span>
                {live && (
                  <span className="relative flex w-1.5 h-1.5 shrink-0 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Countdown */}
          {(detail.status === 'scheduled' || detail.status === 'open') && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono mb-4 bg-brand-primary/5 border border-brand-primary/15">
              <Clock className="w-3 h-3 text-brand-primary" />
              <span className="text-gray-500 dark:text-slate-400">{detail.status === 'scheduled' ? t('contestStartsIn') : t('contestEndsIn')}:</span>
              <span className="text-gray-900 dark:text-white font-bold tabular-nums">{countdown}</span>
            </div>
          )}

          {/* Prize name pills / Winners */}
          {detail.status === 'finalized' && detail.winners && detail.winners.length > 0 ? (
            <div className="space-y-2 mt-4">
              {detail.winners.map((winner, idx) => {
                const place = winner.place || idx + 1;
                const name = winner.name || t('unknownStudent');
                const avatar = (winner as any).avatar;
                const rewardName = winner.reward_name;
                const xp = winner.xp;
                const coins = winner.coins;
                const profileId = winner.id;
                const isMe = !!profileId && profileId === user.id;
                
                return (
                  <div key={profileId || idx} onClick={() => {
                    if (isMe) navigateToProfile(null);
                    else if (profileId) navigateToProfile(profileId);
                  }} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 shadow-sm transition-all hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        <RankBadge rank={place} />
                      </div>
                      <LeaderboardAvatar avatar={avatar} name={name} className="w-10 h-10" />
                      <div className="min-w-0">
                        <span className={`text-sm font-bold truncate block leading-tight ${isMe ? 'text-brand-primary' : 'text-gray-900 dark:text-slate-100'} group-hover:text-brand-primary transition-colors`}>{name}</span>
                        {rewardName && (
                          <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400 block mt-0.5">{rewardName}</span>
                        )}
                      </div>
                    </div>
                    {(xp || coins) && (
                      <div className={`flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-1.5 shrink-0 px-2 py-1 sm:py-1.5 rounded-lg border shadow-sm ${
                        place === 1 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/30' :
                        place === 2 ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' :
                        'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700/30'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          {xp && <span className={`text-[10px] font-mono font-bold ${
                            place === 1 ? 'text-amber-600 dark:text-amber-400' :
                            place === 2 ? 'text-slate-600 dark:text-slate-400' :
                            'text-orange-600 dark:text-orange-400'
                          }`}>+{xp} XP</span>}
                          {xp && coins && <div className={`hidden sm:block w-1 h-1 rounded-full ${
                            place === 1 ? 'bg-amber-300 dark:bg-amber-700' :
                            place === 2 ? 'bg-slate-300 dark:bg-slate-700' :
                            'bg-orange-300 dark:bg-orange-700'
                          }`} />}
                          {coins && <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                            place === 1 ? 'text-amber-600 dark:text-amber-400' :
                            place === 2 ? 'text-slate-600 dark:text-slate-400' :
                            'text-orange-600 dark:text-orange-400'
                          }`}>+{coins} <Coins className="w-2.5 h-2.5" /></span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : detail.prizes && detail.prizes.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {detail.prizes.map(p => (
                <div key={p.place} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                  <PlaceIcon place={p.place} className="w-3.5 h-3.5" />
                  <span className="text-gray-700 dark:text-slate-300">{p.reward_name}</span>
                </div>
              ))}
            </div>
          ) : null}

          {/* Submitted — show score inside the card */}
          {isSubmitted && detail.status === 'open' && localPlayState?.score !== undefined && (
            <div className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{t('contestSubmitted')}</span>
              <span className="ml-auto text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                {localPlayState.score}/{localPlayState.total}
              </span>
            </div>
          )}
          {isSubmitted && detail.status === 'open' && localPlayState?.score === undefined && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{t('contestSubmitted')} · {t('contestWaitingResults')}</span>
            </div>
          )}
        </div>
      </div>

      <div className={detail.status === 'finalized' ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"}>
        {/* Left Column: Registrations or Live/Final Leaderboard */}
        <div className={detail.status === 'finalized' ? "" : "order-2 lg:order-1"}>
          {detail.status === 'scheduled' ? (
            <div>
              <h3 className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-3 flex items-center gap-2 px-1">
                <div className="w-5 h-5 rounded-md bg-brand-primary/10 flex items-center justify-center">
                  <Users className="w-3 h-3 text-brand-primary" />
                </div>
                {t('contestRegistrations').replace('{count}', String(detail.registrations?.length || detail.registration_count))}
              </h3>
              {detail.registrations && detail.registrations.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <table className="w-full text-left text-sm"><thead className="bg-gray-50/50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider"><tr><th className="px-4 py-3 font-medium text-center w-12">#</th><th className="px-4 py-3 font-medium">Student</th><th className="px-4 py-3 font-medium text-right">XP</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {detail.registrations.map((reg, idx) => {
                        const rawName = reg.full_name || (reg as any).name || (reg as any).student_name || (reg as any).student?.full_name || '';
                        const name = typeof rawName === 'string' && rawName.trim() !== '' ? rawName.trim() : 'Unknown Student';
                        const avatar = reg.avatar || (reg as any).student?.avatar;
                        const profileId = reg.id || (reg as any).student_id || (reg as any).enrollment_id || (reg as any).student?.id;
                        const isMe = (!!profileId && profileId === user.id) || (name === user.name);
                        return (
                          <tr key={profileId || idx} onClick={() => {
                            if (isMe) navigateToProfile(null);
                            else if (profileId) navigateToProfile(profileId);
                          }} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                            <td className="px-2 sm:px-4 py-3 text-center text-gray-400 dark:text-slate-500 font-mono text-xs sm:text-sm">{idx + 1}</td>
                            <td className="px-2 sm:px-4 py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <LeaderboardAvatar avatar={avatar} name={name} />
                                <span className={`font-semibold ${isMe ? 'text-brand-primary' : 'text-gray-900 dark:text-slate-100'} truncate text-xs sm:text-sm group-hover:text-brand-primary transition-colors`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isMe) navigateToProfile(null);
                                    else if (profileId) navigateToProfile(profileId);
                                  }}>{name}</span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                {reg.level && (
                                  <span className="text-[10px] sm:text-xs" title={reg.level.name}>{reg.level.icon}</span>
                                )}
                                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">{reg.xp} XP</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}</tbody></table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-slate-500 italic py-2 px-1">No one registered yet.</p>
              )}
            </div>
          ) : detail.status === 'finalized' ? (
            <div className="space-y-8 animate-in fade-in duration-700">
              {/* My result section — redesigned to match lesson quiz style */}
              {results?.my_attempt && (
                <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{t('contestYourResult')}</h4>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mt-0.5">{myRank ? `Rank #${myRank}` : t('contestSubmitted')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block mb-1">{t('correctAnswers')}</span>
                      <span className="text-2xl font-mono font-bold text-brand-primary">{results.my_attempt.score}<span className="text-gray-300 dark:text-slate-700 mx-1">/</span>{results.my_attempt.total}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate({ view: 'review', contestId, answers: results.my_attempt?.answers || [] })}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 text-brand-primary border border-brand-primary/20 rounded-xl font-bold text-sm hover:bg-brand-primary/5 transition-all shadow-sm active:scale-[0.98]"
                  >
                    <Search className="w-4 h-4" />
                    {t('reviewAnswers')}
                  </button>
                </div>
              )}

              <div>
                <h3 className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-3 flex items-center gap-2 px-1">
                  <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-amber-500" />
                  </div>
                  {t('contestLeaderboard')}
                </h3>

                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                  <table className="w-full text-left text-sm"><thead className="bg-gray-50/50 dark:bg-slate-800/50 text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider"><tr><th className="px-2 sm:px-4 py-3 font-medium text-center w-10 sm:w-14">Rank</th><th className="px-2 sm:px-4 py-3 font-medium">Student</th><th className="px-2 sm:px-4 py-3 font-medium text-right">Score</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {(results?.leaderboard || []).map((entry: any, idx: number) => {
                        const profileId = entry.id || entry.enrollment_id || entry.student_id || entry.student?.id;
                        const name = entry.name || 'Unknown Student';
                        const isMe = (!!profileId && profileId === user.id) || (name === user.name);
                        const avatar = (entry as any).avatar;
                        
                        const place = entry.rank || idx + 1;
                        const prize = entry.prize;
                        
                        return (
                          <tr key={profileId || idx} onClick={() => {
                            if (isMe) navigateToProfile(null);
                            else if (profileId) navigateToProfile(profileId);
                          }} className={`transition-colors cursor-pointer group ${isMe ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : 'hover:bg-gray-50/5 dark:hover:bg-slate-800/50'}`}>
                            <td className="px-2 sm:px-4 py-3 text-center">
                              <div className="flex justify-center"><PlaceIcon place={place} /></div>
                            </td>
                            <td className="px-2 sm:px-4 py-3">
                              <div className="flex items-center justify-between gap-2 sm:gap-3">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                  <LeaderboardAvatar avatar={avatar} name={name} />
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`font-semibold truncate text-xs sm:text-sm ${isMe ? 'text-brand-primary' : 'text-gray-900 dark:text-slate-100'} group-hover:text-brand-primary transition-colors cursor-pointer`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isMe) navigateToProfile(null);
                                        else if (profileId) navigateToProfile(profileId);
                                      }}>{name as string}</span>
                                    {isMe && <span className="text-[8px] sm:text-[9px] font-bold font-mono uppercase tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25 px-1 sm:px-1.5 py-0.5 rounded-full shrink-0">YOU</span>}
                                  </div>
                                </div>
                                {prize && (
                                  <div className="flex items-center gap-1 shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30">
                                    <PlaceIcon place={prize.place} className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-300 hidden md:inline">{prize.reward_name}</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-300 md:hidden">{prize.reward_name.split(' ')[0]}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-right">
                              <span className={`text-[10px] sm:text-[11px] font-mono font-bold tabular-nums ${isMe ? 'text-brand-primary' : 'text-gray-400 dark:text-slate-500'}`}>{entry.score}/{entry.total}</span>
                            </td>
                          </tr>
                        );
                      })}</tbody></table></div></div>
            </div>
          ) : detail.status === 'open' || detail.status === 'closed' ? (
            <div>
              <h3 className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-3 flex items-center gap-2 px-1">
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
                  <span className="relative flex w-2 h-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
                  </span>
                </div>
                Live Leaderboard
              </h3>
              
              <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                {!liveLeaderboard ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">Loading live rankings...</p>
                  </div>
                ) : liveLeaderboard.leaderboard.length > 0 ? (
                  <table className="w-full text-left text-sm"><thead className="bg-gray-50/50 dark:bg-slate-800/50 text-[10px] sm:text-xs text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider"><tr><th className="px-2 sm:px-4 py-3 font-medium text-center w-10 sm:w-14">Rank</th><th className="px-2 sm:px-4 py-3 font-medium">Student</th><th className="px-2 sm:px-4 py-3 font-medium text-right">Score</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {liveLeaderboard.leaderboard.map((entry, idx) => {
                        const profileId = entry.id || entry.enrollment_id || (entry as any).student_id || (entry as any).student?.id;
                        const name = entry.name || 'Unknown Student';
                        const isMe = (!!profileId && profileId === user.id) || (name === user.name);

                        return (
                          <tr key={profileId || idx} onClick={() => {
                            if (isMe) navigateToProfile(null);
                            else if (profileId) navigateToProfile(profileId);
                          }} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors animate-in fade-in duration-300 cursor-pointer group">
                            <td className="px-2 sm:px-4 py-3 text-center">
                              <div className="flex justify-center"><PlaceIcon place={entry.rank || idx + 1} /></div>
                            </td>
                            <td className="px-2 sm:px-4 py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <LeaderboardAvatar avatar={(entry as any).avatar} name={name} />
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`font-semibold truncate text-xs sm:text-sm ${isMe ? 'text-brand-primary' : 'text-gray-900 dark:text-slate-100'} group-hover:text-brand-primary transition-colors cursor-pointer`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isMe) navigateToProfile(null);
                                        else if (profileId) navigateToProfile(profileId);
                                      }}>
                                      {name}
                                    </span>
                                    {isMe && <span className="text-[8px] sm:text-[9px] font-bold font-mono uppercase tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25 px-1 sm:px-1.5 py-0.5 rounded-full shrink-0">YOU</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-right">
                              <span className={`text-[10px] sm:text-[11px] font-mono font-bold tabular-nums ${isMe ? 'text-brand-primary' : 'text-gray-500 dark:text-slate-400'}`}>{entry.score}/{entry.total}</span>
                            </td>
                          </tr>
                        );
                      })}</tbody></table>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-slate-500 italic py-6 px-1 text-center">{t('waitingSubmissions')}</p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column: Prizes */}
        {detail.status !== 'finalized' && detail.prizes.length > 0 && (
          <div className="order-1 lg:order-2">
            <div>
              <h3 className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-3 flex items-center gap-2 px-1">
                <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Award className="w-3 h-3 text-amber-500" />
                </div>
                {t('contestPrizes')}
              </h3>
              <div className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden">
                {detail.prizes.map(prize => {
                  const g = prizeGradient(prize.place);
                  return (
                    <div key={prize.place} className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0 drop-shadow-sm"><PlaceIcon place={prize.place} /></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight">{prize.reward_name}</p>
                          {prize.reward_description && (
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{prize.reward_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full border ${g.badge}`}>+{prize.xp} XP</span>
                        <span className="text-[10px] font-mono font-bold flex items-center gap-1 text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2 py-1 rounded-full">+{prize.coins} <Coins className="w-3 h-3" /></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action button — hidden if submitted */}
      {!isSubmitted && <ActionButton detail={detail} onAction={handleAction} loading={registering} t={t} />}
    </div>
  );
};

// ── CONTEST PLAY VIEW ──────────────────────────────────────────────────────────
// Lock body scroll while quiz is active (mirrors Lessons quiz behaviour)
function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [active]);
}

const CONTEST_STORAGE_KEY = CONTEST_STORAGE_KEY_FN;

const ContestPlayView: React.FC<{
  contestId: number;
  onNavigate: (nav: ContestNav) => void;
}> = ({ contestId, onNavigate }) => {
  const { t } = useLanguage();
  const { startContest, submitContest } = useContests();

  const [playState, setPlayState] = useState<ContestPlayState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const autoSubmitRef = useRef(false);

  // Lock body scroll while quiz is active (must be called before any early returns)
  useBodyScrollLock(!loading && !error && !!playState);

  // Timer
  const countdown = useCountdown(playState?.contestEndTime ?? null);
  const timerUrgency = useTimerUrgency(playState?.contestEndTime ?? null);

  // Load or fetch questions
  useEffect(() => {
    let cancelled = false;
    const storageKey = CONTEST_STORAGE_KEY(contestId);
    const cached = localStorage.getItem(storageKey);

    if (cached) {
      try {
        const parsed: ContestPlayState = JSON.parse(cached);
        if (!cancelled) { setPlayState(parsed); setLoading(false); }
        return () => { cancelled = true; };
      } catch {}
    }

    startContest(contestId)
      .then(res => {
        const initial: ContestPlayState = {
          questions: res.questions,
          contestEndTime: res.contest_end_time,
          answers: [],
          submitted: false,
        };
        // Always persist — even if this effect was cancelled, the next run can pick it up
        localStorage.setItem(storageKey, JSON.stringify(initial));
        if (!cancelled) setPlayState(initial);
      })
      .catch(e => {
        if (cancelled) return;
        const msg: string = e?.data?.message || e?.message || '';
        if (msg.toLowerCase().includes('already')) {
          // The first (now-cancelled) effect may have already saved questions — try loading them
          const retry = localStorage.getItem(storageKey);
          if (retry) {
            try { setPlayState(JSON.parse(retry)); return; } catch {}
          }
          setError('already_started');
        } else {
          setError(msg || 'Failed to start contest');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [contestId, startContest]);

  // Persist answers to localStorage whenever they change
  const updatePlayState = useCallback((update: Partial<ContestPlayState>) => {
    setPlayState(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...update };
      localStorage.setItem(CONTEST_STORAGE_KEY(contestId), JSON.stringify(next));
      return next;
    });
  }, [contestId]);

  // Auto-submit when timer expires
  useEffect(() => {
    if (!playState?.contestEndTime || playState.submitted) return;
    const msLeft = new Date(playState.contestEndTime).getTime() - Date.now();
    if (msLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const id = setTimeout(() => handleAutoSubmit(), msLeft);
    return () => clearTimeout(id);
  }, [playState?.contestEndTime, playState?.submitted]);

  const handleAutoSubmit = async () => {
    if (autoSubmitRef.current || !playState || playState.submitted) return;
    autoSubmitRef.current = true;
    setAutoSubmitting(true);
    try {
      const res = await submitContest(contestId, playState.answers);
      updatePlayState({ submitted: true, score: res.score, total: res.total });
    } catch {
      updatePlayState({ submitted: true });
    } finally {
      setAutoSubmitting(false);
    }
  };

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (!playState || playState.submitted) return;
    const answers = playState.answers.filter(a => a.question_id !== questionId);
    answers.push({ question_id: questionId, option_id: optionId });
    updatePlayState({ answers });
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      setCurrentQ(q => {
        if (q < playState.questions.length - 1) return q + 1;
        return q;
      });
    }, 300);
  };

  const handleSubmit = async () => {
    if (!playState) return;
    setSubmitting(true);
    try {
      const res = await submitContest(contestId, playState.answers);
      updatePlayState({ submitted: true, score: res.score, total: res.total });
    } catch (e: any) {
      setToast({ msg: e?.data?.message || e?.message || 'Submit failed', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen message="Initializing Battle..." />;

  if (error === 'already_started') return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <BackBtn label={t('contestBackToList')} onClick={() => onNavigate({ view: 'list', contestId: null })} />
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
          <Clock className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-900 dark:text-slate-100">Already submitted</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-xs">Your answers are saved. Results will be available once the contest is finalized.</p>
        </div>
        <button
          onClick={() => onNavigate({ view: 'detail', contestId })}
          className="px-5 py-2.5 rounded-xl text-sm font-bold font-mono text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/10 transition-colors"
        >
          Back to Contest
        </button>
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-4">
      <BackBtn label={t('contestBackToList')} onClick={() => onNavigate({ view: 'list', contestId: null })} />
      <div className="flex flex-col items-center gap-4 py-20 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-500/10">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    </div>
  );

  if (!playState) return null;

  // Post-submit screen — also full-screen portal
  if (playState.submitted) {
    const pct = playState.score !== undefined && playState.total !== undefined
      ? Math.round((playState.score / playState.total) * 100)
      : null;
    return createPortal(
      <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-hidden flex flex-col animate-in fade-in duration-300">
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
          <button
            onClick={() => onNavigate({ view: 'list', contestId: null })}
            className="p-2 -ml-2 text-gray-400 hover:text-brand-primary transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[3px]">
            {t('vocabContest')} #{contestId}
          </span>
          <div className="w-10" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-dark dark:text-white">
                {t('contestSubmitted')}
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">
                {t('contestWaitingResults')}
              </p>
            </div>

            {playState.score !== undefined && playState.total !== undefined && (
              <div className="bg-gray-50 dark:bg-slate-900 rounded-[24px] p-8 border border-gray-100 dark:border-slate-800">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-7xl font-bold text-brand-primary tabular-nums">{playState.score}</span>
                  <span className="text-3xl font-bold text-gray-300 dark:text-slate-600 tabular-nums">/{playState.total}</span>
                </div>
                {pct !== null && (
                  <p className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[3px] mt-3">
                    {pct >= 70 ? 'Great work!' : pct >= 50 ? 'Good effort!' : 'Keep practicing!'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky bottom */}
        <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-8">
          <button
            onClick={() => onNavigate({ view: 'list', contestId: null })}
            className="w-full max-w-4xl mx-auto py-4 rounded-[16px] font-bold font-mono text-sm text-white bg-brand-primary hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 block text-center"
          >
            {t('contestBackToList')}
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const questions = playState.questions;
  const q = questions[currentQ];
  const selectedOption = playState.answers.find(a => a.question_id === q.id)?.option_id;
  const answeredCount = playState.answers.length;
  const allAnswered = answeredCount === questions.length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  // Timer urgency styles
  const timerStyles = {
    normal: {
      bar: 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800',
      icon: 'text-brand-primary',
      text: 'text-gray-700 dark:text-slate-300',
      value: 'text-brand-primary',
      ring: '',
    },
    warning: {
      bar: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200/60 dark:border-amber-700/30',
      icon: 'text-amber-500',
      text: 'text-amber-700 dark:text-amber-300',
      value: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-2 ring-amber-400/30 animate-pulse',
    },
    critical: {
      bar: 'bg-red-50 dark:bg-red-900/20 border-red-200/60 dark:border-red-700/30',
      icon: 'text-red-500',
      text: 'text-red-700 dark:text-red-300',
      value: 'text-red-600 dark:text-red-400',
      ring: 'ring-2 ring-red-400/50 animate-pulse',
    },
  };
  const ts = timerStyles[timerUrgency];

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-hidden flex flex-col animate-in duration-500">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sticky header: close + progress + counter + timer */}
      <div className={`flex items-center gap-3 p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6 transition-all duration-500 ${ts.ring}`}>
        {/* Close / back */}
        <button
          onClick={() => onNavigate({ view: 'detail', contestId })}
          className="p-2 -ml-2 text-gray-400 hover:text-brand-primary transition-colors shrink-0"
          aria-label="Exit contest"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              timerUrgency === 'critical'
                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                : timerUrgency === 'warning'
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                : 'bg-brand-primary shadow-[0_0_10px_rgba(18,194,220,0.5)]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question counter */}
        <span className="text-[11px] font-mono font-bold text-brand-primary uppercase tracking-widest tabular-nums whitespace-nowrap shrink-0">
          {currentQ + 1} / {questions.length}
        </span>

        {/* Timer */}
        <div className={`flex items-center gap-1.5 text-xs font-mono font-bold tabular-nums shrink-0 ${ts.value}`}>
          <Clock className={`w-3.5 h-3.5 ${ts.icon} ${timerUrgency === 'critical' ? 'animate-pulse' : ''}`} />
          {countdown}
        </div>
      </div>

      {/* Scrollable question + options */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 py-2">
          {/* Question card */}
          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-[24px] p-5 md:p-10 text-center border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary opacity-50 rounded-r-full" />
            <span className="text-[10px] md:text-[11px] font-mono font-bold text-brand-primary uppercase tracking-[3px] mb-2 block opacity-70">Question</span>
            <h3 className={`${q.question_text.length > 80 ? 'text-lg md:text-2xl' : 'text-xl md:text-3xl'} font-bold text-brand-dark dark:text-white leading-tight mb-3`}>
              {q.question_text}
            </h3>
            <p className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-slate-400 italic opacity-80">Choose the correct answer from the options below</p>
          </div>

          {/* Options — 2-col on all screen sizes (matches Lessons quiz) */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            {q.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(q.id, opt.id)}
                  className={`w-full p-3 md:p-5 rounded-[20px] border-2 text-left flex items-center gap-3 transition-all duration-200 group/opt ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 ring-4 ring-brand-primary/10 scale-[1.01]'
                      : 'border-gray-100 dark:border-slate-800/50 hover:border-brand-primary/40 bg-white dark:bg-slate-900 shadow-sm active:scale-[0.99]'
                  }`}
                >
                  <div className={`w-5 h-5 md:w-6 md:h-6 rounded-[6px] md:rounded-[8px] flex items-center justify-center border-2 shrink-0 transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary text-white scale-110'
                      : 'border-gray-200 dark:border-slate-700 group-hover/opt:border-brand-primary/50'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />}
                  </div>
                  <span className={`text-[13px] md:text-base font-bold flex-1 leading-snug ${isSelected ? 'text-brand-dark dark:text-white' : 'text-gray-600 dark:text-slate-300'}`}>
                    {opt.content}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky bottom nav */}
      <div className="bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 px-4 py-3 md:px-8 md:py-5 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:pb-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              className="px-4 md:px-10 py-3.5 rounded-[16px] font-bold text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest font-mono"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline">{t('previousQuestion')}</span>
              <span className="md:hidden">Back</span>
            </button>

            {currentQ === questions.length - 1 && (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting || autoSubmitting}
                className="px-8 md:px-12 py-3.5 bg-gradient-to-r from-brand-primary to-cyan-500 text-white rounded-[16px] font-bold text-sm hover:shadow-lg hover:shadow-brand-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
              >
                {(submitting || autoSubmitting) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
                {t('finishQuiz')}
              </button>
            )}
          </div>

          {/* Quick-jump dots */}
          <div className="flex flex-wrap gap-1.5 mt-2.5 justify-center">
            {questions.map((question, idx) => {
              const answered = playState.answers.some(a => a.question_id === question.id);
              const isCurrent = idx === currentQ;
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQ(idx)}
                  className={`w-6 h-6 rounded-md text-[9px] font-bold font-mono transition-all duration-150 hover:scale-110 active:scale-90
                    ${isCurrent
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/40 scale-110'
                      : answered
                      ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Rank badge for winners list (matches Leaderboard.tsx podium style)
const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.4)] ring-2 ring-amber-200 dark:ring-amber-500/30">
      <Crown className="w-5 h-5 text-amber-900 fill-amber-900/20" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center shadow-[0_4px_12px_rgba(148,163,184,0.3)] ring-2 ring-slate-100 dark:ring-slate-500/30">
      <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-100">2</span>
    </div>
  );
  if (rank === 3) return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-orange-400 dark:from-orange-700 dark:to-orange-800 flex items-center justify-center shadow-[0_4px_12px_rgba(251,146,60,0.3)] ring-2 ring-orange-100 dark:ring-orange-600/30">
      <span className="text-sm font-bold font-mono text-orange-900 dark:text-orange-100">3</span>
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center border border-gray-100 dark:border-slate-700">
      <span className="text-[12px] font-bold text-gray-400 dark:text-slate-500 font-mono">#{rank}</span>
    </div>
  );
};

// ── CONTEST REVIEW VIEW ───────────────────────────────────────────────────────
const ContestReviewView: React.FC<{
  answers: any[];
  onNavigate: (nav: ContestNav) => void;
  contestId: number;
}> = ({ answers, onNavigate, contestId }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!answers || answers.length === 0) return null;
  const item = answers[currentIndex];
  if (!item) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex flex-col bg-white dark:bg-slate-950 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
        <h4 className="font-bold text-lg md:text-xl text-brand-dark dark:text-white tracking-tight">{t('detailedReview')}</h4>
        <div className="flex items-center gap-4">
          <div className="text-[11px] font-mono font-bold text-brand-primary uppercase tracking-widest whitespace-nowrap tabular-nums">
            {currentIndex + 1} / {answers.length}
          </div>
          <button onClick={() => onNavigate({ view: 'detail', contestId })} className="p-2 -ml-2 text-gray-400 hover:text-brand-primary transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-5 custom-scrollbar">
        <div className="max-w-4xl mx-auto py-2">
          <div className={`rounded-[24px] border-2 overflow-hidden transition-all shadow-sm ${item.is_correct ? 'border-emerald-500/20 bg-emerald-50/5' : 'border-red-500/20 bg-red-50/5'}`}>
            <div className="p-4 md:p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-[2px] ${item.is_correct ? 'text-emerald-500' : 'text-red-500'}`}>Question {currentIndex + 1}</span>
                  <h5 className="font-bold text-[16px] md:text-lg text-brand-dark dark:text-white leading-snug">{item.question_text}</h5>
                </div>
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm ${item.is_correct ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                  {item.is_correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {item.options?.map((option: any) => {
                  const isSelected = item.selected_option_id === option.id;
                  const isCorrect = option.is_correct;
                  let stateClass = 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500';
                  if (isSelected && isCorrect) stateClass = 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20';
                  else if (isSelected && !isCorrect) stateClass = 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20';
                  else if (isCorrect) stateClass = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30';

                  return (
                    <div key={option.id} className={`p-3 md:p-4 rounded-[12px] border text-[12px] md:text-[14px] font-bold flex items-center gap-3 transition-all ${stateClass}`}>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : isSelected ? <XCircle className="w-4 h-4 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20 shrink-0" />}
                      <span>{option.content}</span>
                    </div>
                  );
                })}
              </div>

              {item.explanation && (
                <div className="bg-white/80 dark:bg-slate-900/50 p-4 rounded-[16px] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-30"></div>
                  <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[2px] block mb-1 opacity-70">{t('explanation')}</span>
                  <p className="text-[11px] md:text-[13px] font-medium text-gray-600 dark:text-slate-400 italic leading-relaxed">{item.explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-5 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
            disabled={currentIndex === 0}
            className="flex-1 md:flex-none px-6 md:px-10 py-3 rounded-[12px] font-bold text-xs md:text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest font-mono"
          >
            <ChevronLeft className="w-4 h-4" /> <span className="hidden md:inline">{t('previousQuestion') || 'Previous'}</span><span className="md:hidden">{t('back')}</span>
          </button>

          {currentIndex === answers.length - 1 ? (
            <button onClick={() => onNavigate({ view: 'detail', contestId })} className="flex-[2] md:flex-none px-12 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-2xl transition-all uppercase tracking-widest font-mono block text-center active:scale-95 rounded-[12px]">
              {t('backToOverview')}
            </button>
          ) : (
            <button
              onClick={() => currentIndex < answers.length - 1 && setCurrentIndex(prev => prev + 1)}
              className="flex-[2] md:flex-none px-12 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[12px] font-bold text-[14px] hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
            >
              {t('nextQuestion') || 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── SHARED BACK BUTTON ─────────────────────────────────────────────────────────
const BackBtn: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-gray-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors duration-150 group active:scale-95"
  >
    <ChevronLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
    {label}
  </button>
);

// ── ACTION BUTTON (shared for detail view) ─────────────────────────────────────
const ActionButton: React.FC<{
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

// ── ROOT CONTESTS PAGE ─────────────────────────────────────────────────────────

let globalContestNav: ContestNav = { view: 'list', contestId: null };

const ContestsInner: React.FC = () => {
  const [nav, setNav] = useState<ContestNav>(globalContestNav);

  const handleNavigate = useCallback((next: ContestNav) => {
    globalContestNav = next;
    setNav(next);
  }, []);

  switch (nav.view) {
    case 'list':
      return <ContestListView onNavigate={handleNavigate} />;
    case 'detail':
      return <ContestDetailView contestId={nav.contestId!} onNavigate={handleNavigate} />;
    case 'play':
      return <ContestPlayView contestId={nav.contestId!} onNavigate={handleNavigate} />;
    case 'review': {
      // Find results from detail if already loaded or re-fetch (handled by component)
      return <ContestReviewView contestId={nav.contestId!} onNavigate={handleNavigate} answers={nav.answers || []} />;
    }
    default:
      return <ContestListView onNavigate={handleNavigate} />;
  }
};

interface ContestNav {
  view: ContestView;
  contestId: number | null;
  answers?: any[];
}

export const Contests: React.FC = () => (
  <ContestProvider>
    <ContestsInner />
  </ContestProvider>
);

export default Contests;
