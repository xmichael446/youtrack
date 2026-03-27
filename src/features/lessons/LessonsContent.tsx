import React, { useState } from 'react';
import {
  Clock,
  BookOpen,
  History as HistoryIcon,
  ClipboardList
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LoadingScreen from '../../components/LoadingScreen';
import { useLessons } from '../../context/LessonsContext';
import { AssignmentData } from '../../services/apiTypes';
import Toast from '../../components/ui/Toast';
import { EmptyState } from '../../components/ui';
import SubmissionModal from './SubmissionModal';
import CurrentAssignmentSection from './CurrentAssignmentSection';
import AssignmentHistoryCard from './AssignmentHistoryCard';
import ActiveAttendanceCard from './ActiveAttendanceCard';

const LessonsContent: React.FC = () => {
  const { t } = useLanguage();
  const { lessonsData, loading, error, submitAssignment } = useLessons();

  const [submittingAssignment, setSubmittingAssignment] = useState<AssignmentData | null>(null);
  const [expandedRowIds, setExpandedRowIds] = useState<number[]>([]);

  const toggleRow = (id: number) => {
    setExpandedRowIds(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  if (loading && !lessonsData) return <LoadingScreen message={t('loadingLessons')} />;
  if (error) return <div className="text-center py-20 text-red-500 font-bold text-body">{error}</div>;

  const attendance = lessonsData?.attendance;
  const assignments = lessonsData?.assignments;
  const currentAssignment = assignments?.current;

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
        <h1 className="text-h2 md:text-h1 tracking-tight text-brand-dark dark:text-text-theme-dark-primary flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-primary shrink-0" />
          {t('lessons')}
        </h1>
        <p className="text-body text-text-theme-secondary dark:text-text-theme-dark-secondary mt-1">
          {t('lessonsSubtitle')}
        </p>
      </div>

      {/* Attendance Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Clock className="w-4 h-4 text-brand-primary shrink-0" />
          <h2 className="text-h4 text-brand-dark dark:text-text-theme-dark-primary">{t('lessonAttendance')}</h2>
        </div>

        {attendance ? (
          <ActiveAttendanceCard attendance={attendance} quiz={lessonsData?.quiz} showToast={showToast} />
        ) : (
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            message={t('noLessonsSubtitle')}
          />
        )}
      </section>

      {/* Assignments Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ClipboardList className="w-4 h-4 text-brand-primary shrink-0" />
          <h2 className="text-h4 text-brand-dark dark:text-text-theme-dark-primary">{t('assignments')}</h2>
        </div>

        {hasAnyAssignments ? (
          <div className="space-y-4">
            {showCurrentAssignment && (
              <CurrentAssignmentSection
                assignment={currentAssignment}
                onSubmit={() => setSubmittingAssignment(currentAssignment)}
                showToast={showToast}
              />
            )}
            {previousAssignments.length > 0 && (
              <div className="space-y-3">
                {showCurrentAssignment && (
                  <p className="text-label uppercase tracking-wider text-text-theme-muted dark:text-text-theme-dark-muted px-1 pt-2 flex items-center gap-2">
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
                    onSubmit={() => setSubmittingAssignment(prev)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList className="w-6 h-6" />}
            message={t('noAssignmentsSubtitle')}
          />
        )}
      </section>

      {submittingAssignment && (
        <SubmissionModal
          isOpen={true}
          onClose={() => setSubmittingAssignment(null)}
          assignment={submittingAssignment}
          onSubmit={(data) => submitAssignment(data, submittingAssignment.id)}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default LessonsContent;
