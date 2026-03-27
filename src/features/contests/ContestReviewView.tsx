import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { Button } from '../../components/ui';
import type { ContestNav } from './contestTypes';

const ContestReviewView: React.FC<{
  answers: any[];
  onNavigate: (nav: ContestNav) => void;
  contestId: number;
}> = ({ answers, onNavigate, contestId }) => {
  const { t } = useLanguage();
  const { goBack } = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!answers || answers.length === 0) return null;
  const item = answers[currentIndex];
  if (!item) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex flex-col bg-surface-primary dark:bg-surface-dark-primary animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-surface-secondary dark:border-surface-dark-elevated bg-surface-primary/80 dark:bg-surface-dark-primary/80 backdrop-blur-md z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
        <h4 className="text-h3 text-brand-dark dark:text-white tracking-tight">{t('detailedReview')}</h4>
        <div className="flex items-center gap-4">
          <div className="text-[11px] font-mono font-bold text-brand-primary uppercase tracking-widest whitespace-nowrap tabular-nums">
            {currentIndex + 1} / {answers.length}
          </div>
          <Button variant="ghost" size="sm" onClick={() => goBack('contests', { id: String(contestId) })} className="-ml-2">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar">
        <div className="max-w-4xl mx-auto py-2">
          <div className={`rounded-card border-2 overflow-hidden transition-all shadow-sm ${item.is_correct ? 'border-emerald-500/20 bg-emerald-50/5' : 'border-red-500/20 bg-red-50/5'}`}>
            <div className="p-4 md:p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <span className={`text-caption font-mono font-bold uppercase tracking-[2px] ${item.is_correct ? 'text-emerald-500' : 'text-red-500'}`}>Question {currentIndex + 1}</span>
                  <h5 className="font-bold text-body text-brand-dark dark:text-white leading-snug">{item.question_text}</h5>
                </div>
                <div className={`w-10 h-10 rounded-input flex items-center justify-center shrink-0 shadow-sm ${item.is_correct ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                  {item.is_correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {item.options?.map((option: any) => {
                  const isSelected = item.selected_option_id === option.id;
                  const isCorrect = option.is_correct;
                  let stateClass = 'bg-surface-primary dark:bg-surface-dark-primary border-surface-secondary dark:border-surface-dark-elevated text-text-theme-secondary';
                  if (isSelected && isCorrect) stateClass = 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20';
                  else if (isSelected && !isCorrect) stateClass = 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20';
                  else if (isCorrect) stateClass = 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30';

                  return (
                    <div key={option.id} className={`p-3 md:p-4 rounded-input border text-caption md:text-body font-bold flex items-center gap-3 transition-all ${stateClass}`}>
                      {isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : isSelected ? <XCircle className="w-4 h-4 shrink-0" /> : <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20 shrink-0" />}
                      <span>{option.content}</span>
                    </div>
                  );
                })}
              </div>

              {item.explanation && (
                <div className="bg-surface-primary/80 dark:bg-surface-dark-secondary/50 p-4 rounded-card border border-surface-secondary dark:border-surface-dark-elevated shadow-card relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary opacity-30"></div>
                  <span className="text-caption font-mono font-bold text-brand-primary uppercase tracking-[2px] block mb-1 opacity-70">{t('explanation')}</span>
                  <p className="text-caption font-medium text-text-theme-secondary dark:text-text-theme-dark-secondary italic leading-relaxed">{item.explanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-4 bg-surface-primary dark:bg-surface-dark-secondary border-t border-surface-secondary dark:border-surface-dark-elevated shadow-[0_-10px_40px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="md"
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
            disabled={currentIndex === 0}
            className="flex-1 md:flex-none"
          >
            <span className="hidden md:inline">{t('previousQuestion') || 'Previous'}</span>
            <span className="md:hidden">{t('back')}</span>
          </Button>

          {currentIndex === answers.length - 1 ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() => goBack('contests', { id: String(contestId) })}
              className="flex-[2] md:flex-none"
            >
              {t('backToOverview')}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => currentIndex < answers.length - 1 && setCurrentIndex(prev => prev + 1)}
              className="flex-[2] md:flex-none"
            >
              {t('nextQuestion') || 'Next'}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ContestReviewView;
