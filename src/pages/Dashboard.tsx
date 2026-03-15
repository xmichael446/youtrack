import React from 'react';
import {
  PlayCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Flame,
  Award,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';
import Curriculum from '../components/Curriculum';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, course, upcomingLesson, loading, enrollment } = useDashboard();
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

    if (upcomingLesson?.starts) {
      deadline = new Date(upcomingLesson.starts);
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
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [upcomingLesson]);

  if (loading || !user.name || !course.name) {
    return null;
  }

  // Rank change helpers
  const courseRankDelta = (enrollment?.last_rank ?? 0) - (enrollment?.rank ?? 0);
  const streak = enrollment?.streak ?? 0;

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

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* ── 1. HERO GRID: Competitive Card + Countdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Competitive Hero Card — theme-adaptive */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 relative overflow-hidden group animate-in fade-in slide-in-from-left-4 duration-700 border border-gray-100 dark:border-slate-800 shadow-sm">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/3 w-96 h-48 pointer-events-none bg-brand-primary/5 dark:bg-brand-primary/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000 bg-brand-primary/5 dark:bg-brand-primary/8 blur-3xl" />

          <div className="relative z-10">
            {/* Greeting */}
            <div className="mb-6 md:mb-8">
              <p className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[3px] mb-2 opacity-80">
                WELCOME BACK
              </p>
              <h1 className="text-2xl md:text-3xl font-[800] tracking-tight text-brand-dark dark:text-white leading-tight">
                {user.name}
              </h1>
              {streak > 0 ? (
                <p className="text-sm font-semibold mt-1.5 text-amber-500 dark:text-amber-400">
                  Keep the streak alive. Keep climbing.
                </p>
              ) : (
                <p className="text-sm font-semibold text-gray-400 dark:text-slate-500 mt-1.5">
                  Start your streak today — consistency wins.
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
                  <p className="text-3xl md:text-4xl font-[800] tabular-nums text-amber-500 dark:text-amber-400 leading-none">
                    {streak}<span className="text-base font-bold ml-1 opacity-50">d</span>
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
                    <p className="text-3xl md:text-4xl font-[800] tabular-nums text-brand-primary leading-none">
                      #{enrollment?.rank ?? '—'}
                    </p>
                    <RankBadge delta={courseRankDelta} />
                  </div>
                </div>
              </div>
            </div>

            {/* Motivating summary */}
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-5 leading-relaxed">
              You've covered <span className="font-bold text-brand-dark dark:text-white">{course.attendanceDue} topics</span> and <span className="font-bold text-brand-dark dark:text-white">{course.assignmentsApproved} assignments</span> in <span className="font-bold text-brand-dark dark:text-white">{course.name}</span>, with <span className="font-bold text-amber-500">{Math.round(course.attendancePercentage)}% attendance</span> — {streak > 0 ? t('keepItUp') : 'keep at it!'}
            </p>
          </div>
        </div>

        {/* Right Column — Countdown + Overall Progress */}
        <div className="flex flex-col gap-5">
          {/* Countdown */}
          <div className="flex-1 bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary rounded-3xl p-5 md:p-6 text-white shadow-2xl shadow-brand-primary/30 relative overflow-hidden group animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mb-20" />

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-white/70 uppercase tracking-[2px]">
                  {t('upcomingEvent')}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold leading-snug mb-2 tracking-tight">
                {upcomingLesson?.topic}
              </h3>
              <p className="text-[11px] text-white/70 font-medium flex items-center gap-1.5 mb-4">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {new Date(upcomingLesson.starts).toLocaleString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                }).replace(',', '')}
              </p>

              {/* Countdown */}
              <div className="grid grid-cols-3 gap-2 mt-auto">
                {[
                  { label: t('hours'), value: timeLeft.days * 24 + timeLeft.hours },
                  { label: t('minutes'), value: timeLeft.minutes },
                  { label: t('seconds'), value: timeLeft.seconds },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 flex flex-col items-center border border-white/10"
                  >
                    <span className="text-xl md:text-2xl font-bold tabular-nums leading-none font-mono">
                      {item.value.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-mono font-bold text-white/50 uppercase tracking-wider mt-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overall Progress Ring — desktop only */}
          <div className="hidden md:flex bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100 dark:text-slate-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                />
                <path
                  className="text-brand-primary"
                  strokeDasharray={`${course.completion}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(18,194,220,0.5))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-brand-dark dark:text-white tabular-nums font-mono">{course.completion}%</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('overallProgress')}</span>
          </div>
        </div>
      </div>

      {/* ── 3. COURSE INFO STRIP ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500 delay-75 fill-mode-both">
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
            <h2 className="text-lg font-[800] text-brand-dark dark:text-white tracking-tight leading-snug mb-1.5">
              {course.name}
            </h2>
            {course.description && (
              <p
                className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium mb-3"
                style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
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
      </div>

      {/* ── 4. LEVEL & STREAK CARDS ── */}
      {enrollment?.level && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 fill-mode-both">
          {/* Level Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{
                  backgroundColor: `${enrollment.level.badge_color}20`,
                  border: `1px solid ${enrollment.level.badge_color}40`,
                }}
              >
                {enrollment.level.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                  {t('currentLevel')}
                </p>
                <p className="font-bold text-brand-dark dark:text-white text-base leading-tight truncate">
                  Lvl {enrollment.level.number} · {enrollment.level.name}
                </p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono font-bold mb-1.5">
                <span className="text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  {t('xpProgress')}
                </span>
                <span style={{ color: enrollment.level.badge_color }}>
                  {enrollment.level.xp_current} / {enrollment.level.xp_next} XP
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${enrollment.level.progress_percent}%`,
                    backgroundColor: enrollment.level.badge_color,
                  }}
                />
              </div>
              {enrollment.level.description && (
                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5 font-mono">
                  {enrollment.level.description}
                </p>
              )}
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-5 md:p-6 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative z-10">
              <p className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-[2px] mb-3">
                {t('streak')}
              </p>
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-8 h-8 text-white fill-white/30" />
                <span className="text-5xl font-[800] tabular-nums">{streak}</span>
              </div>
              <p className="text-sm font-bold text-white/80">
                {t('streakDays').replace('{count}', String(streak))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. CURRICULUM ── */}
      <div id="curriculum">
        <Curriculum />
      </div>

      {/* ── 6. TUTORIAL / VIDEO BANNER (moved to bottom) ── */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group border border-white/5 animate-in fade-in zoom-in-95 duration-700 delay-300 fill-mode-both">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/8 to-transparent pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-brand-primary/15 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none" />

        <div className="relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/15 text-brand-primary rounded-full mb-4 border border-brand-primary/20 text-[9px] font-mono font-bold uppercase tracking-wider">
            <PlayCircle className="w-3 h-3" />
            {t('guideVideo')}
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">{t('masterYouTrack')}</h2>
          <p className="text-slate-400 text-xs md:text-sm max-w-md leading-relaxed font-medium">
            {t('masterYouTrackDesc')}
          </p>
        </div>

        <button className="w-full md:w-auto shrink-0 px-7 py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 relative z-10 group/btn">
          {t('watchTutorial')}
          <PlayCircle className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
