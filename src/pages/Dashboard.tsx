import React from 'react';
import { PlayCircle, Clock, Calendar, TrendingUp, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';
import Curriculum from '../components/Curriculum';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user, course, upcomingLesson, loading } = useDashboard();
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

  // Countdown State - use upcoming lesson if available
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  React.useEffect(() => {
    let deadline: Date;

    if (upcomingLesson?.starts) {
      deadline = new Date(upcomingLesson.starts);
    } else {
      // Fallback: Set mock deadline to 3 days, 4 hours from now
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

  // Don't render until data is loaded (after all hooks)
  if (loading || !user.name || !course.name) {
    return null;
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 px-1">
      {/* Welcome & Resume Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="relative z-10">
            {/* Course & Instructor Info */}
            <div className="flex-1 min-w-0">
              {/* 1. Greeting & Progress at the Top */}
              <div className="space-y-3 mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.1]">
                  {t('hello')}, {user.name.split(' ')[1] || user.name}!
                </h1>
                <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-xl font-medium">
                  <span className="font-extrabold text-gray-700 dark:text-slate-300">{course.name}</span> {t('is')} <span className="font-black text-brand-primary">{course.completion}%</span> {t('completed')}. {t('keepItUp')}
                </p>
              </div>

              {/* 2. Course & Instructor Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center p-2.5 shrink-0">
                  <img src={`${BASE_URL}${course.logo}`} alt="Course Logo" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-black text-brand-dark dark:text-white leading-tight truncate">{course.name}</h2>
                  <div className="flex items-center mt-1.5">
                    {course.teachers?.map((teacher, index) => (
                      <div key={teacher.name} className="flex items-center mr-1 last:mr-0">
                        {index > 0 && <span className="text-xs font-bold text-gray-500 dark:text-slate-400">{t('and')}</span>}
                        <img
                          src={`${BASE_URL}${teacher.image}`}
                          alt={teacher.name}
                          className="w-6 h-6 rounded-full mr-2 ml-1 first:ml-0"
                        />
                        <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                          {index === 0 && <span className="mr-1">{t('by')}</span>}

                          <a href={teacher.channel_link} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline transition-colors">
                            {teacher.name}
                          </a>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Course Description at the Bottom of the stack */}
              <div className="mb-8">
                <p className="text-sm font-bold text-gray-400 dark:text-slate-500 leading-relaxed max-w-md">
                  {course.description}
                </p>
              </div>

              <button
                onClick={() => document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-12 px-8 bg-brand-primary text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand-primary/20 hover:bg-brand-accent hover:scale-[1.02] active:scale-95 flex items-center justify-center min-w-[160px]"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {t('curriculum')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Progress and Upcoming Event */}
        <div className="flex flex-col gap-6">

          {/* Upcoming Event */}
          <div className="bg-brand-primary rounded-3xl p-6 text-white shadow-xl shadow-brand-primary/25 relative overflow-hidden group flex flex-col gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-white/70 uppercase tracking-[0.2em] mb-4">{t('upcomingEvent')}</p>
              <h3 className="text-xl font-bold leading-tight mb-2">{upcomingLesson?.topic}</h3>
              <p className="text-sm text-white/80 font-medium opacity-90">{new Date(upcomingLesson.starts).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, }).replace(",", "")}</p>
            </div>

            {/* Countdown Timer */}
            <div className="relative z-10 w-full">
              <div className="flex items-center justify-between gap-3">
                {[
                  { label: t('hours'), value: (timeLeft.days * 24) + timeLeft.hours },
                  { label: t('minutes'), value: timeLeft.minutes },
                  { label: t('seconds'), value: timeLeft.seconds },
                ].map((item, i) => (
                  <div key={i} className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center border border-white/10">
                    <span className="text-2xl font-black tabular-nums leading-none mb-1">{item.value.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-white/60">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 dark:bg-slate-800/30 rounded-3xl p-6 border-2 border-gray-200 dark:border-slate-800/50 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-200 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                <path className="text-brand-primary drop-shadow-[0_0_8px_rgba(18,194,220,0.4)]" strokeDasharray={`${course.completion}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-brand-dark dark:text-white tabular-nums">{course.completion}%</span>
              </div>
            </div>
            <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none">{t('overallProgress')}</span>
          </div>
        </div>
      </div>

      {/* Stats Section with improved readability */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Calendar, label: t('courseDays'), value: course.daysPassed.toString(), suffix: `/ ${course.daysTotal}`, color: 'text-indigo-500' },
          { icon: TrendingUp, label: t('topicsCovered'), value: course.attendanceDue.toString(), suffix: `/ ${course.attendanceTotal}`, color: 'text-emerald-500' },
          { icon: Clock, label: t('attendance'), value: Math.round(course.attendancePercentage).toString(), suffix: '%', color: 'text-amber-500' },
          { icon: PlayCircle, label: t('assignments'), value: course.assignmentsApproved.toString(), suffix: `/ ${course.assignmentsTotal}`, color: 'text-brand-primary' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-5 md:p-7 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:border-brand-primary/20 group">
            <div className={`w-12 h-12 md:w-14 md:h-14 mb-5 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-slate-800/50 group-hover:scale-110 transition-transform duration-500 ${stat.color}`}>
              <stat.icon className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <p className="text-[11px] md:text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-[0.15em] mb-1">{stat.label}</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl md:text-3xl font-extrabold text-brand-dark dark:text-white tracking-tight tabular-nums">{stat.value}</span>
              <span className="text-xs md:text-sm font-semibold text-gray-400 dark:text-slate-500">{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions Banner Refined */}
      <div className="bg-slate-950 rounded-3xl p-6 md:p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-primary/10 to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>

        <div className="mb-8 md:mb-0 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full mb-4 border border-brand-primary/20">
            <PlayCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('guideVideo')}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{t('masterYouTrack')}</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-lg leading-relaxed font-normal">
            {t('masterYouTrackDesc')}
          </p>
        </div>
        <button className="px-12 py-5 bg-brand-primary hover:bg-brand-accent text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-primary/30 flex items-center whitespace-nowrap relative z-10 hover:scale-[1.05] active:scale-95 text-base active:shadow-inner">
          {t('watchTutorial')}
        </button>
      </div>


      <Curriculum />
    </div>
  );
};

export default Dashboard;