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
  if (error) return <div className="text-center py-20 text-red-500 font-bold text-sm">{error}</div>;

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
                onSubmit={() => setSubmittingAssignment(currentAssignment)}
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
                    onSubmit={() => setSubmittingAssignment(prev)}
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
