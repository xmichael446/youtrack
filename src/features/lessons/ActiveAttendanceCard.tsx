import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLessons } from '../../context/LessonsContext';
import { useDashboard } from '../../context/DashboardContext';
import { AttendanceData, QuizSessionData } from '../../services/apiTypes';
import { ShowToast } from './lessonTypes';
import QuizSection from './QuizSection';

const ActiveAttendanceCard: React.FC<{
  attendance: AttendanceData;
  quiz: QuizSessionData | null | undefined;
  showToast: ShowToast;
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
    <div className="bg-surface-primary dark:bg-surface-dark-primary rounded-card border border-surface-secondary dark:border-surface-dark-elevated overflow-hidden shadow-sm">
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="shrink-0 bg-brand-primary/10 border border-brand-primary/20 rounded-[10px] px-2 py-1 flex flex-col items-center min-w-[40px]">
            <span className="text-caption font-bold text-brand-primary uppercase leading-none opacity-70">LSN</span>
            <span className="font-mono font-medium text-h4 leading-tight text-brand-primary">{attendance.number}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-caption font-bold text-brand-primary uppercase tracking-wider opacity-70">{t('currentLesson')}</span>
            </div>
            <h3 className="text-h4 text-brand-dark dark:text-text-theme-dark-primary leading-snug truncate">
              {attendance.lesson_topic}
            </h3>
          </div>
          {attendance.status === 'attended' || attendance.status === 'marked' ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-caption bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="hidden sm:inline">{t('attended')}</span>
            </span>
          ) : (attendance.status !== null || isExpired) ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-caption bg-red-500/10 text-red-500 dark:text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              <span className="hidden sm:inline">{t('missed')}</span>
            </span>
          ) : (
            <div className="shrink-0 flex items-center gap-1 bg-surface-dark-primary dark:bg-surface-dark-secondary px-3 py-2 rounded-input border border-surface-dark-elevated">
              <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="text-body font-bold text-brand-primary tabular-nums font-mono tracking-tight">{timeLeft}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3 pl-[52px] text-caption text-text-theme-muted">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> <span>{new Date(attendance.opens_at).toLocaleDateString()}</span></span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> <span>{new Date(attendance.opens_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></span>
        </div>

        {attendance.status === null && !isExpired && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value.toLowerCase())}
              placeholder={t('enterKeywordPlaceholder')}
              className="flex-1 h-11 rounded-input border border-surface-secondary dark:border-surface-dark-elevated bg-surface-secondary dark:bg-surface-dark-secondary px-4 text-body font-bold focus:border-brand-primary focus:bg-surface-primary dark:focus:bg-surface-dark-primary focus:outline-none transition-all lowercase"
            />
            <button
              onClick={handleMarkAttendance}
              disabled={isSubmitting || !attendanceCode.trim()}
              className="shrink-0 h-11 px-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-button font-bold text-label uppercase tracking-wider shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/35 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '...' : t('mark')}
            </button>
          </div>
        )}
      </div>

      {quiz && (
        <div className="px-4 pb-4 md:px-6 md:pb-6 border-t border-surface-secondary dark:border-surface-dark-elevated pt-4">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="text-caption font-bold text-text-theme-muted dark:text-text-theme-dark-muted uppercase tracking-widest">{t('todaysPractice')}</h4>
            <div className="h-px flex-1 bg-surface-secondary dark:bg-surface-dark-elevated"></div>
          </div>
          <QuizSection lessonId={attendance.track_id} showToast={showToast} initialData={quiz} />
        </div>
      )}
    </div>
  );
};

export default ActiveAttendanceCard;
