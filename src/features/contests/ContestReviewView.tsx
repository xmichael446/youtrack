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
    <div className="fixed inset-0 z-[110] flex flex-col bg-white dark:bg-slate-950 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-6">
        <h4 className="font-bold text-lg md:text-xl text-brand-dark dark:text-white tracking-tight">{t('detailedReview')}</h4>
        <div className="flex items-center gap-4">
          <div className="text-[11px] font-mono font-bold text-brand-primary uppercase tracking-widest whitespace-nowrap tabular-nums">
            {currentIndex + 1} / {answers.length}
          </div>
          <button onClick={() => goBack('contests', { id: String(contestId) })} className="p-2 -ml-2 text-gray-400 hover:text-brand-primary transition-colors">
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
            <button onClick={() => goBack('contests', { id: String(contestId) })} className="flex-[2] md:flex-none px-12 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-2xl transition-all uppercase tracking-widest font-mono block text-center active:scale-95 rounded-[12px]">
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

export default ContestReviewView;
