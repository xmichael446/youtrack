import React from 'react';
import { PlayCircle, Clock, Calendar, TrendingUp, BookOpen, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';
import Curriculum from '../components/Curriculum';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, course, upcomingLesson, loading } = useDashboard();
  const BASE_URL = import.meta.env.VITE_API_URL || "https://api.youtrack.cc/";

  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
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

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* Hero: Welcome + Course Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Main Welcome Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden group animate-in fade-in slide-in-from-left-4 duration-700">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-primary/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-primary/3 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Greeting */}
            <div className="mb-6 md:mb-8">
              <p className="text-[11px] font-mono font-bold text-brand-primary uppercase tracking-[3px] mb-2 opacity-80">
                {t('hello')}, {user.name.split(' ')[1] || user.name}
              </p>
              <h1 className="text-2xl md:text-3xl font-[800] tracking-tight text-brand-dark dark:text-white leading-tight">
                {course.name}
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-2">
                <span className="text-brand-primary font-bold">{course.completion}%</span> {t('completed')} &mdash; {t('keepItUp')}
              </p>
            </div>

            {/* Teachers */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {course.logo && (
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/8 border border-brand-primary/10 flex items-center justify-center p-2 shrink-0">
                  <img src={`${BASE_URL}${course.logo}`} alt="Course Logo" className="w-full h-full object-contain" />
                </div>
              )}
              {course.teachers?.map((teacher) => (
                <div key={teacher.name} className="flex items-center bg-gray-50 dark:bg-slate-800/60 pl-2 pr-4 py-2 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-sm">
                  <img
                    src={`${BASE_URL}${teacher.image}`}
                    alt={teacher.name}
                    className="w-8 h-8 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm mr-3 object-cover"
                  />
                  <div>
                    <p className="text-[9px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Instructor</p>
                    <a href={teacher.channel_link} target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold text-brand-dark dark:text-white hover:text-brand-primary transition-colors leading-none">
                      {teacher.name}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {course.description && (
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 leading-relaxed max-w-lg hidden md:block mb-8">
                {course.description}
              </p>
            )}

            {/* CTA */}
            <button
              onClick={() => document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.02] active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              {t('curriculum')}
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {/* Upcoming Lesson Countdown */}
          <div className="bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary rounded-3xl p-5 md:p-6 text-white shadow-2xl shadow-brand-primary/30 relative overflow-hidden group animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mb-20"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                <span className="text-[9px] font-mono font-bold text-white/70 uppercase tracking-[2px]">{t('upcomingEvent')}</span>
              </div>
              <h3 className="text-base md:text-lg font-bold leading-snug mb-2 tracking-tight">{upcomingLesson?.topic}</h3>
              <p className="text-[11px] text-white/70 font-medium flex items-center gap-1.5 mb-4">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {new Date(upcomingLesson.starts).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).replace(",", "")}
              </p>

              {/* Countdown */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: t('hours'), value: (timeLeft.days * 24) + timeLeft.hours },
                  { label: t('minutes'), value: timeLeft.minutes },
                  { label: t('seconds'), value: timeLeft.seconds },
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-2.5 flex flex-col items-center border border-white/10">
                    <span className="text-xl md:text-2xl font-bold tabular-nums leading-none font-mono">{item.value.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] font-mono font-bold text-white/50 uppercase tracking-wider mt-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
            <div className="relative w-28 h-28 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path
                  className="text-brand-primary"
                  strokeDasharray={`${course.completion}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(18,194,220,0.5))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-brand-dark dark:text-white tabular-nums font-mono">{course.completion}%</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('overallProgress')}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {[
          { icon: Calendar, label: t('courseDays'), value: course.daysPassed.toString(), suffix: `/ ${course.daysTotal}`, color: 'text-violet-500', bg: 'bg-violet-500/8 dark:bg-violet-500/10', delay: '' },
          { icon: TrendingUp, label: t('topicsCovered'), value: course.attendanceDue.toString(), suffix: `/ ${course.attendanceTotal}`, color: 'text-emerald-500', bg: 'bg-emerald-500/8 dark:bg-emerald-500/10', delay: 'delay-75' },
          { icon: Clock, label: t('attendance'), value: Math.round(course.attendancePercentage).toString(), suffix: '%', color: 'text-amber-500', bg: 'bg-amber-500/8 dark:bg-amber-500/10', delay: 'delay-150' },
          { icon: PlayCircle, label: t('assignments'), value: course.assignmentsApproved.toString(), suffix: `/ ${course.assignmentsTotal}`, color: 'text-brand-primary', bg: 'bg-brand-primary/8 dark:bg-brand-primary/10', delay: 'delay-200' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-md hover:border-brand-primary/15 group animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both ${stat.delay}`}
          >
            <div className={`w-10 h-10 mb-4 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-bold text-brand-dark dark:text-white tracking-tight tabular-nums font-mono">{stat.value}</span>
              <span className="text-xs font-mono text-gray-400 dark:text-slate-500">{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tutorial Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group border border-white/5 animate-in fade-in zoom-in-95 duration-700 delay-300 fill-mode-both">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/8 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-brand-primary/15 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000 pointer-events-none"></div>

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

      <div id="curriculum">
        <Curriculum />
      </div>
    </div>
  );
};

export default Dashboard;
