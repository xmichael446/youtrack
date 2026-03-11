import React from 'react';
import { ACTIVITY_LOG } from '../constants';
import { Coins, Calendar, Zap, BookOpen, CheckCircle2, ShoppingBag, XCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Transaction } from '../services/apiTypes';

interface CoinsHistoryProps {
    limit?: number;
    showTitle?: boolean;
    compact?: boolean;
    transactions?: Transaction[];
}

const CoinsHistory: React.FC<CoinsHistoryProps> = ({ limit, showTitle = true, compact = false, transactions }) => {
    const { t } = useLanguage();

    const data = transactions ? transactions.map((t, idx) => ({
        id: `tx-${idx}`,
        date: new Date(t.datetime).toLocaleDateString(),
        action: t.reason,
        xpChange: t.xp,
        coinChange: t.coins,
        negative: t.negative
    })) : ACTIVITY_LOG;

    const displayActions = limit ? data.slice(0, limit) : data;

    const getIcon = (action: string, negative?: boolean) => {
        if (negative) return <XCircle className="w-[18px] h-[18px] text-red-500" />;
        if (action.includes('Attendance')) return <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500" />;
        if (action.includes('Homework')) return <BookOpen className="w-[18px] h-[18px] text-brand-primary" />;
        if (action.includes('Claimed') || action.includes('Reward')) return <ShoppingBag className="w-[18px] h-[18px] text-brand-secondary" />;
        return <CheckCircle2 className="w-[18px] h-[18px] text-gray-400" />;
    };

    if (displayActions.length === 0) {
        return (
            <div className="text-center py-14 px-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Coins className="w-6 h-6 text-gray-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-bold text-gray-400 dark:text-slate-500 italic">"{t('noCoinTransactions')}"</p>
            </div>
        );
    }

    return (
        <div className={compact ? "space-y-0" : "space-y-6"}>
            {showTitle && (
                <div className="flex items-center gap-3 px-1">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center shrink-0">
                        <Coins className="w-[18px] h-[18px] text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-[12px] font-mono font-bold text-brand-dark dark:text-white uppercase tracking-[2px]">{t('coinsHistory')}</h2>
                        <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400">{t('trackingEarnings')}</p>
                    </div>
                </div>
            )}

            <div className={`bg-white dark:bg-slate-900 ${compact ? '' : ''} overflow-hidden`}>
                {/* Desktop Table */}
                {!compact && (
                    <div className="hidden md:block overflow-x-auto custom-scrollbar">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                                    <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('date')}</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('activity')}</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('change')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60">
                                {displayActions.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-800/20 transition-colors group/row">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-[12px] font-mono font-bold text-gray-400 dark:text-slate-500">
                                                <Calendar className="w-3.5 h-3.5 text-brand-primary/40" />
                                                {item.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover/row:scale-110 duration-300 ${item.negative ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
                                                    {getIcon(item.action, item.negative)}
                                                </div>
                                                <span className="text-[14px] font-bold text-brand-dark dark:text-white tracking-tight">{item.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                {item.xpChange !== 0 && item.xpChange !== null && (
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${item.negative ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 'bg-brand-primary/8 text-brand-primary border-brand-primary/15'}`}>
                                                        <Zap className="w-3 h-3 fill-current" />
                                                        {item.xpChange > 0 ? '+' : ''}{item.xpChange} XP
                                                    </span>
                                                )}
                                                {item.coinChange !== 0 && item.coinChange !== null && (
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider
                                                    ${item.coinChange > 0
                                                            ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                            : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                                                        <Coins className="w-3 h-3 fill-current" />
                                                        {item.coinChange > 0 ? `+${item.coinChange}` : item.coinChange}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Mobile / Compact Card List */}
                <div className={`${compact ? 'block' : 'md:hidden'} divide-y divide-gray-50 dark:divide-slate-800/60`}>
                    {displayActions.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50/40 dark:hover:bg-slate-800/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${item.negative ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
                                    {getIcon(item.action, item.negative)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-bold text-brand-dark dark:text-white truncate leading-tight">{item.action}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Calendar className="w-3 h-3 text-brand-primary/40" />
                                        <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{item.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {item.xpChange !== 0 && item.xpChange !== null && (
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wide ${item.negative ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400' : 'bg-brand-primary/8 text-brand-primary border-brand-primary/15'}`}>
                                            {item.xpChange > 0 ? '+' : ''}{item.xpChange} XP
                                        </span>
                                    )}
                                    {item.coinChange !== 0 && item.coinChange !== null && (
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wide
                                            ${item.coinChange > 0
                                                ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400'}`}>
                                            {item.coinChange > 0 ? `+${item.coinChange}` : item.coinChange}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoinsHistory;
