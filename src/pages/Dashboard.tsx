import React from 'react';
import {
  PlayCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Flame,
  Award,
  Swords,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';
import { useNavigation } from '../context/NavigationContext';
import LoadingScreen from '../components/LoadingScreen';
import Curriculum from '../components/Curriculum';
import { openExternalLink } from '../utils/telegram';
import { Card, Button, Badge } from '../components/ui';

const RankBadge: React.FC<{ delta: number }> = ({ delta }) => {
  if (delta === 0) return null;
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-400 text-xs font-medium tabular-nums">
        <TrendingUp className="w-3 h-3" />
        {delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-red-400 text-xs font-medium tabular-nums">
      <TrendingDown className="w-3 h-3" />
      {Math.abs(delta)}
    </span>
  );
};

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, course, event, loading, enrollment } = useDashboard();
  const { navigateTo } = useNavigation();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  }, []);

  React.useEffect(() => {
    let deadline: Date;

    if (event?.starts) {
      deadline = new Date(event.starts);
    } else {
      deadline = new Date();
      deadline.setDate(deadline.getDate() + 3);
      deadline.setHours(deadline.getHours() + 4);
      deadline.setMinutes(30);
    }

    const timer = setInterval(() => {
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  if (!user.name || !course.name) {
    return <LoadingScreen message={t('syncingDashboard')} />;
  }

  // Rank change helpers
  const courseRankDelta = (enrollment?.last_rank ?? 0) - (enrollment?.rank ?? 0);
  const streak = enrollment?.streak ?? 0;


  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-700 pb-10">

      {/* ── 1. HERO GRID: Competitive Card + Countdown ── */}
      <section aria-label={t('dashboard')} className={`grid grid-cols-1 ${event ? 'lg:grid-cols-3' : ''} gap-4`}>

        {/* Competitive Hero Card */}
        <Card
          variant="default"
          padding="none"
          className={`${event ? 'lg:col-span-2' : ''} p-4 md:p-6 relative overflow-hidden group animate-in fade-in duration-700`}
        >
          <div className="relative z-10">
            {/* Greeting */}
            <div className="mb-6 md:mb-8">
              <p className="text-caption text-brand-primary mb-2 opacity-80">
                {t('welcomeBack')}
              </p>
              <h1 className="text-h1 tracking-tight text-brand-dark dark:text-text-theme-dark-primary leading-tight">
                {user.name}
              </h1>
              {streak > 0 ? (
                <p className="text-body mt-1 text-amber-500 dark:text-amber-400">
                  {t('streakPromptActive')}
                </p>
              ) : (
                <p className="text-body text-text-theme-muted dark:text-text-theme-dark-muted mt-1">
                  {t('streakPromptNone')}
                </p>
              )}
            </div>

            {/* Competitive metrics — 2-column inline stat rows */}
            <div className="grid grid-cols-2 divide-x divide-surface-secondary dark:divide-surface-dark-elevated">
              {/* Streak */}
              <div className="flex items-center gap-4 pr-6">
                <div className="w-10 h-10 rounded-card bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">
                    {t('streak')}
                  </p>
                  <p className="text-3xl md:text-4xl font-bold tabular-nums text-amber-500 dark:text-amber-400 leading-none">
                    {streak}<span className="text-base font-medium ml-1 opacity-50">d</span>
                  </p>
                </div>
              </div>

              {/* Course Rank */}
              <div className="flex items-center gap-4 pl-6">
                <div className="w-10 h-10 rounded-card bg-brand-primary/10 dark:bg-brand-primary/15 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">
                    {t('yourRank')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl md:text-4xl font-bold tabular-nums text-brand-primary leading-none">
                      #{enrollment?.rank ?? '—'}
                    </p>
                    <RankBadge delta={courseRankDelta} />
                  </div>
                </div>
              </div>
            </div>

            {/* Motivating summary */}
            <p className="text-body text-text-theme-secondary dark:text-text-theme-dark-secondary mt-4 leading-relaxed">
              {language === 'en' ? (
                <>
                  You've covered <span className="font-bold text-brand-dark dark:text-white">{course.attendanceDue} {t('topics')}</span> and <span className="font-bold text-brand-dark dark:text-white">{course.assignmentsApproved} {t('assignmentsCount')}</span> in <span className="font-bold text-brand-dark dark:text-white">{course.name}</span>, with <span className="font-bold text-amber-500">{Math.round(course.attendancePercentage)}% {t('attendance').toLowerCase()}</span> — {streak > 0 ? t('keepItUp') : t('keepAtIt')}
                </>
              ) : (
                <>
                  Siz <span className="font-bold text-brand-dark dark:text-white">{course.name}</span> kursida <span className="font-bold text-brand-dark dark:text-white">{course.attendanceDue} ta {t('topics')}</span> va <span className="font-bold text-brand-dark dark:text-white">{course.assignmentsApproved} ta {t('assignmentsCount')}</span>ni yakunladingiz, umumiy davomatingiz esa <span className="font-bold text-amber-500">{Math.round(course.attendancePercentage)}%</span> — {streak > 0 ? t('keepItUp') : t('keepAtIt')}
                </>
              )}
            </p>
          </div>
        </Card>

        {/* Right Column — Event Card */}
        {event && (
          <div className="flex flex-col gap-4">
            <Card
              variant="default"
              padding="md"
              className="relative overflow-hidden group animate-in fade-in duration-700"
            >
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${event.is_active ? 'bg-emerald-500 animate-ping' : event.type === 'contest' ? 'bg-violet-500' : 'bg-brand-primary'} ${!event.is_active && 'animate-pulse'}`} />
                  <Badge
                    variant={event.is_active ? 'success' : event.type === 'contest' ? 'warning' : 'brand'}
                    size="sm"
                  >
                    {event.is_active ? t('liveNow') : event.type === 'contest' ? t('upcomingContest') : t('upcomingEvent')}
                  </Badge>
                </div>

                <h3 className="text-h4 md:text-h3 leading-snug mb-2 tracking-tight text-brand-dark dark:text-text-theme-dark-primary">
                  {event.type === 'lesson' && event.number != null && (
                    <span className="inline-flex items-center bg-brand-dark dark:bg-white/10 text-white px-1 py-px rounded-[4px] text-[10px] font-mono uppercase tracking-wide mr-1 align-middle">
                      LSN {event.number}
                    </span>
                  )}
                  {event.topic}
                </h3>

                <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted flex items-center gap-2 mb-4">
                  {event.type === 'contest' ? <Swords className="w-3.5 h-3.5 shrink-0" /> : <Calendar className="w-3.5 h-3.5 shrink-0" />}
                  {new Date(event.starts).toLocaleString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  }).replace(',', '')}
                </p>

                {event.is_active ? (
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    icon={<ChevronRight className="w-4 h-4" />}
                    iconPosition="right"
                    onClick={() => navigateTo('lessons')}
                    className="mt-auto bg-emerald-500 from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20"
                  >
                    {t('markAttendance')}
                  </Button>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    {[
                      { label: timeLeft.days > 0 ? t('days') : t('hours'), value: timeLeft.days > 0 ? timeLeft.days : timeLeft.hours },
                      { label: t('minutes'), value: timeLeft.minutes },
                      { label: t('seconds'), value: timeLeft.seconds },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-surface-secondary dark:bg-surface-dark-elevated rounded-card p-2 flex flex-col items-center border border-surface-secondary dark:border-surface-dark-elevated"
                      >
                        <span className={`text-xl md:text-2xl font-bold tabular-nums leading-none font-mono ${event.type === 'contest' ? 'text-violet-500' : 'text-brand-primary'}`}>
                          {item.value.toString().padStart(2, '0')}
                        </span>
                        <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted mt-1">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* ── 3. COURSE INFO STRIP ── */}
      <section aria-label={course.name} className="animate-in fade-in duration-500 delay-75 fill-mode-both">
      <Card
        variant="bordered"
        padding="none"
        className="overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">

          {/* Image / Logo — full bleed on both axes */}
          {course.logo && (
            <div className="aspect-[16/7] md:aspect-auto md:w-52 md:min-h-[180px] shrink-0 relative overflow-hidden bg-surface-secondary dark:bg-surface-dark-elevated">
              <img
                src={`${BASE_URL}${course.logo}`}
                alt={course.name}
                className="w-full h-full object-cover"
              />
              {/* Bottom fade on mobile, right-edge fade on desktop */}
              <div className="md:hidden absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-surface-primary dark:to-surface-dark-secondary" />
              <div className="hidden md:block absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-surface-primary dark:to-surface-dark-secondary" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 min-w-0">
            <p className="section-label mb-1">
              {t('curriculum')}
            </p>
            <h2 className="text-h3 text-brand-dark dark:text-text-theme-dark-primary tracking-tight leading-snug mb-1">
              {course.name}
            </h2>
            {course.description && (
              <p className="text-body text-text-theme-secondary dark:text-text-theme-dark-secondary leading-relaxed mb-3">
                {course.description}
              </p>
            )}
            {course.teachers && course.teachers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {course.teachers.map((teacher) => (
                  <a
                    key={teacher.name}
                    href={teacher.channel_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 pl-1 pr-3 py-1 bg-surface-secondary dark:bg-surface-dark-elevated/60 rounded-input border border-surface-secondary dark:border-surface-dark-elevated/50 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all duration-fast group/teacher"
                  >
                    <img
                      src={`${BASE_URL}${teacher.image}`}
                      alt={teacher.name}
                      className="w-6 h-6 rounded-button border border-surface-secondary dark:border-surface-dark-elevated object-cover shrink-0"
                    />
                    <span className="text-caption text-brand-dark dark:text-text-theme-dark-primary group-hover/teacher:text-brand-primary transition-colors">
                      {teacher.name}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
      </section>



      {/* ── 5. CURRICULUM ── */}
      <section id="curriculum" aria-label={t('courseCurriculum')}>
        <Curriculum />
      </section>

      {/* ── 6. TUTORIAL / VIDEO BANNER (moved to bottom) ── */}
      <section aria-label={t('guideVideo')} className="animate-in fade-in duration-700 delay-300 fill-mode-both">
      <Card
        variant="default"
        padding="none"
        className="p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group border border-white/5 bg-brand-dark dark:bg-surface-dark-secondary"
      >
        <div className="relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/15 text-brand-primary rounded-full mb-4 border border-brand-primary/20 text-caption">
            <PlayCircle className="w-3 h-3" />
            {t('guideVideo')}
          </div>
          <h2 className="text-h2 mb-2 tracking-tight">{t('masterYouTrack')}</h2>
          <p className="text-white/60 text-body max-w-md leading-relaxed">
            {t('masterYouTrackDesc')}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<PlayCircle className="w-4 h-4" />}
          iconPosition="right"
          onClick={() => openExternalLink('https://youtu.be/5xAfErTQvic')}
          className="w-full md:w-auto shrink-0 relative z-10"
        >
          {t('watchTutorial')}
        </Button>
      </Card>
      </section>

    </div>
  );
};

export default Dashboard;
