import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Search,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  Zap,
  CheckCircle2,
  XCircle,
  Trophy,
  Loader2,
  PlayCircle,
  AlertTriangle,
  Coins
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useLessons } from '../../context/LessonsContext';
import { useDashboard } from '../../context/DashboardContext';
import {
  QuizSessionData,
  QuizQuestionsData,
  QuizSubmitResponseData,
  QuizQuestionResult
} from '../../services/apiTypes';
import { ShowToast } from './lessonTypes';

const QuizSection: React.FC<{
  lessonId: number;
  showToast: ShowToast;
  initialData?: QuizSessionData | null;
}> = ({ lessonId, showToast, initialData }) => {
  const { t } = useLanguage();
  const { getQuizQuestions, getQuizReview, submitQuiz, fetchLessons } = useLessons();
  const { refetch: refetchDashboard } = useDashboard();

  const [quizSummary, setQuizSummary] = useState<QuizSessionData | null>(initialData || null);
  const [questionsData, setQuestionsData] = useState<QuizQuestionsData | null>(null);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<'info' | 'article' | 'solving' | 'results' | 'review'>('info');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<QuizSubmitResponseData | null>(null);
  const [reviewData, setReviewData] = useState<QuizQuestionResult[] | null>(null);
  const [showReviewWarning, setShowReviewWarning] = useState<number | null>(null);

  const sortedAttempts = React.useMemo(() => {
    if (!quizSummary?.previous_attempts) return [];
    return [...quizSummary.previous_attempts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [quizSummary?.previous_attempts]);

  useEffect(() => {
    setQuizSummary(initialData || null);
  }, [initialData]);

  useEffect(() => {
    if (mode !== 'info') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mode]);

  const startQuiz = async (initialMode: 'solving' | 'article' = 'solving') => {
    if (!quizSummary) return;
    try {
      setLoading(true);
      const res = await getQuizQuestions(quizSummary.session_id);
      if (res.success) {
        setQuestionsData(res.data);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setMode(res.data.source_text && initialMode === 'article' ? 'article' : 'solving');
      }
    } catch (err: any) {
      showToast(err.message || t('failedToLoadQuestions'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderArticleMode = () => (
    <div className="flex flex-col h-full bg-surface-primary dark:bg-surface-dark-primary animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-surface-secondary dark:border-surface-dark-elevated bg-surface-primary/80 dark:bg-surface-dark-primary/80 backdrop-blur-md sticky top-0 z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
        <button onClick={() => setMode('info')} className="p-2 -ml-2 text-text-theme-muted hover:text-brand-primary transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-caption font-bold text-brand-primary uppercase tracking-widest opacity-70">{t('quizLevel')} {questionsData!.vocab_level}</span>
          <span className="text-body font-bold text-brand-dark dark:text-text-theme-dark-primary mt-0.5">{t('sourceArticle')}</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <div className="max-w-3xl mx-auto py-4 md:py-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-4">
              <BookOpen className="w-4 h-4 text-brand-primary" />
              <span className="text-caption font-bold text-brand-primary uppercase tracking-wider">{t('readArticleTitle')}</span>
            </div>
            <p className="text-body text-text-theme-secondary dark:text-text-theme-dark-secondary max-w-md mx-auto leading-relaxed">{t('readArticleDesc')}</p>
          </div>

          <div className="bg-surface-secondary dark:bg-surface-dark-primary/50 rounded-[24px] p-6 md:p-10 border border-surface-secondary dark:border-surface-dark-elevated shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary opacity-30"></div>
            <p className="text-h4 md:text-h3 text-text-theme-primary dark:text-text-theme-dark-secondary leading-[1.85] whitespace-pre-wrap pl-2">
              {questionsData!.source_text}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 bg-surface-primary dark:bg-surface-dark-primary border-t border-surface-secondary dark:border-surface-dark-elevated shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-8">
        <button
          onClick={() => setMode('solving')}
          className="w-full max-w-4xl mx-auto py-4 rounded-[16px] font-bold text-body bg-brand-primary hover:bg-brand-primary/90 text-white shadow-brand-primary/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 block"
        >
          <PlayCircle className="w-4 h-4" />
          {t('backToQuiz')}
        </button>
      </div>
    </div>
  );

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setTimeout(() => {
      setCurrentQuestionIndex(prev => {
        if (questionsData && prev < questionsData.questions.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 400);
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex(prev => {
      if (questionsData && prev < questionsData.questions.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };

  const goToPrevQuestion = () => {
    setCurrentQuestionIndex(prev => prev > 0 ? prev - 1 : prev);
  };

  const handleSubmitQuiz = async () => {
    if (!quizSummary || !questionsData) return;

    if (Object.keys(answers).length < questionsData.questions.length) {
      showToast(t('answerAllQuestions'), 'error');
      return;
    }

    try {
      setSubmitting(true);
      const submission = {
        session_id: quizSummary.session_id,
        answers: Object.entries(answers).map(([id, optId]) => ({
          question_id: parseInt(id),
          option_id: optId
        }))
      };

      const res = await submitQuiz(submission);
      if (res.success) {
        setLastSubmissionResult(res.data);
        setMode('results');
        refetchDashboard();
        fetchLessons();
      }
    } catch (err: any) {
      showToast(err.message || t('failedToSubmitQuiz'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const loadReview = async (attemptId: number) => {
    try {
      setLoading(true);
      const res = await getQuizReview(attemptId);
      if (res.success) {
        setReviewData(res.data.answers);
        setCurrentQuestionIndex(0);
        setMode('review');
        setShowReviewWarning(null);
      }
    } catch (err: any) {
      showToast(err.message || t('failedToLoadReview'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (attemptId: number) => {
    if (quizSummary?.already_awarded || quizSummary?.has_reviewed) {
      loadReview(attemptId);
    } else {
      setShowReviewWarning(attemptId);
    }
  };

  if (!quizSummary) return (
    <div className="bg-surface-secondary dark:bg-surface-dark-secondary/50 p-8 rounded-[14px] border border-surface-secondary dark:border-surface-dark-elevated text-center">
      <ClipboardList className="w-10 h-10 text-text-theme-muted dark:text-text-theme-dark-muted mx-auto mb-3" />
      <p className="text-body text-text-theme-muted dark:text-text-theme-dark-muted">{t('noQuizYet')}</p>
    </div>
  );

  const renderSolvingMode = () => {
    const questionText = questionsData!.questions[currentQuestionIndex].question_text;
    const isLongText = questionText.length > 80;

    return (
      <div className="flex flex-col h-full bg-surface-primary dark:bg-surface-dark-primary animate-in fade-in duration-300">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-surface-secondary dark:border-surface-dark-elevated bg-surface-primary/80 dark:bg-surface-dark-primary/80 backdrop-blur-md sticky top-0 z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
          <button onClick={() => setMode('info')} className="p-2 -ml-2 text-text-theme-muted hover:text-brand-primary transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 px-4 md:px-12 flex items-center justify-center gap-4">
            <div className="flex-1 max-w-md h-2 bg-surface-secondary dark:bg-surface-dark-secondary rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(18,194,220,0.5)]" style={{ width: `${((currentQuestionIndex + 1) / questionsData!.questions.length) * 100}%` }} />
            </div>
          </div>
          <div className="text-caption font-bold text-brand-primary uppercase tracking-widest whitespace-nowrap tabular-nums">
            {currentQuestionIndex + 1} / {questionsData!.questions.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-2">
            <div className="bg-surface-secondary dark:bg-surface-dark-primary/50 rounded-[24px] p-4 md:p-10 text-center border border-surface-secondary dark:border-surface-dark-elevated shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary opacity-50"></div>
              <span className="section-label text-brand-primary mb-2 block opacity-70">{t('question')}</span>
              <h3 className={`${isLongText ? 'text-h3 md:text-h2' : 'text-h2 md:text-h1'} text-brand-dark dark:text-text-theme-dark-primary leading-tight mb-4`}>
                {questionText}
              </h3>
              <p className="text-caption md:text-body text-text-theme-secondary dark:text-text-theme-dark-secondary max-w-lg mx-auto italic opacity-80">{t('chooseCorrectAnswer')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pb-10">
              {questionsData!.questions[currentQuestionIndex].options.map((option) => {
                const isSelected = answers[questionsData!.questions[currentQuestionIndex].id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(questionsData!.questions[currentQuestionIndex].id, option.id)}
                    className={`w-full p-4 md:p-6 rounded-[20px] border-2 text-left flex items-center gap-4 transition-all duration-200 group/opt ${isSelected
                        ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 ring-4 ring-brand-primary/10 scale-[1.01]'
                        : 'border-surface-secondary dark:border-surface-dark-elevated/50 hover:border-brand-primary/40 bg-surface-primary dark:bg-surface-dark-primary shadow-sm'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-[8px] flex items-center justify-center border-2 shrink-0 transition-all ${isSelected ? 'border-brand-primary bg-brand-primary text-white scale-110' : 'border-surface-secondary dark:border-surface-dark-elevated group-hover/opt:border-brand-primary/50'}`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className={`text-body font-bold flex-1 ${isSelected ? 'text-brand-dark dark:text-text-theme-dark-primary' : 'text-text-theme-secondary dark:text-text-theme-dark-secondary'}`}>{option.content}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 bg-surface-primary dark:bg-surface-dark-primary border-t border-surface-secondary dark:border-surface-dark-elevated shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
            <button
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 md:px-10 py-4 rounded-[16px] font-bold text-caption md:text-body text-text-theme-secondary hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary disabled:opacity-30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" /> <span className="hidden md:inline">{t('previousQuestion')}</span><span className="md:hidden">{t('back')}</span>
            </button>

            {currentQuestionIndex === questionsData!.questions.length - 1 && (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || Object.keys(answers).length < questionsData!.questions.length}
                className="px-12 py-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-[16px] font-bold text-body shadow-brand-primary/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                {t('finishQuiz')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResultsMode = () => (
    <div className="flex flex-col h-full bg-surface-primary dark:bg-surface-dark-primary p-4 md:p-8 overflow-y-auto animate-in fade-in duration-300 custom-scrollbar pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-8">
      <div className="max-w-md mx-auto w-full text-center py-6 space-y-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-body font-semibold ${lastSubmissionResult!.passed ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
          {lastSubmissionResult!.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {lastSubmissionResult!.passed ? t('passed') : t('failed')}
        </div>

        <div className="space-y-1">
          <p className="text-caption text-text-theme-muted uppercase tracking-wider">{t('finalScore')}</p>
          <p className="text-[40px] md:text-[48px] font-bold text-brand-dark dark:text-text-theme-dark-primary tabular-nums leading-none">
            {lastSubmissionResult!.score}
            <span className="text-h2 text-text-theme-muted dark:text-text-theme-dark-muted mx-1">
              /
            </span>
            <span className="text-h1 text-text-theme-secondary dark:text-text-theme-dark-secondary">{lastSubmissionResult!.total}</span>
          </p>
        </div>

        {lastSubmissionResult!.points_awarded ? (
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-full text-body font-semibold">
              <Zap className="w-3.5 h-3.5 fill-current" /> +{lastSubmissionResult!.xp} XP
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-full text-body font-semibold">
              <Coins className="w-3.5 h-3.5" /> +{lastSubmissionResult!.coins}
            </span>
          </div>
        ) : (
          <p className="text-caption text-text-theme-muted leading-relaxed max-w-[240px] mx-auto">
            {lastSubmissionResult!.already_awarded
              ? t('rewardAlreadyEarned')
              : lastSubmissionResult!.score < lastSubmissionResult!.passing_score
                ? t('scoreBelowPassingLabel').replace('{score}', String(lastSubmissionResult!.passing_score))
                : t('ineligibleForRewards')}
          </p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <button onClick={() => setMode('info')} className="flex-1 sm:flex-none px-6 py-2 rounded-[12px] font-semibold text-body text-text-theme-secondary dark:text-text-theme-dark-secondary bg-surface-secondary dark:bg-surface-dark-secondary hover:bg-surface-secondary dark:hover:bg-surface-dark-elevated transition-all">
            {t('backToOverview')}
          </button>
          <button onClick={() => handleReviewClick(lastSubmissionResult!.attempt_id)} className="flex-1 sm:flex-none px-6 py-2 rounded-[12px] font-semibold text-body text-white bg-surface-dark-primary dark:bg-surface-primary dark:text-surface-dark-primary hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95">
            <Search className="w-4 h-4" /> {t('reviewAnswers')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderReviewMode = () => {
    if (!reviewData || reviewData.length === 0) return null;
    const item = reviewData[currentQuestionIndex];
    return (
      <div className="flex flex-col h-full bg-surface-primary dark:bg-surface-dark-primary animate-in fade-in duration-500">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-surface-secondary dark:border-surface-dark-elevated sticky top-0 bg-surface-primary/80 dark:bg-surface-dark-primary/80 backdrop-blur-md z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
          <h4 className="text-h3 md:text-h2 text-brand-dark dark:text-text-theme-dark-primary tracking-tight">{t('detailedReview')}</h4>
          <div className="flex items-center gap-4">
            <div className="text-caption font-mono text-brand-primary uppercase tracking-widest whitespace-nowrap tabular-nums">
              {currentQuestionIndex + 1} / {reviewData.length}
            </div>
            <button onClick={() => setMode('info')} className="p-2 -mr-2 text-text-theme-muted hover:text-brand-primary transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar">
          <div className="max-w-4xl mx-auto py-2">
            <div className={`rounded-[24px] border-2 overflow-hidden transition-all shadow-sm ${item.is_correct ? 'border-emerald-500/20 bg-emerald-50/5' : 'border-red-500/20 bg-red-50/5'}`}>
              <div className="p-4 md:p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className={`text-caption font-bold uppercase tracking-wider ${item.is_correct ? 'text-emerald-500' : 'text-red-500'}`}>Question {currentQuestionIndex + 1}</span>
                    <h5 className="text-h4 md:text-h3 text-brand-dark dark:text-text-theme-dark-primary leading-snug">{item.question_text}</h5>
                  </div>
                  <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm ${item.is_correct ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                    {item.is_correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {item.options.map((option) => {
                    const isSelected = item.selected_option_id === option.id;
                    const isCorrect = option.is_correct;
                    let stateClass = 'bg-surface-primary dark:bg-surface-dark-primary border-surface-secondary dark:border-surface-dark-elevated text-text-theme-secondary';
                    if (isSelected && isCorrect) stateClass = 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20';
                    else if (isSelected && !isCorrect) stateClass = 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20';
                    else if (isCorrect) stateClass = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30';

                    return (
                      <div key={option.id} className={`p-3 md:p-4 rounded-[12px] border text-caption md:text-body font-bold flex items-center gap-3 transition-all ${stateClass}`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : isSelected ? <XCircle className="w-4 h-4 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20 shrink-0" />}
                        <span>{option.content}</span>
                      </div>
                    );
                  })}
                </div>

                {item.explanation && (
                  <div className="bg-surface-primary/80 dark:bg-surface-dark-primary/50 p-4 rounded-[16px] border border-surface-secondary dark:border-surface-dark-elevated shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-30"></div>
                    <span className="section-label text-brand-primary block mb-1 opacity-70">{t('explanation')}</span>
                    <p className="text-caption md:text-body text-text-theme-secondary dark:text-text-theme-dark-secondary italic leading-relaxed">{item.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-4 bg-surface-primary dark:bg-surface-dark-primary border-t border-surface-secondary dark:border-surface-dark-elevated shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev > 0 ? prev - 1 : prev)}
              disabled={currentQuestionIndex === 0}
              className="flex-1 md:flex-none px-6 md:px-10 py-3 rounded-[12px] font-bold text-caption md:text-body text-text-theme-secondary hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary disabled:opacity-30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" /> <span className="hidden md:inline">{t('previousQuestion')}</span><span className="md:hidden">{t('back')}</span>
            </button>

            {currentQuestionIndex === reviewData.length - 1 ? (
              <button onClick={() => setMode('info')} className="flex-[2] md:flex-none px-12 py-3 bg-surface-dark-primary dark:bg-surface-primary text-white dark:text-surface-dark-primary hover:shadow-2xl transition-all uppercase tracking-widest block text-center active:scale-95 rounded-[12px]">
                {t('backToOverview')}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev < reviewData.length - 1 ? prev + 1 : prev)}
                className="flex-[2] md:flex-none px-12 py-3 bg-surface-dark-primary dark:bg-surface-primary text-white dark:text-surface-dark-primary rounded-[12px] font-bold text-body hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
              >
                {t('nextQuestion')} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  };

  const renderQuizOverlay = () => {
    if (mode === 'info') return null;

    return createPortal(
      <div className="fixed inset-0 z-[100] bg-surface-primary dark:bg-surface-dark-primary overflow-hidden flex flex-col animate-in duration-500">
        {mode === 'article' && renderArticleMode()}
        {mode === 'solving' && renderSolvingMode()}
        {mode === 'results' && renderResultsMode()}
        {mode === 'review' && renderReviewMode()}
      </div>,
      document.body
    );
  };

  return (
    <>
      {renderQuizOverlay()}
      <div className="space-y-4">

        {/* CTA */}
        <div>
          <p className="text-body font-bold text-text-theme-primary dark:text-text-theme-dark-primary leading-snug mb-1">
            {t('quizReadyTitle')}
          </p>
          <p className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary leading-relaxed mb-4">
            {t('quizReadyDesc').replace('{count}', quizSummary.question_count.toString())}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => startQuiz('solving')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 active:scale-[0.98] text-white rounded-xl font-semibold text-body transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              {t('startQuiz')}
            </button>
            <button
              onClick={() => startQuiz('article')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 text-text-theme-secondary dark:text-text-theme-dark-secondary bg-surface-primary dark:bg-surface-dark-secondary border border-surface-secondary dark:border-surface-dark-elevated rounded-xl text-body hover:border-surface-secondary dark:hover:border-surface-dark-elevated hover:text-text-theme-primary dark:hover:text-text-theme-dark-primary transition-all disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4" />
              {t('article')}
            </button>
          </div>
        </div>

        {/* Previous attempts */}
        {quizSummary.previous_attempts && quizSummary.previous_attempts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="section-label text-text-theme-muted dark:text-text-theme-dark-muted">
                {t('previousAttempts')}
              </h5>
              <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">
                {t('passing')}: <span className="font-semibold text-text-theme-secondary dark:text-text-theme-dark-secondary tabular-nums">{quizSummary.passing_score}/{sortedAttempts[0]?.total ?? '—'}</span>
              </span>
            </div>

            <div className="space-y-1">
              {sortedAttempts.map((attempt) => {
                const isPassed = attempt.score >= (quizSummary.passing_score || 0);

                return (
                  <div key={attempt.id}>
                    <button
                      onClick={() => handleReviewClick(attempt.id)}
                      aria-label={`${attempt.score}/${attempt.total} — ${isPassed ? t('passed') : t('failed')}, ${new Date(attempt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-secondary dark:bg-surface-dark-secondary/60 border border-surface-secondary dark:border-surface-dark-elevated/50 hover:border-surface-secondary dark:hover:border-surface-dark-elevated hover:bg-surface-primary dark:hover:bg-surface-dark-secondary transition-all group text-left"
                    >
                      <div className="flex items-baseline gap-0.5 min-w-[44px]">
                        <span className="text-h4 font-bold tabular-nums leading-none text-text-theme-primary dark:text-text-theme-dark-primary">
                          {attempt.score}
                        </span>
                        <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted tabular-nums">
                          /{attempt.total}
                        </span>
                      </div>

                      <span className={`shrink-0 inline-flex items-center gap-1 text-caption ${
                        isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {isPassed ? t('passed') : t('failed')}
                      </span>

                      <span className="flex-1 text-caption text-text-theme-muted dark:text-text-theme-dark-muted tabular-nums text-right">
                        {new Date(attempt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>

                      <svg className="shrink-0 w-3.5 h-3.5 text-text-theme-muted dark:text-text-theme-dark-muted group-hover:text-text-theme-secondary dark:group-hover:text-text-theme-dark-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {showReviewWarning === attempt.id && (
                      <div className="mt-1 rounded-xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex gap-2 items-start mb-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-caption font-semibold text-amber-800 dark:text-amber-300 leading-snug">
                            {t('reviewWarning')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowReviewWarning(null)}
                            className="flex-1 py-2 rounded-lg text-caption font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                          >
                            {t('cancel')}
                          </button>
                          <button
                            onClick={() => loadReview(showReviewWarning)}
                            className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-lg text-caption font-semibold transition-all"
                          >
                            {t('viewReview')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review warning fallback */}
        {showReviewWarning !== null && !(quizSummary.previous_attempts && quizSummary.previous_attempts.length > 0) && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 p-4 animate-in fade-in duration-150">
            <div className="flex gap-2 items-start mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-caption font-semibold text-amber-800 dark:text-amber-300 leading-snug">
                {t('reviewWarning')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReviewWarning(null)}
                className="flex-1 py-2 rounded-lg text-caption font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => loadReview(showReviewWarning)}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-lg text-caption font-semibold transition-all"
              >
                {t('viewReview')}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default QuizSection;
