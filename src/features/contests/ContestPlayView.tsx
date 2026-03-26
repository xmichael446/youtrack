import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Trophy,
  Clock,
  CheckCircle2,
  ChevronLeft,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useContests } from '../../context/ContestContext';
import { useNavigation } from '../../context/NavigationContext';
import LoadingScreen from '../../components/LoadingScreen';
import Toast from '../../components/ui/Toast';
import BackButton from '../../components/ui/BackButton';
import { useCountdown, useTimerUrgency } from '../../hooks/useCountdown';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { CONTEST_STORAGE_KEY, ContestPlayState } from '../../utils/contestHelpers';
import type { ContestNav } from './contestTypes';
import type { ContestAnswer, QuizQuestion } from '../../services/apiTypes';

const ContestPlayView: React.FC<{
  contestId: number;
  onNavigate: (nav: ContestNav) => void;
}> = ({ contestId, onNavigate }) => {
  const { t } = useLanguage();
  const { goBack } = useNavigation();
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
        // Always persist -- even if this effect was cancelled, the next run can pick it up
        localStorage.setItem(storageKey, JSON.stringify(initial));
        if (!cancelled) setPlayState(initial);
      })
      .catch(e => {
        if (cancelled) return;
        const msg: string = e?.data?.message || e?.message || '';
        if (msg.toLowerCase().includes('already')) {
          // The first (now-cancelled) effect may have already saved questions -- try loading them
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
      <BackButton label={t('contestBackToList')} onClick={() => goBack('contests')} />
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
          <Clock className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-900 dark:text-slate-100">Already submitted</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-xs">Your answers are saved. Results will be available once the contest is finalized.</p>
        </div>
        <button
          onClick={() => goBack('contests')}
          className="px-5 py-2.5 rounded-xl text-sm font-bold font-mono text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/10 transition-colors"
        >
          Back to Contest
        </button>
      </div>
    </div>
  );

  if (error) return (
    <div className="space-y-4">
      <BackButton label={t('contestBackToList')} onClick={() => goBack('contests')} />
      <div className="flex flex-col items-center gap-4 py-20 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-500/10">
        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-red-500 font-medium">{error}</p>
      </div>
    </div>
  );

  if (!playState) return null;

  // Post-submit screen -- also full-screen portal
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
          onClick={() => goBack('contests')}
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

          {/* Options -- 2-col on all screen sizes (matches Lessons quiz) */}
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

export default ContestPlayView;
