import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Calendar, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';

const Curriculum: React.FC = () => {
    const { t } = useLanguage();
    const { curriculum } = useDashboard();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000 * 60);
        return () => clearInterval(timer);
    }, []);

    const parseDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return {
            date: date.toISOString().split('T')[0],
            time: date.toTimeString().slice(0, 5),
            fullDate: date
        };
    };

    const getCountdown = (isoString: string) => {
        const target = new Date(isoString);
        const diff = target.getTime() - now.getTime();

        if (diff <= 0) return null;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const isToday = (isoString: string) => {
        const target = new Date(isoString);
        const today = new Date();
        return target.getDate() === today.getDate() &&
            target.getMonth() === today.getMonth() &&
            target.getFullYear() === today.getFullYear();
    };

    const getStatusBadge = (status: 'attended' | 'absent' | null, startDatetime: string) => {
        if (status === 'attended') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> {t('attended')}
                </span>
            );
        }
        if (status === 'absent') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
                    <XCircle className="w-3 h-3" /> {t('absent')}
                </span>
            );
        }

        if (isToday(startDatetime)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-brand-primary/8 text-brand-primary border border-brand-primary/20 animate-pulse">
                    {t('inProgress')}
                </span>
            );
        }

        const countdown = getCountdown(startDatetime);
        if (!countdown) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                    {t('inProgress')}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                <Timer className="w-3 h-3" /> {countdown}
            </span>
        );
    };

    return (
        <div className="space-y-5 md:space-y-6" id="curriculum">
            <div className="flex items-center gap-3 px-1">
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-[18px] h-[18px] text-brand-primary" />
                </div>
                <div>
                    <h2 className="text-[12px] font-mono font-semibold text-brand-dark dark:text-white uppercase tracking-[2px]">{t('courseCurriculum')}</h2>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400">{t('curriculumDesc')}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                                <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest w-16">#</th>
                                <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('lessonTopic')}</th>
                                <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('schedule')}</th>
                                <th className="px-6 py-4 text-right text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                            {curriculum.map((item, index) => {
                                const { time, fullDate } = parseDateTime(item.start_datetime);
                                const isUpcoming = item.status === null;
                                const delayClass = index < 10 ? `delay-${index * 50}` : '';

                                return (
                                    <tr
                                        key={item.id}
                                        className={`group/row transition-all duration-300 animate-in fade-in duration-500 fill-mode-both ${delayClass} ${isUpcoming ? 'hover:bg-gray-50/40 dark:hover:bg-slate-800/20' : 'opacity-50'}`}
                                    >
                                        <td className="px-6 py-5">
                                            <span className="text-[13px] font-mono font-bold text-gray-300 dark:text-slate-700 tabular-nums">
                                                {item.number.toString().padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isUpcoming ? 'bg-brand-primary/8 text-brand-primary group-hover/row:bg-brand-primary group-hover/row:text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                                                    <BookOpen className="w-4 h-4" />
                                                </div>
                                                <span className="text-[14px] font-semibold text-brand-dark dark:text-white tracking-tight">{item.topic}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold text-gray-600 dark:text-slate-300">
                                                    <Calendar className="w-3.5 h-3.5 text-brand-primary/50" />
                                                    {fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                                                    <Clock className="w-3 h-3 text-brand-primary/30" />
                                                    {time} &bull; {Number(item.duration.split(':')[0]) * 60 + Number(item.duration.split(':')[1])} min
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {getStatusBadge(item.status, item.start_datetime)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="lg:hidden divide-y divide-gray-50 dark:divide-slate-800/50">
                    {curriculum.map((item) => {
                        const { time, fullDate } = parseDateTime(item.start_datetime);
                        const isUpcoming = item.status === null;

                        return (
                            <div key={item.id} className={`px-4 py-4 transition-colors ${!isUpcoming ? 'opacity-50' : 'hover:bg-gray-50/40 dark:hover:bg-slate-800/20'}`}>
                                <div className="flex items-center gap-3.5">
                                    {/* Lesson Number Badge */}
                                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 border transition-all ${isUpcoming ? 'bg-brand-primary/8 border-brand-primary/15 text-brand-primary' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-400'}`}>
                                        <span className="text-[8px] font-mono font-bold leading-none uppercase opacity-70 mb-0.5">LSN</span>
                                        <span className="text-sm font-mono font-bold leading-none">{item.number.toString().padStart(2, '0')}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <div className="flex items-center gap-2 overflow-hidden text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                                <span>{fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                <span className="opacity-40">&bull;</span>
                                                <span>{time}</span>
                                            </div>
                                            {getStatusBadge(item.status, item.start_datetime)}
                                        </div>
                                        <h3 className="text-[14px] font-semibold text-brand-dark dark:text-white leading-snug tracking-tight truncate">
                                            {item.topic}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Curriculum;
