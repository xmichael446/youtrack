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

const RankBadge: React.FC<{ delta: number }> = ({ delta }) => {
  if (delta === 0) return null;
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-400 text-[10px] font-bold font-mono">
        <TrendingUp className="w-3 h-3" />
        {delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-red-400 text-[10px] font-bold font-mono">
      <TrendingDown className="w-3 h-3" />
      {Math.abs(delta)}
    </span>
  );
};

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, course, event, loading, enrollment } = useDashboard();
  const { navigateTo } = useNavigation();
  const BASE_URL = import.meta.env.VITE_API_URL || "https://api.youtrack.cc/";

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
      <section aria-label={t('dashboard')} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Competitive Hero Card — theme-adaptive */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 relative overflow-hidden group animate-in fade-in duration-700 border border-gray-100 dark:border-slate-800 shadow-sm">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/3 w-96 h-48 pointer-events-none bg-brand-primary/5 dark:bg-brand-primary/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000 bg-brand-primary/5 dark:bg-brand-primary/8 blur-3xl" />

          <div className="relative z-10">
            {/* Greeting */}
            <div className="mb-6 md:mb-8">
              <p className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[3px] mb-2 opacity-80">
                {t('welcomeBack')}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-dark dark:text-white leading-tight">
                {user.name}
              </h1>
              {streak > 0 ? (
                <p className="text-sm font-medium mt-1.5 text-amber-500 dark:text-amber-400">
                  {t('streakPromptActive')}
                </p>
              ) : (
                <p className="text-sm font-medium text-gray-400 dark:text-slate-500 mt-1.5">
                  {t('streakPromptNone')}
                </p>
              )}
            </div>

            {/* Competitive metrics — 2-column inline stat rows */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-slate-800">
              {/* Streak */}
              <div className="flex items-center gap-4 pr-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[2px] text-gray-400 dark:text-slate-500">
                    {t('streak')}
                  </p>
                  <p className="text-3xl md:text-4xl font-bold tabular-nums text-amber-500 dark:text-amber-400 leading-none">
                    {streak}<span className="text-base font-medium ml-1 opacity-50">d</span>
                  </p>
                </div>
              </div>

              {/* Course Rank */}
              <div className="flex items-center gap-4 pl-6">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/15 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[2px] text-gray-400 dark:text-slate-500">
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
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-5 leading-relaxed">
              You've covered <span className="font-bold text-brand-dark dark:text-white">{course.attendanceDue} {t('topics')}</span> and <span className="font-bold text-brand-dark dark:text-white">{course.assignmentsApproved} {t('assignmentsCount')}</span> in <span className="font-bold text-brand-dark dark:text-white">{course.name}</span>, with <span className="font-bold text-amber-500">{Math.round(course.attendancePercentage)}% {t('attendance').toLowerCase()}</span> — {streak > 0 ? t('keepItUp') : t('keepAtIt')}
            </p>
          </div>
        </div>

        {/* Right Column — Event Card */}
        <div className="flex flex-col gap-5">
          {event && (
            <div className={`bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-4 md:p-5 shadow-sm relative overflow-hidden group animate-in fade-in duration-700`}>
              {/* Conditional background accents based on event type */}
              {event.is_active ? (
                <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
              ) : event.type === 'contest' ? (
                <div className="absolute inset-0 bg-violet-500/5 pointer-events-none" />
              ) : (
                <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none" />
              )}
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${event.is_active ? 'bg-emerald-500 animate-ping' : event.type === 'contest' ? 'bg-violet-500' : 'bg-brand-primary'} ${!event.is_active && 'animate-pulse'}`} />
                  <span className={`text-[9px] font-semibold uppercase tracking-[2px] ${event.is_active ? 'text-emerald-600 dark:text-emerald-400' : event.type === 'contest' ? 'text-violet-600 dark:text-violet-400' : 'text-brand-primary'}`}>
                    {event.is_active ? t('liveNow') || 'Live Now' : event.type === 'contest' ? t('upcomingContest') || 'Upcoming Contest' : t('upcomingEvent')}
                  </span>
                </div>
                
                <h3 className="text-base md:text-lg font-bold leading-snug mb-2 tracking-tight text-brand-dark dark:text-white">
                  {event.type === 'lesson' && event.number != null && (
                    <span className="inline-flex items-center bg-slate-900 dark:bg-white/10 text-white px-1 py-px rounded-[4px] text-[10px] font-mono font-bold uppercase tracking-wide mr-1 align-middle">
                      {t('lsn')} {event.number}
                    </span>
                  )}
                  {event.topic}
                </h3>

                <p className="text-[11px] text-gray-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mb-4">
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
                  <button 
                    onClick={() => navigateTo('lessons')}
                    className="mt-auto w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 group/btn"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">{t('markAttendance') || 'Mark Attendance'}</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    {[
                      { label: t('hours'), value: timeLeft.days * 24 + timeLeft.hours },
                      { label: t('minutes'), value: timeLeft.minutes },
                      { label: t('seconds'), value: timeLeft.seconds },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-2.5 flex flex-col items-center border border-gray-100 dark:border-slate-700"
                      >
                        <span className={`text-xl md:text-2xl font-bold tabular-nums leading-none font-mono ${event.type === 'contest' ? 'text-violet-500' : 'text-brand-primary'}`}>
                          {item.value.toString().padStart(2, '0')}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. COURSE INFO STRIP ── */}
      <section aria-label={course.name} className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-500 delay-75 fill-mode-both">
        <div className="flex flex-col md:flex-row">

          {/* Image / Logo — full bleed on both axes */}
          {course.logo && (
            <div className="aspect-[16/7] md:aspect-auto md:w-52 md:min-h-[180px] shrink-0 relative overflow-hidden bg-gray-100 dark:bg-slate-800">
              <img
                src={`${BASE_URL}${course.logo}`}
                alt={course.name}
                className="w-full h-full object-cover"
              />
              {/* Bottom fade on mobile, right-edge fade on desktop */}
              <div className="md:hidden absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-white dark:to-slate-900" />
              <div className="hidden md:block absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-white dark:to-slate-900" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-5 md:p-6 min-w-0">
            <p className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[2px] mb-1">
              {t('curriculum')}
            </p>
            <h2 className="text-lg font-bold text-brand-dark dark:text-white tracking-tight leading-snug mb-1.5">
              {course.name}
            </h2>
            {course.description && (
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium mb-3">
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
                    className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-700/50 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all duration-200 group/teacher"
                  >
                    <img
                      src={`${BASE_URL}${teacher.image}`}
                      alt={teacher.name}
                      className="w-6 h-6 rounded-lg border border-gray-200 dark:border-slate-600 object-cover shrink-0"
                    />
                    <span className="text-[11px] font-bold text-brand-dark dark:text-slate-200 group-hover/teacher:text-brand-primary transition-colors">
                      {teacher.name}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>



      {/* ── 5. CURRICULUM ── */}
      <section id="curriculum" aria-label={t('courseCurriculum')}>
        <Curriculum />
      </section>

      {/* ── 6. TUTORIAL / VIDEO BANNER (moved to bottom) ── */}
      <section aria-label={t('guideVideo')} className="bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group border border-white/5 animate-in fade-in duration-700 delay-300 fill-mode-both">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/8 to-transparent pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-brand-primary/15 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none" />

        <div className="relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/15 text-brand-primary rounded-full mb-4 border border-brand-primary/20 text-[9px] font-semibold uppercase tracking-wider">
            <PlayCircle className="w-3 h-3" />
            {t('guideVideo')}
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">{t('masterYouTrack')}</h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-md leading-relaxed font-medium">
            {t('masterYouTrackDesc')}
          </p>
        </div>

        <button
          onClick={() => openExternalLink('https://youtu.be/5xAfErTQvic')}
          className="w-full md:w-auto shrink-0 px-7 py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 relative z-10 group/btn"
        >
          {t('watchTutorial')}
          <PlayCircle className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </section>

    </div>
  );
};

export default Dashboard;
