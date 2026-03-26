import React, { useState } from 'react';
import {
  Clock,
  FileText,
  UploadCloud,
  Link as LinkIcon,
  AlertTriangle,
  Calendar,
  ClipboardList,
  History as HistoryIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AssignmentData } from '../../services/apiTypes';
import { ShowToast, humanizeStatus, assignmentStatusColor, assignmentStatusDot, assignmentStatusBg } from './lessonTypes';
import QuizSection from './QuizSection';

const CurrentAssignmentSection: React.FC<{
  assignment: AssignmentData;
  onSubmit: () => void;
  showToast: ShowToast;
}> = ({ assignment, onSubmit, showToast }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'assignment' | 'quiz'>('assignment');

  const latestSubmission = assignment.submissions?.[0] ?? null;
  const isApproved = latestSubmission?.status?.toLowerCase() === 'approved';
  const isExpired = assignment.submission_window === 'closed';
  const isOverdue = assignment.submission_window === 'late';
  const canSubmit = assignment.can_submit && !isApproved;

  const statusBadge = isApproved ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
      {t('assignmentApproved')}
    </span>
  ) : isExpired ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-500 dark:text-red-400">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
      {t('assignmentExpired')}
    </span>
  ) : isOverdue ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
      {t('assignmentOverdue')}
    </span>
  ) : latestSubmission ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-500">
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
          <ClipboardList className="w-5 h-5 text-gray-400 dark:text-slate-500" />
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
            <div className="space-y-3">
              <div>
                <span className="section-label text-gray-400 dark:text-slate-500 block mb-1.5">{t('activeTopic')}</span>
                <h4 className="text-sm font-semibold text-brand-dark dark:text-white leading-snug">{assignment.lesson_topic}</h4>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
                  <Calendar className="w-3 h-3 shrink-0" />
                  {new Date(assignment.start_datetime).toLocaleDateString()}
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-orange-500 dark:text-orange-400' : 'text-red-500 dark:text-red-400'}`}>
                  <Clock className="w-3 h-3 shrink-0" />
                  {t('due')} {new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {new Date(assignment.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {canSubmit && isOverdue && !isExpired && (
                <div className="flex items-start gap-2.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl px-3.5 py-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 leading-snug">{t('lateSubmission')}</p>
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/70 mt-0.5">{t('lateSubmissionDesc')}</p>
                  </div>
                </div>
              )}

              {canSubmit && (
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
            </div>

            <div>
              <label className="section-label text-gray-400 dark:text-slate-500 flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />{t('homeworkDescription')}
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
                <label className="section-label text-gray-400 dark:text-slate-500 flex items-center gap-2">
                  <HistoryIcon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />{t('submissionHistory')}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {assignment.submissions.map((sub, idx) => (
                    <div key={idx} className="border border-gray-100 dark:border-slate-700 rounded-[12px] p-3 md:p-4 space-y-2.5">
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-slate-400 shrink-0 tabular-nums">{new Date(sub.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${assignmentStatusColor(sub.status)} ${assignmentStatusBg(sub.status)}`}>
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

export default CurrentAssignmentSection;
