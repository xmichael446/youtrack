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
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
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
      label: 'Closed',
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

// Place medal/icon
function PlaceIcon({ place, className = "w-5 h-5" }: { place: number; className?: string }) {
  if (place === 1) return <Medal className={`${className} text-amber-500`} />;
  if (place === 2) return <Medal className={`${className} text-slate-400`} />;
  if (place === 3) return <Medal className={`${className} text-orange-400`} />;
  return (
    <span className={`${className} rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold font-mono text-gray-500 dark:text-slate-400`}>
      {place}
    </span>
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
type ContestView = 'list' | 'detail' | 'play' | 'results';

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
      onNavigate({ view: 'results', contestId: item.id });
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
            <span>You're registered! The "Enter Contest" button will appear here when it goes live.</span>
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
      setToast({ msg: err?.data?.message || err?.message || 'Registration failed', type: 'error' });
    } finally {
      setRegisteringId(null);
    }
  };

  // Show full-screen loader before any contests are loaded (hides header too)
  if (loading && contests.length === 0) {
    return <LoadingScreen message="Finding battles..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-start gap-4 px-1">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-cyan-600 flex items-center justify-center shadow-xl shadow-brand-primary/30 shrink-0 ring-2 ring-brand-primary/20">
          <Swords className="w-7 h-7 md:w-8 md:h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-dark dark:text-white">
            {t('contests')}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-0.5">
            {t('contestsSubtitle')}
          </p>
        </div>
        <button
          onClick={fetchContests}
          disabled={loading}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-brand-primary transition-all duration-200 active:scale-90 mt-1"
          title="Refresh"
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
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Check back soon for upcoming contests</p>
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
  const { navigateToProfile } = useNavigation();
  const { getContestDetail, registerForContest, getContestResults, getContestLeaderboard } = useContests();
  const [detail, setDetail] = useState<ContestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [results, setResults] = useState<ContestResultsData | null>(null);
  const [liveLeaderboard, setLiveLeaderboard] = useState<ContestLeaderboardEntry[] | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

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
      .catch(e => setError(e?.message || 'Failed to load contest'))
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
      <LoadingScreen message="Inspecting battle..." />
    </div>
  );

  if (error || !detail) return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <BackBtn label={t('contestBackToList')} onClick={() => onNavigate({ view: 'list', contestId: null })} />
      <div className="flex flex-col items-center gap-3 py-20 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-500/10">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-red-500 font-medium">{error || 'Contest not found'}</p>
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

          {/* Prize name pills */}
          {detail.prizes.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {detail.prizes.map(p => (
                <div key={p.place} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                  <PlaceIcon place={p.place} className="w-3.5 h-3.5" />
                  <span className="text-gray-700 dark:text-slate-300">{p.reward_name}</span>
                </div>
              ))}
            </div>
          )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column: Registrations or Live/Final Leaderboard */}
        <div className="order-2 lg:order-1">
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
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-medium text-center w-12">#</th>
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium text-right">XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {detail.registrations.map((reg, idx) => (
                        <tr key={reg.id} onClick={() => navigateToProfile(reg.id)} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <td className="px-4 py-3 text-center text-gray-400 dark:text-slate-500 font-mono">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {reg.avatar ? (
                                <img src={`${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')}/${reg.avatar.replace(/^\/+/, '')}`} alt={reg.full_name} className="w-8 h-8 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-slate-800" />
                              ) : (
                                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-brand-primary to-cyan-600">
                                  {reg.full_name.charAt(0)}
                                </div>
                              )}
                              <span className="font-semibold text-gray-900 dark:text-slate-100 truncate">{reg.full_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {reg.level && (
                                <span className="text-xs" title={reg.level.name}>{reg.level.icon}</span>
                              )}
                              <span className="text-[10px] font-mono font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2 py-0.5 rounded-full">{reg.xp} XP</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-slate-500 italic py-2 px-1">No one registered yet.</p>
              )}
            </div>
          ) : detail.status === 'finalized' && results ? (
            <div>
              <h3 className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-3 flex items-center gap-2 px-1">
                <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-amber-500" />
                </div>
                {t('contestLeaderboard')}
              </h3>

              {/* My result chip */}
              {results.my_attempt && (
                <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20">
                  <div className="w-1 self-stretch rounded-full bg-brand-primary shrink-0" />
                  <span className="text-xs font-mono font-bold text-brand-primary uppercase tracking-wide">{t('contestYourResult')}</span>
                  <span className="ml-auto text-base font-bold text-gray-900 dark:text-white tabular-nums">
                    {results.my_attempt.score}/{results.my_attempt.total}
                  </span>
                  <span className="text-sm font-mono text-gray-500 dark:text-slate-400">#{results.my_attempt.rank}</span>
                  {results.my_attempt.prize && (
                    <span className="text-lg"><PlaceIcon place={results.my_attempt.prize.place} /></span>
                  )}
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-medium text-center w-14">Rank</th>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {results.leaderboard.map(entry => {
                      const isMe = results.my_attempt?.rank === entry.rank;
                      return (
                        <tr key={entry.enrollment_id} onClick={() => navigateToProfile(entry.enrollment_id)} className={`transition-colors cursor-pointer ${isMe ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : 'hover:bg-gray-50/50 dark:hover:bg-slate-800/50'}`}>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center"><PlaceIcon place={entry.rank} /></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold truncate ${isMe ? 'text-brand-primary' : 'text-gray-900 dark:text-slate-100'}`}>
                                {entry.full_name || (entry as any).name}
                              </span>
                              {isMe && <span className="text-[9px] font-bold font-mono uppercase tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25 px-1.5 py-0.5 rounded-full">YOU</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-xs font-mono font-bold tabular-nums ${isMe ? 'text-brand-primary' : 'text-gray-500 dark:text-slate-400'}`}>{entry.score}/{entry.total}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                ) : liveLeaderboard.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-medium text-center w-14">Rank</th>
                        <th className="px-4 py-3 font-medium">Student</th>
                        <th className="px-4 py-3 font-medium text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {liveLeaderboard.map((entry, idx) => (
                        <tr key={entry.enrollment_id} onClick={() => navigateToProfile(entry.enrollment_id)} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors animate-in fade-in duration-300 cursor-pointer">
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center"><PlaceIcon place={entry.rank || idx + 1} /></div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900 dark:text-slate-100 truncate">
                              {entry.full_name || (entry as any).name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-mono font-bold text-gray-500 dark:text-slate-400 tabular-nums">{entry.score}/{entry.total}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-slate-500 italic py-6 px-1 text-center">Waiting for submissions...</p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column: Prizes */}
        <div className="order-1 lg:order-2">
          {detail.prizes.length > 0 && (
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
          )}
        </div>
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

// ── CONTEST RESULTS VIEW ───────────────────────────────────────────────────────
const ContestResultsView: React.FC<{
  contestId: number;
  onNavigate: (nav: ContestNav) => void;
}> = ({ contestId, onNavigate }) => {
  const { t } = useLanguage();
  const { getContestResults } = useContests();
  const [results, setResults] = useState<ContestResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewExpanded, setReviewExpanded] = useState(false);

  useEffect(() => {
    getContestResults(contestId)
      .then(d => { setResults(d); setError(null); })
      .catch(e => setError(e?.data?.message || e?.message || 'Results not available yet'))
      .finally(() => setLoading(false));
  }, [contestId, getContestResults]);

  if (loading) return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <BackBtn label={t('contestBackToList')} onClick={() => onNavigate({ view: 'list', contestId: null })} />
      <Shimmer className="h-40 w-full rounded-2xl" />
      <Shimmer className="h-64 w-full rounded-2xl" />
    </div>
  );

  if (error || !results) return (
    <div className="space-y-4">
      <BackBtn label={t('contestBackToList')} onClick={() => onNavigate({ view: 'list', contestId: null })} />
      <div className="flex flex-col items-center gap-4 py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
          <Clock className="w-5 h-5 text-gray-400 dark:text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">{error || 'Results not yet available'}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Check back after the contest is finalized.</p>
        </div>
      </div>
    </div>
  );

  const me = results.my_attempt;
  // Determine the score color
  const pct = me ? Math.round((me.score / me.total) * 100) : null;
  const scoreColor = pct !== null
    ? pct >= 80 ? 'text-brand-primary'
    : pct >= 60 ? 'text-emerald-400'
    : pct >= 40 ? 'text-amber-400'
    : 'text-red-400'
    : 'text-brand-primary';

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <BackBtn label={t('contestBackToList')} onClick={() => onNavigate({ view: 'list', contestId: null })} />

      {/* My result card — light theme */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Brand accent top strip */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-primary via-cyan-400 to-brand-primary/40" />

        <div className="p-5 md:p-6">
          <p className="text-[10px] font-mono text-brand-primary uppercase tracking-[3px] mb-1">
            {t('vocabContest')} #{results.number}
          </p>
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-4">{t('contestYourResult')}</h2>

          {me ? (
            <div className="flex items-stretch gap-3 flex-wrap">
              {/* Score chip */}
              <div className="flex flex-col items-center justify-center px-4 py-3 rounded-2xl min-w-[80px] bg-brand-primary/5 border border-brand-primary/15">
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-4xl md:text-5xl font-bold tabular-nums leading-none ${scoreColor}`}>{me.score}</span>
                  <span className="text-lg md:text-xl font-bold text-gray-300 dark:text-slate-600 tabular-nums leading-none">/{me.total}</span>
                </div>
                <p className="text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mt-1.5">{t('contestScoreLabel')}</p>
              </div>

              {/* Rank chip */}
              <div className="flex flex-col items-center justify-center px-4 py-3 rounded-2xl min-w-[64px] bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tabular-nums leading-none">#{me.rank}</span>
                <p className="text-[9px] font-mono text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mt-1.5">{t('contestRankLabel')}</p>
              </div>

              {/* Prize chip (if won) */}
              {me.prize && (
                <div className="flex flex-col items-center justify-center px-4 py-3 rounded-2xl min-w-[64px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30">
                  <div className="mb-1">
                    <PlaceIcon place={me.prize.place} className="w-8 h-8" />
                  </div>
                  <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mt-1.5 text-center leading-snug max-w-[120px]">{me.prize.reward_name}</p>
                  <p className="text-[9px] font-mono text-amber-500/60 uppercase tracking-[2px] mt-0.5">{t('contestPrizeWon')}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-slate-500 italic">{t('contestDidNotParticipate')}</p>
          )}
        </div>
      </div>

      {/* Leaderboard — flat section, no outer card */}
      {results.leaderboard.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1 px-1">
            <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
              <Trophy className="w-3 h-3 text-amber-500" />
            </div>
            <h3 className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[2px]">
              {t('contestLeaderboard')}
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {results.leaderboard.map(entry => {
              const isMe = me ? entry.rank === me.rank : false;
              return (
                <div
                  key={entry.enrollment_id}
                  className={`flex items-center gap-3 px-1 py-3 relative overflow-hidden transition-colors duration-150
                    ${isMe ? 'bg-brand-primary/5 dark:bg-brand-primary/8 -mx-1 px-2 rounded-xl' : ''}
                  `}
                >
                  {/* "YOU" accent left border */}
                  {isMe && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-primary rounded-r-full" />
                  )}

                  <div className="w-7 flex justify-center shrink-0">
                    <PlaceIcon place={entry.rank} />
                  </div>

                  <span className={`flex-1 text-sm font-semibold truncate ${isMe ? 'text-brand-primary dark:text-brand-primary' : 'text-gray-900 dark:text-slate-100'}`}>
                    {entry.full_name || (entry as any).name}
                  </span>

                  {isMe && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25 shrink-0">
                      YOU
                    </span>
                  )}

                  <span className={`text-xs font-mono font-bold tabular-nums shrink-0 ${isMe ? 'text-brand-primary' : 'text-gray-500 dark:text-slate-400'}`}>
                    {entry.score}/{entry.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Personal review */}
      {me && me.answers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
          <button
            onClick={() => setReviewExpanded(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150"
          >
            <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[2px] flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-brand-primary/10 flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-brand-primary" />
              </div>
              {t('detailedReview')}
            </span>
            <ChevronRight className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${reviewExpanded ? 'rotate-90' : ''}`} />
          </button>

          {reviewExpanded && (
            <div className="px-5 pb-5 space-y-6 border-t border-gray-50 dark:border-slate-800/80 pt-5">
              {me.answers.map((ans, idx) => (
                <div key={ans.question_id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold font-mono text-gray-400 dark:text-slate-500 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-slate-100 tracking-tight">{ans.word}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{ans.question_text}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 ml-9">
                    {ans.options.map(opt => {
                      const isSelected = opt.id === ans.selected_option_id;
                      const isCorrect = opt.is_correct;
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm border transition-colors ${
                            isCorrect
                              ? 'border-emerald-200 dark:border-emerald-700/50 bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                              : isSelected
                              ? 'border-red-200 dark:border-red-700/50 bg-red-50/80 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                              : 'border-gray-100 dark:border-slate-700/50 text-gray-400 dark:text-slate-500 bg-gray-50/50 dark:bg-slate-800/30'
                          }`}
                        >
                          {isCorrect
                            ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            : isSelected
                            ? <XCircle className="w-3.5 h-3.5 shrink-0" />
                            : <span className="w-3.5 h-3.5 shrink-0" />
                          }
                          <span className={isSelected || isCorrect ? 'font-semibold' : ''}>{opt.content}</span>
                        </div>
                      );
                    })}
                  </div>
                  {ans.explanation && (
                    <div className="ml-9 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                      <p className="text-[9px] font-mono font-bold text-blue-500 uppercase tracking-[2px] mb-1.5">{t('explanation')}</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{ans.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
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
  if (detail.status === 'finalized') {
    return (
      <button
        onClick={onAction}
        className="w-full py-3.5 rounded-2xl font-bold font-mono text-sm text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/15 border border-brand-primary/25 hover:border-brand-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2"
      >
        <Trophy className="w-5 h-5" />
        {t('contestViewResults')}
      </button>
    );
  }
  return null;
};

// ── ROOT CONTESTS PAGE ─────────────────────────────────────────────────────────
const ContestsInner: React.FC = () => {
  const [nav, setNav] = useState<ContestNav>({ view: 'list', contestId: null });

  const handleNavigate = useCallback((next: ContestNav) => {
    setNav(next);
  }, []);

  switch (nav.view) {
    case 'list':
      return <ContestListView onNavigate={handleNavigate} />;
    case 'detail':
      return <ContestDetailView contestId={nav.contestId!} onNavigate={handleNavigate} />;
    case 'play':
      return <ContestPlayView contestId={nav.contestId!} onNavigate={handleNavigate} />;
    case 'results':
      return <ContestResultsView contestId={nav.contestId!} onNavigate={handleNavigate} />;
    default:
      return <ContestListView onNavigate={handleNavigate} />;
  }
};

export const Contests: React.FC = () => (
  <ContestProvider>
    <ContestsInner />
  </ContestProvider>
);

export default Contests;
