import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  FileText,
  UploadCloud,
  Plus,
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
import { LessonsProvider, useLessons } from '../context/LessonsContext';
import { useDashboard } from '../context/DashboardContext';
import {
  AssignmentData,
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
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="text-sm font-bold font-mono uppercase tracking-wider">{message}</span>
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
  const [links, setLinks] = useState<string[]>(['']);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAttachmentType, setCurrentAttachmentType] = useState<'link' | 'file'>('link');

  if (!isOpen) return null;

  const handleAddLink = () => setLinks([...links, '']);
  const handleRemoveLink = (index: number) => setLinks(links.filter((_, i) => i !== index));
  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const filteredLinks = links.filter(l => l.trim() !== '');

      await onSubmit({
        student_comment: comment,
        attachments: filteredLinks.length > 0 ? filteredLinks.map(l => ({ name: 'Link', link: l })) : undefined,
        files: files.length > 0 ? files : undefined
      });

      showToast("Assignment submitted successfully!", "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to submit assignment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-t-[24px] md:rounded-[24px] shadow-2xl w-full max-w-2xl relative z-10 flex flex-col border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[90vh] animate-in slide-in-from-bottom-[40px] duration-300 ease-out">
        <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-brand-dark dark:text-white">{t('submitAssignment')}</h3>
            <p className="text-[11px] font-mono font-medium text-gray-500 mt-1 uppercase tracking-widest">Lsn {assignment.number}: {assignment.lesson_topic}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-[2px] flex items-center">
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
              <label className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-[2px] flex items-center">
                <LinkIcon className="w-3.5 h-3.5 mr-2 text-brand-primary" />
                {t('addAttachment')}
              </label>
              <div className="flex bg-gray-100 dark:bg-slate-950 p-1 rounded-[12px] border border-gray-200/50 dark:border-slate-800">
                <button
                  onClick={() => setCurrentAttachmentType('link')}
                  className={`px-4 py-1.5 rounded-[10px] text-[11px] font-mono font-bold tracking-wider transition-all ${currentAttachmentType === 'link' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  LINK
                </button>
                <button
                  onClick={() => setCurrentAttachmentType('file')}
                  className={`px-4 py-1.5 rounded-[10px] text-[11px] font-mono font-bold tracking-wider transition-all ${currentAttachmentType === 'file' ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  FILE
                </button>
              </div>
            </div>

            {currentAttachmentType === 'link' ? (
              <div className="space-y-2">
                {links.map((link, idx) => (
                  <div key={idx} className="flex gap-2 group">
                    <div className="relative flex-1">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => handleLinkChange(idx, e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-[12px] border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 py-2.5 text-sm font-mono focus:border-brand-primary focus:outline-none transition-all dark:text-white"
                      />
                    </div>
                    {links.length > 1 && (
                      <button onClick={() => handleRemoveLink(idx)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddLink}
                  className="flex items-center text-[11px] font-mono font-bold uppercase tracking-wider text-brand-primary hover:text-brand-accent transition-colors mt-2"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {t('addAttachment')}
                </button>
              </div>
            ) : (
              <div>
                <div className="relative border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-[16px] p-6 text-center hover:border-brand-primary/50 transition-colors cursor-pointer bg-gray-50/50 dark:bg-slate-800/30">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-6 h-6 text-brand-primary mb-2" />
                    <p className="text-sm font-bold text-gray-700 dark:text-slate-300">{t('chooseFile')}</p>
                    <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">Max 10MB per file</p>
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-800 rounded-[12px] border border-gray-100 dark:border-slate-700 hover:border-brand-primary/30 transition-colors group">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-brand-primary" />
                          <span className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate max-w-[150px] md:max-w-[200px]">{file.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-slate-800 flex gap-3 bg-gray-50/50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3.5 rounded-[12px] text-[15px] font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3.5 rounded-[12px] text-[15px] font-bold text-white bg-gradient-to-r from-brand-primary to-brand-accent hover:shadow-lg hover:shadow-brand-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {t('submitAssignment')}
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

  const startQuiz = async () => {
    if (!quizSummary) return;
    try {
      setLoading(true);
      const res = await getQuizQuestions(quizSummary.session_id);
      if (res.success) {
        setQuestionsData(res.data);
        setCurrentQuestionIndex(0);
        setAnswers({});
        if (res.data.source_text) {
          setMode('article');
        } else {
          setMode('solving');
        }
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load questions", 'error');
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
          <span className="text-[10px] font-mono font-[800] text-brand-primary uppercase tracking-[3px] opacity-70">{t('quizLevel')} {questionsData!.vocab_level}</span>
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
              <span className="text-[11px] font-mono font-bold text-brand-primary uppercase tracking-wider">{t('readArticleTitle')}</span>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">{t('readArticleDesc')}</p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-900/50 rounded-[24px] p-6 md:p-10 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary opacity-30"></div>
            <p className="text-[16px] md:text-lg font-medium text-gray-800 dark:text-slate-200 leading-[1.85] whitespace-pre-wrap pl-2">
              {questionsData!.source_text}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-8">
        <button
          onClick={() => setMode('solving')}
          className="w-full max-w-4xl mx-auto py-4 rounded-[16px] font-bold text-[15px] bg-gradient-to-r from-brand-primary to-brand-accent text-white hover:shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 block"
        >
          <PlayCircle className="w-5 h-5" />
          {t('readArticleBtn')}
        </button>
      </div>
    </div>
  );

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const goToNextQuestion = () => {
    if (questionsData && currentQuestionIndex < questionsData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizSummary || !questionsData) return;

    if (Object.keys(answers).length < questionsData.questions.length) {
      showToast("Please answer all questions", 'error');
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
      showToast(err.message || "Failed to submit quiz", 'error');
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
        setMode('review');
        setShowReviewWarning(null);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load review", 'error');
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
          <div className="flex-1 px-4 md:px-12">
            <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(18,194,220,0.5)]" style={{ width: `${((currentQuestionIndex + 1) / questionsData!.questions.length) * 100}%` }} />
            </div>
          </div>
          <div className="text-[11px] font-mono font-[800] text-brand-primary uppercase tracking-widest whitespace-nowrap tabular-nums">
            {currentQuestionIndex + 1} / {questionsData!.questions.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-2">
            <div className="bg-gray-50 dark:bg-slate-900/50 rounded-[24px] p-5 md:p-10 text-center border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary opacity-50"></div>
              <span className="text-[10px] md:text-[11px] font-mono font-[800] text-brand-primary uppercase tracking-[3px] mb-2 block opacity-70">Question</span>
              <h3 className={`${isLongText ? 'text-lg md:text-2xl' : 'text-xl md:text-3xl'} font-[800] text-brand-dark dark:text-white leading-tight mb-4`}>
                {questionText}
              </h3>
              <p className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-slate-400 max-w-lg mx-auto italic opacity-80">Choose the correct answer from the options below</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pb-10">
              {questionsData!.questions[currentQuestionIndex].options.map((option) => {
                const isSelected = answers[questionsData!.questions[currentQuestionIndex].id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(questionsData!.questions[currentQuestionIndex].id, option.id)}
                    className={`w-full p-4 md:p-6 rounded-[20px] border-2 text-left flex items-center gap-4 transition-all duration-200 group/opt ${
                      isSelected 
                        ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 ring-4 ring-brand-primary/10 scale-[1.01]' 
                        : 'border-gray-100 dark:border-slate-800/50 hover:border-brand-primary/40 bg-white dark:bg-slate-900 shadow-sm'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-[8px] flex items-center justify-center border-2 shrink-0 transition-all ${isSelected ? 'border-brand-primary bg-brand-primary text-white scale-110' : 'border-gray-200 dark:border-slate-700 group-hover/opt:border-brand-primary/50'}`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className={`text-[14px] md:text-base font-bold flex-1 ${isSelected ? 'text-brand-dark dark:text-white' : 'text-gray-600 dark:text-slate-300'}`}>{option.content}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1 md:flex-none px-6 md:px-10 py-4 rounded-[16px] font-bold text-xs md:text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest font-mono"
            >
              <ChevronLeft className="w-4 h-4" /> <span className="hidden md:inline">{t('previousQuestion')}</span><span className="md:hidden">Back</span>
            </button>

            {currentQuestionIndex === questionsData!.questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting || Object.keys(answers).length < questionsData!.questions.length}
                className="flex-[2] md:flex-none px-12 py-4 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-[16px] font-bold text-[15px] hover:shadow-lg hover:shadow-brand-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
                {t('finishQuiz')}
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                disabled={!answers[questionsData!.questions[currentQuestionIndex].id]}
                className="flex-[2] md:flex-none px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[16px] font-bold text-[15px] hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95"
              >
                {t('nextQuestion')} <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResultsMode = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 p-6 md:p-12 overflow-y-auto animate-in zoom-in-95 duration-500 custom-scrollbar pt-[calc(env(safe-area-inset-top)+2rem)] md:pt-12">
      <div className="max-w-4xl mx-auto w-full text-center py-8 space-y-8 md:space-y-12 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        <div className="relative inline-block">
           <div className={`w-28 h-28 md:w-40 md:h-40 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl ${lastSubmissionResult!.passed ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30' : 'bg-gradient-to-br from-brand-primary to-brand-accent shadow-brand-primary/30'}`}>
            <span className="text-5xl md:text-7xl">{lastSubmissionResult!.passed ? '🎉' : '💪'}</span>
          </div>
          {lastSubmissionResult!.passed && (
            <div className="absolute -top-4 -right-4 animate-bounce">
               <Trophy className="w-12 h-12 md:w-16 md:h-16 text-amber-500 drop-shadow-lg" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-3xl md:text-5xl font-[800] text-brand-dark dark:text-white uppercase tracking-tight">{lastSubmissionResult!.passed ? t('passed') : t('failed')}</h3>
          <div className="flex flex-col items-center">
            <span className="text-[10px] md:text-[11px] font-mono font-bold text-gray-500 uppercase tracking-[3px] mb-1">Final Score</span>
            <p className="text-5xl md:text-7xl font-mono font-[800] text-brand-primary drop-shadow-sm tabular-nums">{lastSubmissionResult!.score}<span className="text-2xl md:text-3xl text-gray-300 dark:text-slate-800 mx-2">/</span>{lastSubmissionResult!.total}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-900 rounded-[32px] p-8 md:p-12 border border-gray-100 dark:border-slate-800 shadow-inner max-w-2xl mx-auto">
          {lastSubmissionResult!.points_awarded ? (
            <div className="flex items-center justify-center gap-10 md:gap-20">
              <div className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Zap className="w-7 h-7 text-brand-primary fill-brand-primary" />
                </div>
                <span className="text-xl md:text-2xl font-[800] tracking-tight">+{lastSubmissionResult!.xp} XP</span>
              </div>
              <div className="flex flex-col items-center gap-3 group">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Coins className="w-7 h-7 text-amber-500 fill-amber-500" />
                </div>
                <span className="text-xl md:text-2xl font-[800] tracking-tight">+{lastSubmissionResult!.coins} Coins</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-[2px] leading-relaxed max-w-[240px] mx-auto opacity-70">
              {lastSubmissionResult!.already_awarded 
                ? 'Reward already earned for this quiz' 
                : lastSubmissionResult!.score < lastSubmissionResult!.passing_score 
                  ? `Score below passing requirement (${lastSubmissionResult!.passing_score})` 
                  : 'Ineligible for rewards for this attempt'}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <button onClick={() => setMode('info')} className="flex-1 sm:flex-none px-10 py-4 rounded-[16px] font-bold text-[15px] text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 transition-all uppercase tracking-widest font-mono">
            {t('backToOverview')}
          </button>
          <button onClick={() => handleReviewClick(lastSubmissionResult!.attempt_id)} className="flex-1 sm:flex-none px-12 py-4 rounded-[16px] font-bold text-[15px] text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:shadow-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest font-mono active:scale-95">
            <Search className="w-5 h-5" /> {t('reviewAnswers')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderReviewMode = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 animate-in fade-in duration-500">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
        <h4 className="font-[800] text-lg md:text-xl text-brand-dark dark:text-white tracking-tight">{t('detailedReview')}</h4>
        <button onClick={() => setMode('info')} className="p-2 -mr-2 text-gray-400 hover:text-brand-primary transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-4">
          {reviewData!.map((item, idx) => (
            <div key={idx} className={`rounded-[28px] border-2 overflow-hidden transition-all shadow-sm ${item.is_correct ? 'border-emerald-500/20 bg-emerald-50/5' : 'border-red-500/20 bg-red-50/5'}`}>
              <div className="p-6 md:p-10 space-y-6">
                <div className="flex justify-between items-start gap-6">
                  <div className="space-y-2">
                     <span className={`text-[10px] font-mono font-bold uppercase tracking-[2px] ${item.is_correct ? 'text-emerald-500' : 'text-red-500'}`}>Question {idx + 1}</span>
                     <h5 className="font-bold text-[18px] md:text-xl text-brand-dark dark:text-white leading-snug">{item.question_text}</h5>
                  </div>
                  <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm ${item.is_correct ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                    {item.is_correct ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {item.options.map((option) => {
                    const isSelected = item.selected_option_id === option.id;
                    const isCorrect = option.is_correct;
                    let stateClass = 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500';
                    if (isSelected && isCorrect) stateClass = 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20';
                    else if (isSelected && !isCorrect) stateClass = 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20';
                    else if (isCorrect) stateClass = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30';

                    return (
                      <div key={option.id} className={`p-4 md:p-5 rounded-[16px] border text-[14px] md:text-[15px] font-bold flex items-center gap-3 transition-all ${stateClass}`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : isSelected ? <XCircle className="w-4 h-4 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20 shrink-0" />}
                        <span>{option.content}</span>
                      </div>
                    );
                  })}
                </div>
                
                {item.explanation && (
                  <div className="bg-white/80 dark:bg-slate-900/50 p-6 rounded-[20px] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-30"></div>
                    <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[2px] block mb-2 opacity-70">Explanation</span>
                    <p className="text-[14px] md:text-[15px] font-medium text-gray-600 dark:text-slate-400 italic leading-relaxed">{item.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-8">
        <button onClick={() => setMode('info')} className="w-full max-w-4xl mx-auto py-4 rounded-[16px] font-bold text-[15px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-2xl transition-all uppercase tracking-widest font-mono block text-center active:scale-95">
          {t('backToOverview')}
        </button>
      </div>
    </div>
  );

  const renderQuizOverlay = () => {
    if (mode === 'info') return null;

    return createPortal(
      <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
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
      <div className="space-y-8">
        <div className="text-center md:text-left flex flex-col md:flex-row items-center gap-6 bg-gray-50 dark:bg-slate-800/50 p-5 md:p-8 rounded-[16px] border border-gray-100 dark:border-slate-700">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-[16px] flex items-center justify-center shrink-0">
            <ClipboardList className="w-8 h-8 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-brand-dark dark:text-white mb-1.5">{t('quizReadyTitle')}</h4>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              {t('quizReadyDesc').replace('{count}', quizSummary.question_count.toString())}
            </p>
          </div>
          <button
            onClick={startQuiz}
            disabled={loading}
            className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-[12px] font-bold text-[15px] hover:shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
            {t('startQuiz')}
          </button>
        </div>

        {quizSummary.previous_attempts && quizSummary.previous_attempts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h5 className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-[2px] flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-primary" />
                {t('previousAttempts')}
              </h5>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">Passing:</span>
                <span className="text-sm font-mono font-bold text-brand-primary">{quizSummary.passing_score}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 items-end">
              {quizSummary.previous_attempts.map(attempt => {
                const isPassed = attempt.score >= (quizSummary.passing_score || 0);
                const barHeight = Math.min(40, (attempt.score / attempt.total) * 40);
                
                return (
                  <div key={attempt.id} className="flex flex-col items-center gap-3 group relative">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {new Date(attempt.created_at).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => handleReviewClick(attempt.id)}
                      className={`w-[36px] h-[36px] rounded-full flex items-center justify-center text-sm font-mono font-bold border-2 transition-all ${
                        isPassed 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-600 dark:text-red-400'
                      } hover:scale-110`}
                    >
                      {attempt.score}
                    </button>
                    <div className="w-1.5 bg-gray-100 dark:bg-slate-800 rounded-full h-[40px] relative overflow-hidden">
                      <div 
                        className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500 ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ height: `${barHeight}px` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showReviewWarning !== null && (
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[16px] p-5 md:p-6 flex flex-col md:flex-row gap-5 items-center text-center md:text-left animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-10 h-10 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-3">{t('reviewWarning')}</p>
              <div className="flex gap-3 justify-center md:justify-start">
                <button onClick={() => setShowReviewWarning(null)} className="px-5 py-2.5 rounded-[12px] text-xs font-bold text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors uppercase tracking-wider">{t('cancel')}</button>
                <button onClick={() => loadReview(showReviewWarning)} className="px-5 py-2.5 bg-amber-500 text-white rounded-[12px] text-xs font-bold hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20 uppercase tracking-wider">{t('viewReview')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// --- Shared status color helper ---
const assignmentStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'approved') return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  if (s === 'rejected' || s === 'missed') return 'bg-red-50 dark:bg-red-500/10 text-red-600 border-red-500/20';
  if (s === 'submitted' || s === 'pending') return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-500/20';
  return 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
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
  const canSubmit = !isApproved;

  const statusBadge = isApproved ? (
    <span className="inline-flex items-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-[20px] text-[11px] font-mono font-bold uppercase tracking-wider border border-emerald-500/20 gap-1.5">
      <CheckCircle2 className="w-3.5 h-3.5" />{t('assignmentApproved')}
    </span>
  ) : latestSubmission ? (
    <span className="inline-flex items-center bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-[20px] text-[11px] font-mono font-bold uppercase tracking-wider border border-amber-500/20 gap-1.5">
      <Clock className="w-3.5 h-3.5" />{t('submitted')}
    </span>
  ) : (
    <span className="inline-flex items-center bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-[20px] text-[11px] font-mono font-bold uppercase tracking-wider border border-brand-primary/20 gap-1.5">
      <Zap className="w-3.5 h-3.5 fill-current" />{t('active')}
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
          <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-[10px] text-[11px] font-mono font-bold uppercase tracking-[2px] hidden sm:inline-block">
            LSN {assignment.number}
          </span>
        </div>
      </div>

      <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-[14px] items-center shadow-inner border border-gray-200/50 dark:border-slate-800 max-w-sm mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('assignment')}
            className={`flex-1 h-10 rounded-[10px] font-bold text-[11px] uppercase tracking-[2px] transition-all duration-300 font-mono ${activeTab === 'assignment' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-gray-500'}`}
          >
            {t('assignment')}
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 h-10 rounded-[10px] font-bold text-[11px] uppercase tracking-[2px] transition-all duration-300 font-mono ${activeTab === 'quiz' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-gray-500'}`}
          >
            {t('quiz')}
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {activeTab === 'assignment' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 bg-gray-50 dark:bg-slate-800/50 p-5 md:p-8 rounded-[16px] border border-gray-100 dark:border-slate-700">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-[16px] flex items-center justify-center shrink-0">
                <FileText className="w-8 h-8 text-brand-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-mono font-bold text-brand-primary uppercase tracking-[3px] mb-1.5 block">Active Topic</span>
                <h4 className="text-xl font-bold text-brand-dark dark:text-white mb-2 leading-tight">{assignment.lesson_topic}</h4>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span className="flex items-center gap-2 text-sm font-mono text-gray-500"><Calendar className="w-4 h-4" />{new Date(assignment.start_datetime).toLocaleDateString()}</span>
                  <span className="flex items-center gap-2 text-sm font-bold text-red-500">
                    <Clock className="w-4 h-4" />Due {new Date(assignment.deadline).toLocaleDateString()}, {new Date(assignment.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              {canSubmit && (
                <button
                  onClick={onSubmit}
                  className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-[12px] font-bold text-[15px] hover:shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <UploadCloud className="w-5 h-5" />
                  {latestSubmission ? t('resubmit') : t('startSubmission')}
                </button>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-[2px] flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary" />{t('homeworkDescription')}
              </label>
              <div className="bg-white dark:bg-slate-950 rounded-[16px] p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
                <p className="text-[15px] font-medium text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
              </div>
            </div>

            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="space-y-4">
                <label className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-[2px] flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-brand-primary" />{t('homeworkResources')}
                </label>
                <div className="flex flex-wrap gap-3">
                  {assignment.attachments.map((item, idx) => (
                    <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-full hover:border-brand-primary hover:bg-white dark:hover:bg-slate-900 transition-all text-sm font-bold group shadow-sm">
                      <LinkIcon className="w-4 h-4 text-brand-primary group-hover:scale-110 transition-transform" />
                      <span className="max-w-[150px] truncate">{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {assignment.submissions && assignment.submissions.length > 0 && (
              <div className="space-y-4">
                <label className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-[2px] flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 text-brand-primary" />{t('submissionHistory')}
                </label>
                <div className="grid grid-cols-1 gap-4">
                  {assignment.submissions.map((sub, idx) => (
                    <div key={idx} className="bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700 rounded-[16px] p-5 md:p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <span className="text-[13px] font-mono font-bold text-gray-500">{new Date(sub.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-[20px] text-[11px] font-mono font-bold uppercase tracking-wider border ${assignmentStatusColor(sub.status)}`}>{sub.status}</span>
                      </div>
                      
                      {sub.student_comment && (
                        <div className="pl-4 border-l-4 border-brand-primary/30">
                           <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-widest block mb-1">Your Comment</span>
                           <p className="text-sm text-gray-600 dark:text-slate-400 font-medium italic">"{sub.student_comment}"</p>
                        </div>
                      )}

                      {sub.teacher_comment && (
                        <div className="pl-4 border-l-4 border-amber-500/30 bg-amber-500/5 p-4 rounded-r-xl">
                           <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-1">Instructor Review</span>
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

  let statusLabel = 'Pending';
  if (latestSubmission) statusLabel = latestSubmission.status;
  else if (isPastDeadline) statusLabel = 'Missed';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[16px] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-brand-primary/40 shadow-xl ring-1 ring-brand-primary/10' : 'border-gray-100 dark:border-slate-800 hover:border-brand-primary/30'}`}>
      <div onClick={onExpand} className="p-4 md:p-6 cursor-pointer flex items-center gap-4">
        <div className="w-12 h-12 rounded-[12px] bg-gray-50 dark:bg-slate-800 flex flex-col items-center justify-center shrink-0 border border-gray-100 dark:border-slate-700">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase leading-none mb-1">LSN</span>
          <span className="font-mono font-[800] text-lg leading-none">{assignment.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] text-brand-dark dark:text-white truncate mb-1">{assignment.lesson_topic}</h3>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />{new Date(assignment.start_datetime).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className={`px-3 py-1 rounded-[20px] text-[11px] font-mono font-bold uppercase tracking-wider border ${assignmentStatusColor(statusLabel)}`}>
            {statusLabel}
          </span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-slate-800 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-brand-primary/10 text-brand-primary' : 'text-gray-400'}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-50 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/10 animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 flex justify-center md:justify-start">
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-[14px] items-center shadow-inner border border-gray-200/50 dark:border-slate-800 w-full max-w-[280px]">
              <button
                onClick={() => setActiveTab('assignment')}
                className={`flex-1 h-9 rounded-[10px] font-bold text-[10px] uppercase tracking-[2px] transition-all duration-300 font-mono ${activeTab === 'assignment' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-gray-500'}`}
              >
                {t('assignment')}
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 h-9 rounded-[10px] font-bold text-[10px] uppercase tracking-[2px] transition-all duration-300 font-mono ${activeTab === 'quiz' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm' : 'text-gray-500'}`}
              >
                {t('quiz') || "Quiz"}
              </button>
            </div>
          </div>

          <div className="p-5 md:p-8">
            {activeTab === 'assignment' ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-4">
                   <label className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-[2px] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-primary" />{t('homeworkDescription')}
                  </label>
                  <div className="bg-white dark:bg-slate-900 rounded-[16px] p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
                  </div>
                </div>

                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="space-y-4">
                    <label className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-[2px] flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-brand-primary" />{t('homeworkResources')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {assignment.attachments.map((item, idx) => (
                        <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-full hover:border-brand-primary transition-all text-xs font-bold group shadow-sm">
                          <LinkIcon className="w-3.5 h-3.5 text-brand-primary group-hover:scale-110 transition-transform" />
                          <span className="max-w-[120px] truncate">{item.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {assignment.submissions && assignment.submissions.length > 0 && (
                  <div className="space-y-4">
                    <label className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-[2px] flex items-center gap-2">
                      <HistoryIcon className="w-4 h-4 text-brand-primary" />{t('submissionHistory')}
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {assignment.submissions.map((sub, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-[16px] p-5 border border-gray-100 dark:border-slate-700 flex flex-col gap-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-mono font-bold text-gray-500">{new Date(sub.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            <span className={`px-2.5 py-1 rounded-[20px] text-[10px] font-mono font-bold uppercase tracking-wider border ${assignmentStatusColor(sub.status)}`}>{sub.status}</span>
                          </div>
                          {sub.teacher_comment && (
                            <div className="pl-4 border-l-4 border-amber-500/30 bg-amber-500/5 p-4 rounded-r-xl">
                               <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-1">Instructor Review</span>
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

// --- Lessons Content Component ---
const LessonsContent: React.FC = () => {
  const { t } = useLanguage();
  const { refetch } = useDashboard();
  const { lessonsData, loading, error, markAttendance, submitAssignment } = useLessons();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRowIds, setExpandedRowIds] = useState<number[]>([]);

  const toggleRow = (id: number) => {
    setExpandedRowIds(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const [attendanceCode, setAttendanceCode] = useState('');
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [isExpired, setIsExpired] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  useEffect(() => {
    if (!lessonsData?.attendance?.closes_at || lessonsData.attendance.status !== null) return;
    const deadline = new Date(lessonsData.attendance.closes_at).getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = deadline - now;
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft('00:00:00');
        setIsExpired(true);
      } else {
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        setIsExpired(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lessonsData?.attendance?.closes_at, lessonsData?.attendance?.status]);

  const handleMarkAttendance = async () => {
    if (!attendanceCode) return;
    try {
      const res = await markAttendance(attendanceCode);
      if (res.success) {
        showToast(`Earned ${res.data.xp} XP and ${res.data.coins} Coins!`, 'success');
        setAttendanceCode('');
        refetch();
      }
    } catch (err: any) { showToast(err.message || "Invalid keyword", 'error'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-[3px] border-brand-primary/10 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-transparent border-t-brand-primary rounded-full animate-spin"></div>
        </div>
        <p className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    </div>
  );
  if (error) return <div className="text-center py-20 text-red-500 font-bold text-sm">{error}</div>;

  const attendance = lessonsData?.attendance;
  const assignments = lessonsData?.assignments;
  const currentAssignment = assignments?.current;
  const previousAssignments = assignments?.previous || [];
  const hasAnyAssignments = !!currentAssignment || previousAssignments.length > 0;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Title */}
      <div className="space-y-1 px-1">
        <h1 className="text-2xl md:text-3xl font-[800] tracking-tight text-brand-dark dark:text-white">
          {t('lessons') || "Lessons"}
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
          {t('lessonsSubtitle') || "Track your attendance and manage your assignments."}
        </p>
      </div>

      {/* Attendance Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/10 flex items-center justify-center shrink-0">
            <Clock className="w-[18px] h-[18px] text-brand-primary" />
          </div>
          <h2 className="text-[12px] font-mono font-bold text-brand-dark dark:text-white uppercase tracking-[2px]">{t('lessonAttendance')}</h2>
        </div>

        {attendance ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1 min-w-0 text-center md:text-left">
                <span className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[2px] block mb-2 opacity-80">Current Lesson</span>
                <h3 className="text-lg md:text-xl font-[800] text-brand-dark dark:text-white leading-tight mb-3">
                  Lesson {attendance.number}: {attendance.lesson_topic}
                </h3>
                <div className="flex items-center justify-center md:justify-start gap-4 text-[12px] font-mono font-bold text-gray-500">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-primary/50" /> {new Date(attendance.opens_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-primary/50" /> {new Date(attendance.opens_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {attendance.status === null && !isExpired ? (
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-5 rounded-2xl border border-slate-800 flex flex-col items-center min-w-[150px] shadow-lg">
                  <p className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">{t('timeRemaining')}</p>
                  <p className="text-2xl font-bold text-brand-primary tabular-nums tracking-tight font-mono" style={{ textShadow: '0 0 20px rgba(18,194,220,0.3)' }}>{timeLeft}</p>
                </div>
              ) : (
                <div className="shrink-0 flex justify-center w-full md:w-auto">
                  {attendance.status === 'attended' || attendance.status === 'marked' ? (
                    <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-2xl font-mono font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> {t('attended') || "Attended"}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white rounded-2xl font-mono font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-red-500/20">
                      <XCircle className="w-4 h-4" /> {t('missed') || "Missed"}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 pb-8 md:px-8">
              {(attendance.status === null) && !isExpired && (
                <div className="max-w-md mx-auto md:mx-0 space-y-3">
                  <label className="block text-[10px] font-mono font-bold text-gray-500 dark:text-slate-500 uppercase tracking-[2px] text-center md:text-left">
                    {t('enterKeyword')}
                  </label>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={attendanceCode}
                      onChange={(e) => setAttendanceCode(e.target.value)}
                      placeholder="e.g. apple"
                      className="flex-1 h-[52px] rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 px-5 text-sm font-mono font-bold focus:border-brand-primary focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-primary/8 transition-all uppercase tracking-wider"
                    />
                    <button
                      onClick={handleMarkAttendance}
                      className="h-[52px] px-7 bg-gradient-to-r from-brand-primary to-brand-accent text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/35 transition-all active:scale-95 font-mono"
                    >
                      {t('mark')}
                    </button>
                  </div>
                </div>
              )}

              {/* Re-embedded quiz section directly inside attendance for active lesson */}
              {lessonsData?.quiz && (
                <div className="pt-8 border-t border-gray-100 dark:border-slate-800 mt-8">
                   <div className="flex items-center justify-between mb-6">
                     <h4 className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[3px]">{t('todaysPractice')}</h4>
                     <div className="h-px flex-1 bg-gray-100 dark:bg-slate-800 ml-6"></div>
                   </div>
                   <QuizSection lessonId={attendance.track_id} showToast={showToast} initialData={lessonsData.quiz} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <BookOpen className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400 dark:text-slate-500">{t('noLessonsSubtitle')}</p>
          </div>
        )}
      </section>

      {/* Assignments Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/10 flex items-center justify-center shrink-0">
            <ClipboardList className="w-[18px] h-[18px] text-brand-primary" />
          </div>
          <h2 className="text-[12px] font-mono font-bold text-brand-dark dark:text-white uppercase tracking-[2px]">{t('assignments')}</h2>
        </div>

        {hasAnyAssignments ? (
          <div className="space-y-4">
            {currentAssignment && (
              <CurrentAssignmentSection
                assignment={currentAssignment}
                onSubmit={() => setIsModalOpen(true)}
                showToast={showToast}
              />
            )}
            {previousAssignments.length > 0 && (
              <div className="space-y-3">
                {currentAssignment && (
                  <p className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[2px] px-1 pt-2 flex items-center gap-2">
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

      {currentAssignment && (
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
