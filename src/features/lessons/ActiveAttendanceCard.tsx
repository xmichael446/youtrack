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
import { Card, Badge, Button } from '../../components/ui';

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

  const isAttended = attendance.status === 'attended' || attendance.status === 'marked';
  const isMissed = attendance.status !== null && !isAttended;

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <div className="p-4 md:p-6">
        {/* Header row: lesson number + topic + status */}
        <div className="flex items-center gap-3">
          {/* Lesson number badge */}
          <Badge variant="brand" className="shrink-0 flex-col items-center min-w-[44px] rounded-input py-1 px-2 gap-0">
            <span className="text-[9px] font-bold uppercase leading-none opacity-70 tracking-wider">LSN</span>
            <span className="font-mono font-bold text-h4 leading-tight">{attendance.number}</span>
          </Badge>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-label uppercase tracking-wider text-brand-primary opacity-70">{t('currentLesson')}</span>
            </div>
            <h3 className="text-h4 text-brand-dark dark:text-text-theme-dark-primary leading-snug truncate">
              {attendance.lesson_topic}
            </h3>
          </div>

          {/* Attendance status */}
          {isAttended ? (
            <Badge variant="success" dot className="shrink-0">
              <span className="hidden sm:inline">{t('attended')}</span>
            </Badge>
          ) : (isMissed || isExpired) ? (
            <Badge variant="error" dot className="shrink-0">
              <span className="hidden sm:inline">{t('missed')}</span>
            </Badge>
          ) : (
            <div className="shrink-0 flex items-center gap-1 bg-surface-dark-primary dark:bg-surface-dark-secondary px-3 py-2 rounded-input border border-surface-dark-elevated">
              <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="text-body font-bold text-brand-primary tabular-nums font-mono tracking-tight">{timeLeft}</span>
            </div>
          )}
        </div>

        {/* Date/time row */}
        <div className="flex items-center gap-4 mt-3 pl-[52px] text-caption text-text-theme-muted dark:text-text-theme-dark-muted">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(attendance.opens_at).toLocaleDateString()}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(attendance.opens_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </span>
        </div>

        {/* Attendance code input + mark button */}
        {attendance.status === null && !isExpired && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value.toLowerCase())}
              placeholder={t('enterKeywordPlaceholder')}
              className="flex-1 h-11 rounded-input border border-surface-secondary dark:border-surface-dark-elevated bg-surface-secondary dark:bg-surface-dark-secondary px-4 text-body font-bold focus:border-brand-primary focus:bg-surface-primary dark:focus:bg-surface-dark-primary focus:outline-none transition-all lowercase"
            />
            <Button
              variant="primary"
              size="md"
              loading={isSubmitting}
              onClick={handleMarkAttendance}
              disabled={isSubmitting || !attendanceCode.trim()}
              className="shrink-0 h-11 uppercase tracking-wider"
            >
              {t('mark')}
            </Button>
          </div>
        )}
      </div>

      {/* Quiz section */}
      {quiz && (
        <div className="px-4 pb-4 md:px-6 md:pb-6 border-t border-surface-secondary dark:border-surface-dark-elevated pt-4">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="text-label uppercase tracking-widest text-text-theme-muted dark:text-text-theme-dark-muted">{t('todaysPractice')}</h4>
            <div className="h-px flex-1 bg-surface-secondary dark:bg-surface-dark-elevated"></div>
          </div>
          <QuizSection lessonId={attendance.track_id} showToast={showToast} initialData={quiz} />
        </div>
      )}
    </Card>
  );
};

export default ActiveAttendanceCard;
