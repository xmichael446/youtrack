import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Calendar, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';

const Curriculum: React.FC = () => {
    const { t } = useLanguage();
    const { curriculum } = useDashboard();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000 * 60); // Update every minute
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
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {t('attended')}
                </span>
            );
        }
        if (status === 'absent') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
                    <XCircle className="w-3 h-3 mr-1" /> {t('absent')}
                </span>
            );
        }

        // Status is null
        if (isToday(startDatetime)) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                    {t('inProgress')}
                </span>
            );
        }

        const countdown = getCountdown(startDatetime);
        if (!countdown) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                    {t('inProgress')}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 animate-pulse">
                <Timer className="w-3 h-3 mr-1" /> {countdown}
            </span>
        );
    };

    return (
        <div className="space-y-6" id="curriculum">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">{t('courseCurriculum')}</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm font-medium">{t('curriculumDesc')}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-50 dark:divide-slate-800">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">#</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('lessonTopic')}</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('schedule')}</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                            {curriculum.map((item) => {
                                const { date, time, fullDate } = parseDateTime(item.start_datetime);
                                const isUpcoming = item.status === null;

                                return (
                                    <tr key={item.id} className={`transition-colors group/row ${isUpcoming ? 'hover:bg-brand-primary/5' : 'opacity-70 grayscale-[0.5]'}`}>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <span className="text-sm font-black text-gray-300 dark:text-slate-700 tabular-nums">
                                                {item.number.toString().padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <div className={`p-2.5 rounded-xl mr-4 transition-colors ${isUpcoming ? 'bg-brand-primary/10 text-brand-primary group-hover/row:bg-brand-primary group-hover/row:text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-black text-brand-dark dark:text-white">{item.topic}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="flex items-center text-xs font-bold text-gray-600 dark:text-slate-300 mb-1">
                                                    <Calendar className="w-3.5 h-3.5 mr-2 text-brand-primary/60" />
                                                    {fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center text-[11px] font-bold text-gray-400 dark:text-slate-500">
                                                    <Clock className="w-3.5 h-3.5 mr-2" />
                                                    {time} ({Number(item.duration.split(':')[0]) * 60 + Number(item.duration.split(':')[1])} min)
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right whitespace-nowrap">
                                            {getStatusBadge(item.status, item.start_datetime)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile / Tablet Card View */}
                <div className="lg:hidden divide-y divide-gray-50 dark:divide-slate-800">
                    {curriculum.map((item) => {
                        const { date, time, fullDate } = parseDateTime(item.start_datetime);
                        const isUpcoming = item.status === null;

                        return (
                            <div key={item.id} className={`p-6 active:bg-gray-50 dark:active:bg-slate-800/50 transition-colors ${!isUpcoming ? 'opacity-75' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xs font-black text-gray-300 dark:text-slate-700 tabular-nums">#{item.number.toString().padStart(2, '0')}</span>
                                        {getStatusBadge(item.status, item.start_datetime)}
                                    </div>
                                </div>

                                <h3 className="text-base font-black text-brand-dark dark:text-white leading-tight mb-4">
                                    {item.topic}
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <span className="block text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{t('date')}</span>
                                        <div className="flex items-center text-xs font-bold text-gray-700 dark:text-slate-300">
                                            <Calendar className="w-3 h-3 mr-2 text-brand-primary" />
                                            {fullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <span className="block text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{t('time')}</span>
                                        <div className="flex items-center text-xs font-bold text-gray-700 dark:text-slate-300">
                                            <Clock className="w-3 h-3 mr-2 text-brand-primary" />
                                            {time}
                                        </div>
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
