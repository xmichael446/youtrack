import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Calendar, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';

const Curriculum: React.FC = () => {
    const { t, language } = useLanguage();
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
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> {t('attended')}
                </span>
            );
        }
        if (status === 'absent') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20">
                    <XCircle className="w-3 h-3" /> {t('absent')}
                </span>
            );
        }

        if (isToday(startDatetime)) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-brand-primary/8 text-brand-primary border border-brand-primary/20 animate-pulse">
                    {t('inProgress')}
                </span>
            );
        }

        const countdown = getCountdown(startDatetime);
        if (!countdown) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                    {t('inProgress')}
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                <Timer className="w-3 h-3" /> {countdown}
            </span>
        );
    };

    return (
        <div className="space-y-4 md:space-y-6" id="curriculum">
            <div className="flex items-center gap-2 px-1">
                <BookOpen className="w-5 h-5 text-text-theme-muted dark:text-text-theme-dark-muted" />
                <h2 className="section-label text-brand-dark dark:text-white">{t('courseCurriculum')}</h2>
            </div>

            <div className="bg-surface-primary dark:bg-surface-dark-secondary border border-surface-secondary dark:border-surface-dark-elevated rounded-card shadow-card dark:shadow-card-dark overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-surface-secondary dark:border-surface-dark-elevated bg-surface-secondary/50 dark:bg-surface-dark-elevated/30">
                                <th className="px-6 py-4 text-left section-label text-text-theme-muted dark:text-text-theme-dark-muted w-16">#</th>
                                <th className="px-6 py-4 text-left section-label text-text-theme-muted dark:text-text-theme-dark-muted">{t('lessonTopic')}</th>
                                <th className="px-6 py-4 text-left section-label text-text-theme-muted dark:text-text-theme-dark-muted">{t('schedule')}</th>
                                <th className="px-6 py-4 text-right section-label text-text-theme-muted dark:text-text-theme-dark-muted">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-secondary dark:divide-surface-dark-elevated/50">
                            {curriculum.map((item, index) => {
                                const { time, fullDate } = parseDateTime(item.start_datetime);
                                const isUpcoming = item.status === null;
                                const delayClass = index < 10 ? `delay-${index * 50}` : '';

                                return (
                                    <tr
                                        key={item.id}
                                        className={`group/row transition-all duration-normal animate-in fade-in duration-500 fill-mode-both ${delayClass} ${isUpcoming ? 'hover:bg-surface-secondary/40 dark:hover:bg-surface-dark-elevated/20' : 'opacity-50'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-body font-mono text-surface-secondary dark:text-surface-dark-elevated tabular-nums">
                                                {item.number.toString().padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-9 h-9 rounded-input flex items-center justify-center shrink-0 transition-all duration-normal ${isUpcoming ? 'bg-brand-primary/8 text-brand-primary group-hover/row:bg-brand-primary group-hover/row:text-white' : 'bg-surface-secondary dark:bg-surface-dark-elevated text-text-theme-muted'}`}>
                                                    <BookOpen className="w-4 h-4" />
                                                </div>
                                                <span className="text-body text-brand-dark dark:text-text-theme-dark-primary tracking-tight">{item.topic}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2 text-caption tabular-nums text-text-theme-secondary dark:text-text-theme-dark-secondary">
                                                    <Calendar className="w-3.5 h-3.5 text-brand-primary/50" />
                                                    {fullDate.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                                <div className="flex items-center gap-2 text-caption text-text-theme-muted dark:text-text-theme-dark-muted tabular-nums">
                                                    <Clock className="w-3 h-3 text-brand-primary/30" />
                                                    <span>{time}</span> &bull; {Number(item.duration.split(':')[0]) * 60 + Number(item.duration.split(':')[1])} {t('mins')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {getStatusBadge(item.status, item.start_datetime)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="lg:hidden divide-y divide-surface-secondary dark:divide-surface-dark-elevated/50">
                    {curriculum.map((item) => {
                        const { time, fullDate } = parseDateTime(item.start_datetime);
                        const isUpcoming = item.status === null;

                        return (
                            <div key={item.id} className={`px-4 py-4 transition-colors ${!isUpcoming ? 'opacity-50' : 'hover:bg-surface-secondary/40 dark:hover:bg-surface-dark-elevated/20'}`}>
                                <div className="flex items-center gap-3">
                                    {/* Lesson Number Badge */}
                                    <div className={`w-11 h-11 rounded-input flex flex-col items-center justify-center shrink-0 border transition-all ${isUpcoming ? 'bg-brand-primary/8 border-brand-primary/15 text-brand-primary' : 'bg-surface-secondary dark:bg-surface-dark-elevated border-surface-secondary dark:border-surface-dark-elevated text-text-theme-muted'}`}>
                                        <span className="text-xs font-mono font-bold leading-none uppercase opacity-70 mb-0.5">LSN</span>
                                        <span className="text-sm font-mono font-bold leading-none">{item.number.toString().padStart(2, '0')}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <div className="flex items-center gap-2 overflow-hidden text-caption text-text-theme-muted dark:text-text-theme-dark-muted tabular-nums whitespace-nowrap">
                                                <span>{fullDate.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'en-US', { month: 'short', day: 'numeric' })}</span>
                                                <span className="opacity-40">&bull;</span>
                                                <span>{time}</span>
                                            </div>
                                            {getStatusBadge(item.status, item.start_datetime)}
                                        </div>
                                        <h3 className="text-body text-brand-dark dark:text-text-theme-dark-primary leading-snug tracking-tight truncate">
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
