import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  FileText,
  UploadCloud,
  X,
  Link as LinkIcon,
  AlertCircle,
  Calendar,
  ChevronDown,
  BookOpen,
  History as HistoryIcon,
  Search,
  ClipboardList,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Brain,
  Zap,
  CheckCircle2,
  XCircle,
  Trophy,
  Award,
  Loader2,
  PlayCircle,
  AlertTriangle,
  Coins
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import LoadingScreen from '../components/LoadingScreen';
import { LessonsProvider, useLessons } from '../context/LessonsContext';
import { useDashboard } from '../context/DashboardContext';
import {
  AssignmentData,
  AttendanceData,
  HomeworkSubmissionData,
  QuizSessionData,
  QuizQuestionsData,
  QuizSubmitResponseData,
  QuizQuestionResult
} from '../services/apiTypes';

// --- Toast Component ---
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 md:px-6 md:py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in duration-300 max-w-[90vw] ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span className="text-xs md:text-sm font-bold uppercase tracking-wide leading-snug">{message}</span>
    </div>,
    document.body
  );
};

// --- Submission Modal Component ---
const SubmissionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  assignment: AssignmentData;
  onSubmit: (data: Omit<HomeworkSubmissionData, 'assignment_id' | 'student_code'>) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error') => void;
}> = ({ isOpen, onClose, assignment, onSubmit, showToast }) => {
  const { t } = useLanguage();
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState<({ type: 'link', value: string } | { type: 'file', file: File })[]>([{ type: 'link', value: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddLink = () => setAttachments([...attachments, { type: 'link', value: '' }]);
  const handleRemoveAttachment = (index: number) => setAttachments(attachments.filter((_, i) => i !== index));
  const handleLinkChange = (index: number, value: string) => {
    const newAttachments = [...attachments];
    if (newAttachments[index].type === 'link') {
      newAttachments[index] = { type: 'link', value };
      setAttachments(newAttachments);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ type: 'file' as const, file }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const links = attachments.filter(a => a.type === 'link' && a.value.trim() !== '') as { type: 'link', value: string }[];
      const files = attachments.filter(a => a.type === 'file') as { type: 'file', file: File }[];

      const finalAttachments: any[] = [];
      const finalFiles: File[] = [];

      links.forEach(l => {
        finalAttachments.push({ type: 'link', name: 'Link', url: l.value });
      });

      files.forEach(f => {
        finalAttachments.push({ type: 'file', name: f.file.name });
        finalFiles.push(f.file);
      });

      await onSubmit({
        comment: comment,
        attachments: finalAttachments.length > 0 ? finalAttachments : undefined,
        files: finalFiles.length > 0 ? finalFiles : undefined
      });

      showToast(t('assignmentSubmitted'), "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || t('failedToSubmitAssignment'), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-slate-950/60 animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-t-[24px] md:rounded-[24px] shadow-2xl w-full max-w-2xl relative z-10 flex flex-col border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[90vh] animate-in duration-300 ease-out">
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-brand-dark dark:text-white">{t('submitAssignment')}</h3>
            <p className="text-xs font-medium text-gray-500 mt-1 uppercase tracking-widest">LSN {assignment.number}: {assignment.lesson_topic}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <label className="section-label text-gray-400 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-2 text-brand-primary" />
              {t('commentOptional')}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('anyNotes')}
              className="w-full rounded-[16px] border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 px-4 py-3 text-sm focus:border-brand-primary focus:outline-none transition-all dark:text-white min-h-[100px]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="section-label text-gray-400 flex items-center">
                <LinkIcon className="w-3.5 h-3.5 mr-2 text-brand-primary" />
                {t('addAttachment')}
              </label>
              <div className="flex bg-gray-100 dark:bg-slate-950 p-1 rounded-[12px] border border-gray-200/50 dark:border-slate-800">
                <button
                  onClick={handleAddLink}
                  className="px-4 py-1.5 rounded-[10px] text-xs font-bold tracking-wider transition-all text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {t('addLink')}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 rounded-[10px] text-xs font-bold tracking-wider transition-all text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {t('addFile')}
                </button>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              {attachments.map((attachment, idx) => (
                <div key={idx} className="flex gap-2 group items-center">
                  {attachment.type === 'link' ? (
                    <div className="relative flex-1">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={attachment.value}
                        onChange={(e) => handleLinkChange(idx, e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-[12px] border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 py-2.5 text-sm font-mono focus:border-brand-primary focus:outline-none transition-all dark:text-white"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-800 rounded-[12px] border border-gray-100 dark:border-slate-700 hover:border-brand-primary/30 transition-colors">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-brand-primary" />
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate max-w-[150px] md:max-w-[200px]">{attachment.file.name}</span>
                      </div>
                      <span className="text-xs font-mono text-gray-500">{(attachment.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                  <button onClick={() => handleRemoveAttachment(idx)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {attachments.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  {t('noAttachments')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-slate-800 flex gap-3 bg-gray-50/50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-3 md:px-4 md:py-3.5 rounded-[12px] text-sm md:text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-3 py-3 md:px-4 md:py-3.5 rounded-[12px] text-sm md:text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary/90 shadow-brand-primary/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span className="truncate">{t('submitAssignment')}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- Quiz Section Component ---
const QuizSection: React.FC<{
  lessonId: number;
  showToast: (message: string, type: 'success' | 'error') => void;
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
    if (!quizSummary.previous_attempts) return [];
    return [...quizSummary.previous_attempts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [quizSummary.previous_attempts]);

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
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 animate-in fade-in duration-300">
      {/* Article Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
        <button onClick={() => setMode('info')} className="p-2 -ml-2 text-gray-400 hover:text-brand-primary transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest opacity-70">{t('quizLevel')} {questionsData!.vocab_level}</span>
          <span className="text-sm font-bold text-brand-dark dark:text-white mt-0.5">{t('sourceArticle')}</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Article Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <div className="max-w-3xl mx-auto py-4 md:py-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-5">
              <BookOpen className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">{t('readArticleTitle')}</span>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">{t('readArticleDesc')}</p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-[24px] p-6 md:p-10 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary opacity-30"></div>
            <p className="text-base md:text-lg font-medium text-gray-800 dark:text-slate-200 leading-[1.85] whitespace-pre-wrap pl-2">
              {questionsData!.source_text}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-8">
        <button
          onClick={() => setMode('solving')}
          className="w-full max-w-4xl mx-auto py-4 rounded-[16px] font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 text-white shadow-brand-primary/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 block"
        >
          <PlayCircle className="w-5 h-5" />
          {t('backToQuiz')}
        </button>
      </div>
    </div>
  );

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    // Auto-advance to next question after a short delay
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

  if (!quizSummary) return null;

  const renderSolvingMode = () => {
    const questionText = questionsData!.questions[currentQuestionIndex].question_text;
    const isLongText = questionText.length > 80;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-950 animate-in fade-in duration-300">
        {/* Quiz Header (Overlay specific) */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
          <button onClick={() => setMode('info')} className="p-2 -ml-2 text-gray-400 hover:text-brand-primary transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 px-4 md:px-12 flex items-center justify-center gap-4">
            <div className="flex-1 max-w-md h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(18,194,220,0.5)]" style={{ width: `${((currentQuestionIndex + 1) / questionsData!.questions.length) * 100}%` }} />
            </div>
          </div>
          <div className="text-xs font-bold text-brand-primary uppercase tracking-widest whitespace-nowrap tabular-nums">
            {currentQuestionIndex + 1} / {questionsData!.questions.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-2">
            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-[24px] p-5 md:p-10 text-center border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary opacity-50"></div>
              <span className="section-label text-brand-primary mb-2 block opacity-70">{t('question')}</span>
              <h3 className={`${isLongText ? 'text-lg md:text-2xl' : 'text-xl md:text-3xl'} font-bold text-brand-dark dark:text-white leading-tight mb-4`}>
                {questionText}
              </h3>
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-slate-400 max-w-lg mx-auto italic opacity-80">{t('chooseCorrectAnswer')}</p>
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
                        : 'border-gray-100 dark:border-slate-800/50 hover:border-brand-primary/40 bg-white dark:bg-slate-900 shadow-sm'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-[8px] flex items-center justify-center border-2 shrink-0 transition-all ${isSelected ? 'border-brand-primary bg-brand-primary text-white scale-110' : 'border-gray-200 dark:border-slate-700 group-hover/opt:border-brand-primary/50'}`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm md:text-sm font-bold flex-1 ${isSelected ? 'text-brand-dark dark:text-white' : 'text-gray-600 dark:text-slate-300'}`}>{option.content}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
            <button
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 md:px-10 py-4 rounded-[16px] font-bold text-xs md:text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" /> <span className="hidden md:inline">{t('previousQuestion')}</span><span className="md:hidden">{t('back')}</span>
            </button>

            {currentQuestionIndex === questionsData!.questions.length - 1 && (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || Object.keys(answers).length < questionsData!.questions.length}
                className="px-12 py-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-[16px] font-bold text-sm md:text-sm shadow-brand-primary/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
                {t('finishQuiz')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResultsMode = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 p-5 md:p-8 overflow-y-auto animate-in fade-in duration-300 custom-scrollbar pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-8">
      <div className="max-w-md mx-auto w-full text-center py-6 space-y-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${lastSubmissionResult!.passed ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
          {lastSubmissionResult!.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {lastSubmissionResult!.passed ? t('passed') : t('failed')}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('finalScore')}</p>
          <p className="text-4xl md:text-5xl font-bold text-brand-dark dark:text-white tabular-nums">
            {lastSubmissionResult!.score}
            <span className="text-xl text-gray-300 dark:text-slate-700 mx-1.5">/</span>
            <span className="text-2xl md:text-3xl text-gray-400 dark:text-slate-500">{lastSubmissionResult!.total}</span>
          </p>
        </div>

        {lastSubmissionResult!.points_awarded ? (
          <div className="flex items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-full text-sm font-semibold">
              <Zap className="w-3.5 h-3.5 fill-current" /> +{lastSubmissionResult!.xp} XP
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-full text-sm font-semibold">
              <Coins className="w-3.5 h-3.5" /> +{lastSubmissionResult!.coins}
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 leading-relaxed max-w-[240px] mx-auto">
            {lastSubmissionResult!.already_awarded
              ? t('rewardAlreadyEarned')
              : lastSubmissionResult!.score < lastSubmissionResult!.passing_score
                ? t('scoreBelowPassingLabel').replace('{score}', String(lastSubmissionResult!.passing_score))
                : t('ineligibleForRewards')}
          </p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-2.5">
          <button onClick={() => setMode('info')} className="flex-1 sm:flex-none px-6 py-2.5 rounded-[12px] font-semibold text-sm text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">
            {t('backToOverview')}
          </button>
          <button onClick={() => handleReviewClick(lastSubmissionResult!.attempt_id)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-[12px] font-semibold text-sm text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95">
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
      <div className="flex flex-col h-full bg-white dark:bg-slate-950 animate-in fade-in duration-500">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
          <h4 className="font-bold text-lg md:text-xl text-brand-dark dark:text-white tracking-tight">{t('detailedReview')}</h4>
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono font-medium text-brand-primary uppercase tracking-widest whitespace-nowrap tabular-nums">
              {currentQuestionIndex + 1} / {reviewData.length}
            </div>
            <button onClick={() => setMode('info')} className="p-2 -mr-2 text-gray-400 hover:text-brand-primary transition-colors">
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
                    <span className={`text-xs font-bold uppercase tracking-wider ${item.is_correct ? 'text-emerald-500' : 'text-red-500'}`}>Question {currentQuestionIndex + 1}</span>
                    <h5 className="font-bold text-base md:text-lg text-brand-dark dark:text-white leading-snug">{item.question_text}</h5>
                  </div>
                  <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-sm ${item.is_correct ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                    {item.is_correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {item.options.map((option) => {
                    const isSelected = item.selected_option_id === option.id;
                    const isCorrect = option.is_correct;
                    let stateClass = 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500';
                    if (isSelected && isCorrect) stateClass = 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20';
                    else if (isSelected && !isCorrect) stateClass = 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20';
                    else if (isCorrect) stateClass = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30';

                    return (
                      <div key={option.id} className={`p-3 md:p-4 rounded-[12px] border text-xs md:text-sm font-bold flex items-center gap-3 transition-all ${stateClass}`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : isSelected ? <XCircle className="w-4 h-4 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20 shrink-0" />}
                        <span>{option.content}</span>
                      </div>
                    );
                  })}
                </div>

                {item.explanation && (
                  <div className="bg-white/80 dark:bg-slate-900/50 p-4 rounded-[16px] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-30"></div>
                    <span className="section-label text-brand-primary block mb-1 opacity-70">{t('explanation')}</span>
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-slate-400 italic leading-relaxed">{item.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 md:p-5 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-5">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev > 0 ? prev - 1 : prev)}
              disabled={currentQuestionIndex === 0}
              className="flex-1 md:flex-none px-6 md:px-10 py-3 rounded-[12px] font-bold text-xs md:text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" /> <span className="hidden md:inline">{t('previousQuestion')}</span><span className="md:hidden">{t('back')}</span>
            </button>

            {currentQuestionIndex === reviewData.length - 1 ? (
              <button onClick={() => setMode('info')} className="flex-[2] md:flex-none px-12 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-2xl transition-all uppercase tracking-widest block text-center active:scale-95 rounded-[12px]">
                {t('backToOverview')}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => prev < reviewData.length - 1 ? prev + 1 : prev)}
                className="flex-[2] md:flex-none px-12 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[12px] font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
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
      <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-hidden flex flex-col animate-in duration-500">
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
      <div className="space-y-5">

        {/* CTA */}
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-1">
            {t('quizReadyTitle')}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-4">
            {t('quizReadyDesc').replace('{count}', quizSummary.question_count.toString())}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => startQuiz('solving')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 active:scale-[0.98] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              {t('startQuiz')}
            </button>
            <button
              onClick={() => startQuiz('article')}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-sm hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-50"
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
              <h5 className="section-label text-gray-400 dark:text-slate-500">
                {t('previousAttempts')}
              </h5>
              <span className="text-xs text-gray-400 dark:text-slate-500">
                {t('passing')}: <span className="font-semibold text-gray-600 dark:text-slate-300 tabular-nums">{quizSummary.passing_score}/{sortedAttempts[0]?.total ?? '—'}</span>
              </span>
            </div>

            <div className="space-y-1.5">
              {sortedAttempts.map((attempt) => {
                const isPassed = attempt.score >= (quizSummary.passing_score || 0);

                return (
                  <div key={attempt.id}>
                    <button
                      onClick={() => handleReviewClick(attempt.id)}
                      aria-label={`${attempt.score}/${attempt.total} — ${isPassed ? t('passed') : t('failed')}, ${new Date(attempt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-all group text-left"
                    >
                      <div className="flex items-baseline gap-0.5 min-w-[44px]">
                        <span className="text-base font-bold tabular-nums leading-none text-gray-900 dark:text-white">
                          {attempt.score}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 tabular-nums">
                          /{attempt.total}
                        </span>
                      </div>

                      <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium ${
                        isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {isPassed ? t('passed') : t('failed')}
                      </span>

                      <span className="flex-1 text-xs text-gray-400 dark:text-slate-500 tabular-nums text-right">
                        {new Date(attempt.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>

                      <svg className="shrink-0 w-3.5 h-3.5 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {showReviewWarning === attempt.id && (
                      <div className="mt-1.5 rounded-xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 p-4 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex gap-2 items-start mb-3">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-snug">
                            {t('reviewWarning')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowReviewWarning(null)}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                          >
                            {t('cancel')}
                          </button>
                          <button
                            onClick={() => loadReview(showReviewWarning)}
                            className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold transition-all"
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

        {/* Review warning fallback — only shown when there's no attempts list to anchor it to */}
        {showReviewWarning !== null && !(quizSummary.previous_attempts && quizSummary.previous_attempts.length > 0) && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/10 p-4 animate-in fade-in duration-150">
            <div className="flex gap-2 items-start mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-snug">
                {t('reviewWarning')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReviewWarning(null)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => loadReview(showReviewWarning)}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-lg text-xs font-semibold transition-all"
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

// --- Shared status color helper ---
const humanizeStatus = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const assignmentStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'approved') return 'text-emerald-600 dark:text-emerald-400';
  if (s === 'rejected' || s === 'missed') return 'text-red-500 dark:text-red-400';
  if (s === 'submitted' || s === 'pending' || s.includes('awaiting')) return 'text-amber-600 dark:text-amber-500';
  return 'text-gray-500 dark:text-slate-400';
};

const assignmentStatusDot = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'approved') return 'bg-emerald-500';
  if (s === 'rejected' || s === 'missed') return 'bg-red-500';
  if (s === 'submitted' || s === 'pending' || s.includes('awaiting')) return 'bg-amber-400';
  return 'bg-gray-400';
};

// --- Current Assignment Section ---
const CurrentAssignmentSection: React.FC<{
  assignment: AssignmentData;
  onSubmit: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}> = ({ assignment, onSubmit, showToast }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'assignment' | 'quiz'>('assignment');

  const latestSubmission = assignment.submissions?.[0] ?? null;
  const isApproved = latestSubmission?.status?.toLowerCase() === 'approved';
  const isExpired = assignment.is_expired === true;
  const isOverdue = assignment.is_overdue === true;
  // Can still submit if: not approved AND the absolute deadline (deadline + 24h) hasn't passed
  const canSubmit = !isApproved && !isExpired;

  const statusBadge = isApproved ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
      {t('assignmentApproved')}
    </span>
  ) : isExpired ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
      {t('assignmentExpired')}
    </span>
  ) : isOverdue ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
      {t('assignmentOverdue')}
    </span>
  ) : latestSubmission ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
      {t('submitted')}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-brand-primary/10 text-brand-primary">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0"></span>
      {t('active')}
    </span>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
        <h3 className="font-bold text-brand-dark dark:text-white flex items-center gap-2 text-sm md:text-base">
          <ClipboardList className="w-5 h-5 text-brand-primary" />
          {t('lessonContent')}
        </h3>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {statusBadge}
          <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-[10px] text-xs font-bold uppercase tracking-wider">
            LSN {assignment.number}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-[14px] items-center shadow-inner border border-gray-200/50 dark:border-slate-800 max-w-sm mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('assignment')}
            className={`flex-1 h-10 rounded-[10px] font-bold text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === 'assignment' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-gray-500'}`}
          >
            {t('assignment')}
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 h-10 rounded-[10px] font-bold text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === 'quiz' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-gray-500'}`}
          >
            {t('quiz')}
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {activeTab === 'assignment' ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Topic info block — full width, button below on mobile */}
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-[14px] border border-gray-100 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <FileText style={{width:'18px',height:'18px'}} className="text-brand-primary shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-widest block leading-none mb-1">{t('activeTopic')}</span>
                  <h4 className="text-sm font-bold text-brand-dark dark:text-white leading-snug mb-2">{assignment.lesson_topic}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3 h-3 shrink-0" />{new Date(assignment.start_datetime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                      <Clock className="w-3 h-3 shrink-0" />{t('due')} {new Date(assignment.deadline).toLocaleDateString()}, {new Date(assignment.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              {/* Overdue warning */}
              {isOverdue && !isExpired && (
                <div className="mt-3 flex items-start gap-2.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-[10px] px-3.5 py-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-orange-700 dark:text-orange-400 leading-snug">{t('lateSubmission')}</p>
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/70 mt-0.5">{t('lateSubmissionDesc')}</p>
                  </div>
                </div>
              )}
              {canSubmit && (
                <button
                  onClick={onSubmit}
                  className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 font-bold text-sm rounded-[10px] transition-all active:scale-[0.99] ${
                    isOverdue
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 hover:shadow-md'
                      : 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-brand-primary/20 hover:shadow-md'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  {isOverdue
                    ? (latestSubmission ? t('resubmitLate') : t('submitLate'))
                    : (latestSubmission ? t('resubmit') : t('startSubmission'))}
                </button>
              )}
            </div>

            <div>
              <label className="section-label text-gray-400 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-brand-primary" />{t('homeworkDescription')}
              </label>
              <blockquote className="border-l-2 border-gray-200 dark:border-slate-700 pl-3 text-sm md:text-sm text-gray-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{assignment.description}</blockquote>
            </div>

            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {assignment.attachments.map((item, idx) => (
                  <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full hover:border-brand-primary/40 hover:text-brand-primary transition-all text-sm font-medium group">
                    <LinkIcon className="w-3.5 h-3.5 text-brand-primary" />
                    <span className="max-w-[150px] truncate">{item.name}</span>
                  </a>
                ))}
              </div>
            )}

            {assignment.submissions && assignment.submissions.length > 0 && (
              <div className="space-y-2">
                <label className="section-label text-gray-400 flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 text-brand-primary" />{t('submissionHistory')}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {assignment.submissions.map((sub, idx) => (
                    <div key={idx} className="border border-gray-100 dark:border-slate-700 rounded-[12px] p-3 md:p-4 space-y-2.5">
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-slate-400 shrink-0 tabular-nums">{new Date(sub.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium shrink-0 ${assignmentStatusColor(sub.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${assignmentStatusDot(sub.status)}`}></span>
                          {humanizeStatus(sub.status)}
                        </span>
                      </div>

                      {sub.student_comment && (
                        <div className="pl-4 border-l-4 border-brand-primary/30">
                          <span className="section-label text-brand-primary block mb-1">{t('yourComment')}</span>
                          <p className="text-sm text-gray-600 dark:text-slate-400 font-medium italic">"{sub.student_comment}"</p>
                        </div>
                      )}

                      {sub.teacher_comment && (
                        <div className="border-l-2 border-amber-500/40 pl-3 py-1">
                          <span className="section-label text-amber-500 block mb-1">{t('instructorReview')}</span>
                          <p className="text-sm text-gray-700 dark:text-slate-300 font-bold italic">"{sub.teacher_comment}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <QuizSection lessonId={assignment.id} showToast={showToast} initialData={assignment.quiz} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Assignment History Card ---
const AssignmentHistoryCard: React.FC<{
  assignment: AssignmentData;
  isExpanded: boolean;
  onExpand: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}> = ({ assignment, isExpanded, onExpand, showToast }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'assignment' | 'quiz'>('assignment');

  const latestSubmission = assignment.submissions?.[0] ?? null;
  const isPastDeadline = new Date(assignment.deadline).getTime() < Date.now();

  let statusLabel = t('pending');
  if (latestSubmission) statusLabel = humanizeStatus(latestSubmission.status);
  else if (isPastDeadline) statusLabel = t('missed');

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[16px] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-brand-primary/40 shadow-xl ring-1 ring-brand-primary/10' : 'border-gray-100 dark:border-slate-800 hover:border-brand-primary/30'}`}>
      <button 
        type="button"
        onClick={onExpand} 
        className="w-full p-4 md:p-6 cursor-pointer flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      >
        {/* Lesson number pill */}
        <div className="shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[8px] px-2.5 py-1 flex flex-col items-center min-w-[36px]">
          <span className="text-xs font-bold uppercase leading-none opacity-50">LSN</span>
          <span className="font-bold text-sm leading-tight">{assignment.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-brand-dark dark:text-white truncate leading-snug">{assignment.lesson_topic}</h3>
          <p className="text-xs font-medium text-gray-400 mt-0.5">{new Date(assignment.start_datetime).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${assignmentStatusColor(latestSubmission?.status || statusLabel)}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${assignmentStatusDot(latestSubmission?.status || statusLabel)}`}></span>
            {statusLabel}
          </span>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-gray-50 dark:bg-slate-800 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-brand-primary/10 text-brand-primary' : 'text-gray-400'}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-50 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/10 animate-in duration-300">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-center md:justify-start">
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-[14px] items-center shadow-inner border border-gray-200/50 dark:border-slate-800 w-full max-w-[280px]">
              <button
                onClick={() => setActiveTab('assignment')}
                className={`flex-1 h-9 rounded-[10px] font-bold text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === 'assignment' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-gray-500'}`}
              >
                {t('assignment')}
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 h-9 rounded-[10px] font-bold text-xs uppercase tracking-wider transition-all duration-300 ${activeTab === 'quiz' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-gray-500'}`}
              >
                {t('quiz')}
              </button>
            </div>
          </div>

          <div className="p-4 md:p-5">
            {activeTab === 'assignment' ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <label className="section-label text-gray-400 flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-brand-primary" />{t('homeworkDescription')}
                  </label>
                  <blockquote className="border-l-2 border-gray-200 dark:border-slate-700 pl-3 text-sm text-gray-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{assignment.description}</blockquote>
                </div>

                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {assignment.attachments.map((item, idx) => (
                      <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 dark:border-slate-700 rounded-full hover:border-brand-primary/40 hover:text-brand-primary transition-all text-xs font-medium group">
                        <LinkIcon className="w-3 h-3 text-brand-primary" />
                        <span className="max-w-[120px] truncate">{item.name}</span>
                      </a>
                    ))}
                  </div>
                )}

                {assignment.submissions && assignment.submissions.length > 0 && (
                  <div className="space-y-2">
                    <label className="section-label text-gray-400 flex items-center gap-2">
                      <HistoryIcon className="w-4 h-4 text-brand-primary" />{t('submissionHistory')}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {assignment.submissions.map((sub, idx) => (
                        <div key={idx} className="rounded-[10px] p-3 border border-gray-100 dark:border-slate-700 flex flex-col gap-2">
                          <div className="flex justify-between items-center gap-3">
                            <span className="text-xs font-medium text-gray-500 dark:text-slate-400 shrink-0 tabular-nums">{new Date(sub.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium shrink-0 ${assignmentStatusColor(sub.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${assignmentStatusDot(sub.status)}`}></span>
                              {humanizeStatus(sub.status)}
                            </span>
                          </div>
                          {sub.teacher_comment && (
                            <div className="border-l-2 border-amber-500/40 pl-3 py-1">
                              <span className="section-label text-amber-500 block mb-1">{t('instructorReview')}</span>
                              <p className="text-xs text-gray-700 dark:text-slate-300 font-bold italic">"{sub.teacher_comment}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <QuizSection lessonId={assignment.id} showToast={showToast} initialData={assignment.quiz} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Isolated component — owns timer, attendance code, prevents LessonsContent from re-rendering every second
const ActiveAttendanceCard: React.FC<{
  attendance: AttendanceData;
  quiz: QuizSessionData | null | undefined;
  showToast: (msg: string, type: 'success' | 'error') => void;
}> = ({ attendance, quiz, showToast }) => {
  const { t } = useLanguage();
  const { markAttendance } = useLessons();
  const { refetch } = useDashboard();
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [isExpired, setIsExpired] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!attendance.closes_at || attendance.status !== null) return;
    const deadline = new Date(attendance.closes_at).getTime();
    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setIsExpired(true);
      } else {
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [attendance.closes_at, attendance.status]);

  const handleMarkAttendance = async () => {
    const trimmedCode = attendanceCode.trim();
    if (!trimmedCode) {
      showToast(t('pleaseEnterKeyword'), 'error');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await markAttendance(trimmedCode);
      if (res.success) {
        showToast(t('markAttendanceSuccess', { xp: res.data.xp, coins: res.data.coins }), 'success');
        setAttendanceCode('');
        refetch();
      }
    } catch (err: any) {
      showToast(err.message || t('invalidKeyword'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Flat dashboard-style layout */}
      <div className="p-5 md:p-6">
        {/* Top row: lesson pill + topic + status chip */}
        <div className="flex items-center gap-3">
          {/* Lesson number pill */}
          <div className="shrink-0 bg-brand-primary/10 border border-brand-primary/20 rounded-[10px] px-2.5 py-1.5 flex flex-col items-center min-w-[40px]">
            <span className="text-xs font-bold text-brand-primary uppercase leading-none opacity-70">LSN</span>
            <span className="font-mono font-medium text-base leading-tight text-brand-primary">{attendance.number}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider opacity-70">{t('currentLesson')}</span>
            </div>
            <h3 className="text-base font-bold text-brand-dark dark:text-white leading-snug truncate">
              {attendance.lesson_topic}
            </h3>
          </div>
          {/* Status chip */}
          {attendance.status === 'attended' || attendance.status === 'marked' ? (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-sm shadow-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('attended')}</span>
            </div>
          ) : (attendance.status !== null || isExpired) ? (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-sm shadow-red-500/20">
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('missed')}</span>
            </div>
          ) : (
            /* Time remaining pill */
            <div className="shrink-0 flex items-center gap-1.5 bg-slate-900 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="text-sm font-bold text-brand-primary tabular-nums font-mono tracking-tight">{timeLeft}</span>
            </div>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-3 pl-[52px] text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> <span>{new Date(attendance.opens_at).toLocaleDateString()}</span></span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> <span>{new Date(attendance.opens_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
        </div>

        {/* Keyword input — flat, inline */}
        {attendance.status === null && !isExpired && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value.toLowerCase())}
              placeholder={t('enterKeywordPlaceholder')}
              className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 text-sm font-bold focus:border-brand-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all lowercase"
            />
            <button
              onClick={handleMarkAttendance}
              disabled={isSubmitting || !attendanceCode.trim()}
              className="shrink-0 h-11 px-5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/35 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '...' : t('mark')}
            </button>
          </div>
        )}
      </div>

      {quiz && (
        <div className="px-5 pb-5 md:px-6 md:pb-6 border-t border-gray-100 dark:border-slate-800 pt-5">
          <div className="flex items-center gap-3 mb-5">
            <h4 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('todaysPractice')}</h4>
            <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800"></div>
          </div>
          <QuizSection lessonId={attendance.track_id} showToast={showToast} initialData={quiz} />
        </div>
      )}
    </div>
  );
};

// --- Lessons Content Component ---
const LessonsContent: React.FC = () => {
  const { t } = useLanguage();
  const { lessonsData, loading, error, submitAssignment } = useLessons();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRowIds, setExpandedRowIds] = useState<number[]>([]);

  const toggleRow = (id: number) => {
    setExpandedRowIds(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  if (loading && !lessonsData) return <LoadingScreen message={t('loadingLessons')} />;
  if (error) return <div className="text-center py-20 text-red-500 font-bold text-sm">{error}</div>;

  const attendance = lessonsData?.attendance;
  const assignments = lessonsData?.assignments;
  const currentAssignment = assignments?.current;

  // Hide current assignment only if the attendance window for that lesson is still open AND student hasn't marked attendance
  const isAttendanceOpen = attendance && new Date() < new Date(attendance.closes_at);
  const hasMarkedAttendance = attendance && attendance.status !== null;

  const isCurrentLessonActive = attendance && currentAssignment &&
    String(attendance.number) === String(currentAssignment.number) &&
    isAttendanceOpen && !hasMarkedAttendance;

  const showCurrentAssignment = currentAssignment && !isCurrentLessonActive;

  const previousAssignments = assignments?.previous || [];
  const hasAnyAssignments = showCurrentAssignment || previousAssignments.length > 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Title */}
      <div className="px-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-primary shrink-0" />
          {t('lessons')}
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">
          {t('lessonsSubtitle')}
        </p>
      </div>

      {/* Attendance Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1 text-brand-primary">
          <Clock className="w-5 h-5 shrink-0" />
          <h2 className="text-sm font-semibold text-brand-dark dark:text-white">{t('lessonAttendance')}</h2>
        </div>

        {attendance ? (
          <ActiveAttendanceCard attendance={attendance} quiz={lessonsData?.quiz} showToast={showToast} />
        ) : (
          <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <BookOpen className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400 dark:text-slate-500">{t('noLessonsSubtitle')}</p>
          </div>
        )}
      </section>

      {/* Assignments Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1 text-brand-primary">
          <ClipboardList className="w-5 h-5 shrink-0" />
          <h2 className="text-sm font-semibold text-brand-dark dark:text-white">{t('assignments')}</h2>
        </div>

        {hasAnyAssignments ? (
          <div className="space-y-4">
            {showCurrentAssignment && (
              <CurrentAssignmentSection
                assignment={currentAssignment}
                onSubmit={() => setIsModalOpen(true)}
                showToast={showToast}
              />
            )}
            {previousAssignments.length > 0 && (
              <div className="space-y-3">
                {showCurrentAssignment && (
                  <p className="section-label text-gray-400 dark:text-slate-500 px-1 pt-2 flex items-center gap-2">
                    <HistoryIcon className="w-3.5 h-3.5" />{t('portfolioHistory')}
                  </p>
                )}
                {previousAssignments.map((prev) => (
                  <AssignmentHistoryCard
                    key={prev.id}
                    assignment={prev}
                    isExpanded={expandedRowIds.includes(prev.id)}
                    onExpand={() => toggleRow(prev.id)}
                    showToast={showToast}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 p-14 text-center">
            <ClipboardList className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400 dark:text-slate-500">{t('noAssignmentsSubtitle')}</p>
          </div>
        )}
      </section>

      {showCurrentAssignment && (
        <SubmissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          assignment={currentAssignment}
          onSubmit={submitAssignment}
          showToast={showToast}
        />
      )}
    </div>
  );
};

const Lessons: React.FC = () => (
  <LessonsProvider>
    <LessonsContent />
  </LessonsProvider>
);

export default Lessons;
