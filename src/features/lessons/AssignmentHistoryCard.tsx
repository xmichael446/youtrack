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
import { Card, Badge, Button } from '../../components/ui';

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

  const statusVariant = (() => {
    if (isApproved) return 'success' as const;
    if (isPastDeadline && !latestSubmission) return 'error' as const;
    if (isOverdue) return 'warning' as const;
    if (latestSubmission) return 'warning' as const;
    return 'muted' as const;
  })();

  return (
    <Card
      variant="bordered"
      padding="none"
      className={`overflow-hidden transition-all duration-normal ${isExpanded ? 'border-brand-primary/40 shadow-xl ring-1 ring-brand-primary/10' : 'hover:border-brand-primary/30'}`}
    >
      {/* Collapsed header row — clickable */}
      <button
        type="button"
        onClick={onExpand}
        className="w-full p-4 md:p-6 cursor-pointer flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      >
        {/* Lesson number */}
        <div className="shrink-0 bg-surface-dark-primary dark:bg-surface-primary text-white dark:text-surface-dark-primary rounded-button px-2 py-1 flex flex-col items-center min-w-[36px]">
          <span className="text-caption font-bold uppercase leading-none opacity-50">LSN</span>
          <span className="font-bold text-body leading-tight">{assignment.number}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-h4 text-brand-dark dark:text-text-theme-dark-primary truncate leading-snug">{assignment.lesson_topic}</h3>
          <p className="text-caption text-text-theme-muted mt-0.5">{new Date(assignment.start_datetime).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={statusVariant} dot size="sm">
            {statusLabel}
          </Badge>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-surface-secondary dark:bg-surface-dark-secondary transition-transform duration-normal ${isExpanded ? 'rotate-180 bg-brand-primary/10 text-brand-primary' : 'text-text-theme-muted'}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-surface-secondary dark:border-surface-dark-elevated bg-surface-secondary/30 dark:bg-surface-dark-secondary/10 animate-in duration-normal">
          {/* Tab switcher */}
          <div className="px-4 py-3 border-b border-surface-secondary dark:border-surface-dark-elevated flex justify-center md:justify-start">
            <div className="flex bg-surface-secondary dark:bg-surface-dark-primary p-1 rounded-[14px] items-center shadow-inner border border-surface-secondary/50 dark:border-surface-dark-elevated w-full max-w-[280px]">
              <button
                onClick={() => setActiveTab('assignment')}
                className={`flex-1 h-9 rounded-[10px] font-bold text-label uppercase tracking-wider transition-all duration-normal ${activeTab === 'assignment' ? 'bg-surface-primary dark:bg-surface-dark-secondary text-brand-primary shadow-sm' : 'text-text-theme-secondary'}`}
              >
                {t('assignment')}
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 h-9 rounded-[10px] font-bold text-label uppercase tracking-wider transition-all duration-normal ${activeTab === 'quiz' ? 'bg-surface-primary dark:bg-surface-dark-secondary text-brand-primary shadow-sm' : 'text-text-theme-secondary'}`}
              >
                {t('quiz')}
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'assignment' ? (
              <div className="space-y-4 animate-in fade-in duration-normal">
                {canSubmit && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                    <span className={`flex items-center gap-1 text-caption ${isOverdue ? 'text-orange-500 dark:text-orange-400' : 'text-red-500 dark:text-red-400'}`}>
                      <Clock className="w-3 h-3 shrink-0" />
                      {t('due')} {new Date(assignment.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {new Date(assignment.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {canSubmit && isOverdue && !isPastDeadline && (
                  <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-input px-3 py-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-caption font-semibold text-orange-700 dark:text-orange-400 leading-snug">{t('lateSubmission')}</p>
                      <p className="text-caption text-orange-600/80 dark:text-orange-400/70 mt-0.5">{t('lateSubmissionDesc')}</p>
                    </div>
                  </div>
                )}

                {canSubmit && onSubmit && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    icon={<UploadCloud className="w-4 h-4" />}
                    onClick={onSubmit}
                    className={isOverdue ? 'from-orange-500 to-orange-600 shadow-orange-500/20 hover:shadow-orange-500/35' : ''}
                  >
                    {isOverdue
                      ? (latestSubmission ? t('resubmitLate') : t('submitLate'))
                      : (latestSubmission ? t('resubmit') : t('startSubmission'))}
                  </Button>
                )}

                <div>
                  <label className="section-label text-text-theme-muted flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-brand-primary" />{t('homeworkDescription')}
                  </label>
                  <blockquote className="border-l-2 border-surface-secondary dark:border-surface-dark-elevated pl-3 text-body text-text-theme-secondary dark:text-text-theme-dark-secondary leading-relaxed whitespace-pre-wrap">{assignment.description}</blockquote>
                </div>

                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {assignment.attachments.map((item, idx) => (
                      <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1 border border-surface-secondary dark:border-surface-dark-elevated rounded-full hover:border-brand-primary/40 hover:text-brand-primary transition-all text-caption font-medium group">
                        <LinkIcon className="w-3 h-3 text-brand-primary" />
                        <span className="max-w-[120px] truncate">{item.name}</span>
                      </a>
                    ))}
                  </div>
                )}

                {assignment.submissions && assignment.submissions.length > 0 && (
                  <div className="space-y-2">
                    <label className="section-label text-text-theme-muted flex items-center gap-2">
                      <HistoryIcon className="w-4 h-4 text-brand-primary" />{t('submissionHistory')}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {assignment.submissions.map((sub, idx) => (
                        <div key={idx} className="rounded-input p-3 border border-surface-secondary dark:border-surface-dark-elevated flex flex-col gap-2">
                          <div className="flex justify-between items-center gap-3">
                            <span className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary shrink-0 tabular-nums">{new Date(sub.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            <span className={`inline-flex items-center gap-1 text-caption shrink-0 ${assignmentStatusColor(sub.status)}`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${assignmentStatusDot(sub.status)}`}></span>
                              {humanizeStatus(sub.status)}
                            </span>
                          </div>
                          {sub.teacher_comment && (
                            <div className="border-l-2 border-amber-500/40 pl-3 py-1">
                              <span className="section-label text-amber-500 block mb-1">{t('instructorReview')}</span>
                              <p className="text-caption text-text-theme-primary dark:text-text-theme-dark-primary font-bold italic">"{sub.teacher_comment}"</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in duration-normal">
                <QuizSection lessonId={assignment.id} showToast={showToast} initialData={assignment.quiz} />
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AssignmentHistoryCard;
