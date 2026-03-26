import React, { useState } from 'react';
import {
  Clock,
  FileText,
  UploadCloud,
  Link as LinkIcon,
  AlertTriangle,
  ChevronDown,
  History as HistoryIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AssignmentData } from '../../services/apiTypes';
import { ShowToast, humanizeStatus, assignmentStatusColor, assignmentStatusDot, assignmentStatusBg } from './lessonTypes';
import QuizSection from './QuizSection';

const AssignmentHistoryCard: React.FC<{
  assignment: AssignmentData;
  isExpanded: boolean;
  onExpand: () => void;
  showToast: ShowToast;
  onSubmit?: () => void;
}> = ({ assignment, isExpanded, onExpand, showToast, onSubmit }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'assignment' | 'quiz'>('assignment');

  const latestSubmission = assignment.submissions?.[0] ?? null;
  const isApproved = latestSubmission?.status?.toLowerCase() === 'approved';
  const isPastDeadline = assignment.submission_window === 'closed';
  const isOverdue = assignment.submission_window === 'late';
  const canSubmit = assignment.can_submit && !isApproved;

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
        <div className="shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[8px] px-2.5 py-1 flex flex-col items-center min-w-[36px]">
          <span className="text-xs font-bold uppercase leading-none opacity-50">LSN</span>
          <span className="font-bold text-sm leading-tight">{assignment.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-brand-dark dark:text-white truncate leading-snug">{assignment.lesson_topic}</h3>
          <p className="text-xs font-medium text-gray-400 mt-0.5">{new Date(assignment.start_datetime).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${assignmentStatusColor(latestSubmission?.status || statusLabel)} ${assignmentStatusBg(latestSubmission?.status || statusLabel)}`}>
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
                {canSubmit && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-orange-500 dark:text-orange-400' : 'text-red-500 dark:text-red-400'}`}>
                      <Clock className="w-3 h-3 shrink-0" />
                      {t('due')} {new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {new Date(assignment.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {canSubmit && isOverdue && !isPastDeadline && (
                  <div className="flex items-start gap-2.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl px-3.5 py-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 leading-snug">{t('lateSubmission')}</p>
                      <p className="text-xs text-orange-600/80 dark:text-orange-400/70 mt-0.5">{t('lateSubmissionDesc')}</p>
                    </div>
                  </div>
                )}

                {canSubmit && onSubmit && (
                  <button
                    onClick={onSubmit}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-sm rounded-xl transition-all active:scale-[0.99] ${
                      isOverdue
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-brand-primary hover:bg-brand-primary/90 text-white'
                    }`}
                  >
                    <UploadCloud className="w-4 h-4" />
                    {isOverdue
                      ? (latestSubmission ? t('resubmitLate') : t('submitLate'))
                      : (latestSubmission ? t('resubmit') : t('startSubmission'))}
                  </button>
                )}

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

export default AssignmentHistoryCard;
