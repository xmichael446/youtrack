import React, { useState, useEffect } from 'react';
import {
  Swords,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContests } from '../../context/ContestContext';
import LoadingScreen from '../../components/LoadingScreen';
import Toast from '../../components/ui/Toast';
import ContestCard from './ContestCard';
import type { ContestNav } from './contestTypes';

const ContestListView: React.FC<{ onNavigate: (nav: ContestNav) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { contests, loading, error, fetchContests, registerForContest } = useContests();
  const [registeringId, setRegisteringId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchContests(); }, [fetchContests]);

  const handleRegister = async (id: number) => {
    setRegisteringId(id);
    try {
      const res = await registerForContest(id);
      setToast({ msg: res.message || t('contestRegistered'), type: 'success' });
    } catch (err: any) {
      setToast({ msg: err?.data?.message || err?.message || t('somethingWentWrong'), type: 'error' });
    } finally {
      setRegisteringId(null);
    }
  };

  // Show full-screen loader before any contests are loaded (hides header too)
  if (loading && contests.length === 0) {
    return <LoadingScreen message={t('findingBattles')} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="px-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-2">
          <Swords className="w-6 h-6 text-brand-primary shrink-0" />
          {t('contests')}
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">
          {t('contestsSubtitle')}
        </p>
        <button
          onClick={fetchContests}
          disabled={loading}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-brand-primary transition-all duration-200 active:scale-90 mt-1"
          title={t('refresh')}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-500/10">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-sm text-red-500 font-medium text-center px-4">{error}</p>
          <button
            onClick={fetchContests}
            className="text-[11px] font-mono font-bold text-brand-primary hover:text-brand-primary/80 border border-brand-primary/30 hover:border-brand-primary/50 px-4 py-2 rounded-xl transition-colors"
          >
            {t('loading')}
          </button>
        </div>
      ) : contests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center">
            <Swords className="w-7 h-7 text-gray-300 dark:text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{t('contestNoContests')}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{t('contestUpcomingHint')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {contests.map((item, idx) => (
            <div
              key={item.id}
              className="animate-in fade-in fill-mode-both"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <ContestCard
                item={item}
                onNavigate={onNavigate}
                onRegister={handleRegister}
                registeringId={registeringId}
                t={t}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContestListView;
