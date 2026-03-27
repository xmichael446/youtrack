import React, { useState, useEffect } from 'react';
import {
  Swords,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContests } from '../../context/ContestContext';
import LoadingScreen from '../../components/LoadingScreen';
import { Button, Card, EmptyState, Toast } from '../../components/ui';
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
        <h1 className="text-h2 tracking-tight text-brand-dark dark:text-white flex items-center gap-2">
          <Swords className="w-6 h-6 text-brand-primary shrink-0" />
          {t('contests')}
        </h1>
        <p className="text-body font-medium text-text-theme-secondary dark:text-text-theme-dark-secondary mt-1">
          {t('contestsSubtitle')}
        </p>
        <div className="mt-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            loading={loading && contests.length > 0}
            onClick={fetchContests}
            disabled={loading}
          >
            {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <Card variant="bordered" padding="lg" className="flex flex-col items-center gap-4 bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-500/10">
          <div className="w-12 h-12 rounded-card bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-body text-red-500 font-medium text-center">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchContests}
          >
            {t('loading')}
          </Button>
        </Card>
      ) : contests.length === 0 ? (
        <EmptyState
          icon={<Swords className="w-7 h-7" />}
          title={t('contestNoContests')}
          message={t('contestUpcomingHint')}
          className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-card"
        />
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
