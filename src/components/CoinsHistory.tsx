import React from 'react';
import { ACTIVITY_LOG } from '../constants';
import { Coins, Clock, Calendar, Zap, BookOpen, CheckCircle2, ShoppingBag, XCircle } from 'lucide-react';
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

    // Map transactions to ActivityItem format or use ACTIVITY_LOG
    const data = transactions ? transactions.map((t, idx) => ({
        id: `tx-${idx}`,
        date: new Date(t.datetime).toLocaleDateString(), // Format date as needed
        action: t.reason,
        xpChange: t.xp,
        coinChange: t.coins,
        negative: t.negative
    })) : ACTIVITY_LOG;

    const displayActions = limit ? data.slice(0, limit) : data;

    const getIcon = (action: string, negative?: boolean) => {
        if (negative) return <XCircle className="w-4 h-4 text-red-500" />;
        if (action.includes('Attendance')) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
        if (action.includes('Homework')) return <BookOpen className="w-4 h-4 text-brand-primary" />;
        if (action.includes('Claimed') || action.includes('Reward')) return <ShoppingBag className="w-4 h-4 text-brand-secondary" />;
        return <CheckCircle2 className="w-4 h-4 text-gray-400" />;
    };

    if (displayActions.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                <p className="text-gray-400 dark:text-slate-500 font-medium text-sm">{t('noCoinTransactions')}</p>
            </div>
        );
    }

    return (
        <div className={compact ? "space-y-0" : "space-y-6"}>
            {showTitle && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('coinsHistory')}</h2>
                    <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm font-medium">{t('trackingEarnings')}</p>
                </div>
            )}

            <div className={`bg-white dark:bg-slate-900 ${compact ? '' : 'border border-gray-100 dark:border-slate-800 rounded-[32px] shadow-sm'} overflow-hidden transition-all duration-300 ${!compact && 'hover:shadow-xl'}`}>
                {/* Desktop View (Table) - Hidden if compact is true */}
                {!compact && (
                    <div className="hidden md:block overflow-x-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-50 dark:divide-slate-800">
                            <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('date')}</th>
                                    <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('activity')}</th>
                                    <th scope="col" className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('change') || 'Change'}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-50 dark:divide-slate-800">
                                {displayActions.map((item) => (
                                    <tr key={item.id} className="hover:bg-brand-primary/5 dark:hover:bg-brand-primary/5 transition-all group/row">
                                        <td className="px-6 py-4 whitespace-nowrap text-[11px] font-semibold text-gray-400 dark:text-slate-500 tabular-nums">
                                            <div className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-2 opacity-50" />
                                                {item.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-9 w-9 rounded-lg border flex items-center justify-center mr-3 shadow-sm group-hover/row:scale-110 transition-all ${item.negative ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 group-hover/row:bg-white dark:group-hover/row:bg-slate-700'}`}>
                                                    {getIcon(item.action, item.negative)}
                                                </div>
                                                <div className="text-sm font-semibold text-brand-dark dark:text-white">{item.action}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {item.xpChange !== 0 && item.xpChange !== null && (
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-extrabold tabular-nums border ${item.negative ? 'bg-red-50 text-red-600 border-red-100' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/10'}`}>
                                                        <Zap className="w-3 h-3 mr-1.5 fill-current" />
                                                        {item.xpChange > 0 ? '+' : ''}{item.xpChange} XP
                                                    </span>
                                                )}
                                                {item.coinChange !== 0 && item.coinChange !== null && (
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black tabular-nums border
                                                    ${item.coinChange > 0
                                                            ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                            : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                                                        <Coins className="w-3.5 h-3.5 mr-1.5 fill-current" />
                                                        {item.coinChange > 0 ? `+${item.coinChange}` : item.coinChange}
                                                    </span>
                                                )}
                                                {(item.xpChange === 0 || item.xpChange === null) && (item.coinChange === 0 || item.coinChange === null) && (
                                                    <span className="text-gray-300 dark:text-slate-700 text-[10px] font-bold">---</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Mobile View (Card List) - Shown if compact is true OR screen is small */}
                <div className={`${compact ? 'block' : 'md:hidden'} divide-y divide-gray-50 dark:divide-slate-800`}>
                    {displayActions.map((item) => (
                        <div key={item.id} className="p-4 active:bg-gray-50 dark:active:bg-slate-800/50 transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center min-w-0">
                                    <div className={`flex-shrink-0 h-10 w-10 rounded-xl border flex items-center justify-center mr-3 shadow-sm ${item.negative ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'}`}>
                                        {getIcon(item.action, item.negative)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-brand-dark dark:text-white truncate">{item.action}</div>
                                        <div className="flex items-center text-[10px] font-semibold text-gray-400 dark:text-slate-500 mt-0.5 tabular-nums">
                                            <Clock className="w-2.5 h-2.5 mr-1 opacity-50" />
                                            {item.date}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end space-x-2 pl-[3.25rem]">
                                {item.xpChange !== 0 && item.xpChange !== null && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border tabular-nums ${item.negative ? 'bg-red-50 text-red-600 border-red-100' : 'bg-brand-primary/5 text-brand-primary border-brand-primary/10'}`}>
                                        <Zap className="w-3 h-3 mr-1 fill-current" />
                                        {item.xpChange > 0 ? '+' : ''}{item.xpChange} XP
                                    </span>
                                )}
                                {item.coinChange !== 0 && item.coinChange !== null && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border tabular-nums
                                        ${item.coinChange > 0
                                            ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                            : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                                        <Coins className="w-3 h-3 mr-1 fill-current" />
                                        {item.coinChange > 0 ? `+${item.coinChange}` : item.coinChange}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoinsHistory;
