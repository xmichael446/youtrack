import React, { useState } from 'react';
import { Coins, History, Check, Lock, ExternalLink, Loader2, ShoppingBag } from 'lucide-react';
import CoinsHistory from '../components/CoinsHistory';
import { useLanguage } from '../context/LanguageContext';
import { ShopProvider, useShop } from '../context/ShopContext';
import { useDashboard } from '../context/DashboardContext';
import { Reward } from '../services/apiTypes';

const RewardsContent: React.FC = () => {
  const { t } = useLanguage();
  const { rewards, transactions, loading, error, claimReward } = useShop();
  // Using user from DashboardContext to get current balance and refetch
  const { user, refetch } = useDashboard();
  const currentBalance = user?.coins || 0;

  const [processingId, setProcessingId] = useState<number | null>(null);

  // Sorting Logic:
  // 1. Claimed
  // 2. Affordable (balance >= cost)
  // 3. Locked (balance < cost)
  const sortedRewards = [...rewards].sort((a, b) => {
    if (a.claimed && !b.claimed) return -1;
    if (!a.claimed && b.claimed) return 1;
    if (a.claimed && b.claimed) return 0;

    const aAffordable = currentBalance >= a.cost;
    const bAffordable = currentBalance >= b.cost;

    if (aAffordable && !bAffordable) return -1;
    if (!aAffordable && bAffordable) return 1;

    return a.cost - b.cost; // Secondary sort by cost
  });

  const handleClaim = async (reward: Reward) => {
    if (reward.claimed) {
      // Open Telegram link
      window.open(`https://t.me/ytrck_bot?start=reward${reward.id}`, '_blank');
      return;
    }

    if (currentBalance < reward.cost) return;

    setProcessingId(reward.id);
    try {
      await claimReward(reward.id);
      refetch(); // Update balance
      // Success toast could be added here
    } catch (err) {
      console.error("Failed to claim:", err);
      // Error toast could be added here
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && rewards.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (error && rewards.length === 0) {
    return (
      <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-3xl">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header with Balance Context */}
      <div className="bg-brand-primary rounded-[32px] p-8 md:p-12 text-white shadow-2xl shadow-brand-primary/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 opacity-50 blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 tracking-tight">{t('rewardsShop')}</h1>
            <p className="text-white/80 max-w-xl text-base md:text-lg font-medium leading-relaxed">{t('exchangeCoins')}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-8 flex flex-col items-center min-w-[200px] transition-all hover:bg-white/20 hover:scale-105 shadow-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/60 mb-3">{t('totalBalance')}</span>
            <div className="flex items-center text-5xl md:text-6xl font-extrabold tracking-tighter tabular-nums">
              <Coins className="w-10 h-10 mr-3 fill-white drop-shadow-lg" />
              {currentBalance}
            </div>
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="pt-4 px-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('premiumItems')}</h2>
        </div>

        {rewards.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
            {t('noRewards')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedRewards.map((reward) => {
              const affordable = currentBalance >= reward.cost;
              const isProcessing = processingId === reward.id;

              return (
                <div key={reward.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px] shadow-sm hover:shadow-2xl hover:border-brand-primary/20 transition-all duration-500 overflow-hidden flex flex-col group/reward hover:-translate-y-2">
                  <div className="h-48 bg-gray-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                    {reward.image ? (
                      <img
                        src={`${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')}/${(reward.image || '').replace(/^\/+/, '')}`}
                        alt={reward.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/reward:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/400/200?grayscale';
                        }}
                      />
                    ) : (
                      <div className="text-gray-300 dark:text-slate-700">
                        <ShoppingBag className="w-16 h-16 opacity-20" />
                      </div>
                    )}

                    {reward.claimed && (
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <div className="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-xs font-bold flex items-center shadow-2xl scale-110">
                          <Check className="w-4 h-4 mr-2" /> {t('claimed')}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-brand-dark dark:text-white text-xl leading-tight transition-colors group-hover/reward:text-brand-primary line-clamp-2">{reward.name}</h3>
                      <span className={`flex-shrink-0 inline-flex items-center px-4 py-2 rounded-xl text-[11px] font-bold border transition-colors tabular-nums ml-2
                        ${affordable || reward.claimed
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-600 border-gray-200 dark:border-slate-700'}`}>
                        <Coins className="w-4 h-4 mr-2 fill-current" />
                        {reward.cost}
                      </span>
                    </div>

                    {reward.description && (
                      <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4 leading-relaxed line-clamp-3">
                        {reward.description}
                      </p>
                    )}

                    <div className="flex-1"></div> { /* Spacer to push button down */}

                    <button
                      disabled={(reward.claimed ? false : !affordable) || isProcessing}
                      onClick={() => handleClaim(reward)}
                      className={`w-full py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center tracking-[0.15em] uppercase text-[10px] mt-6 relative overflow-hidden
                        ${reward.claimed
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30'
                          : affordable
                            ? 'bg-brand-primary text-white hover:bg-brand-accent shadow-brand-primary/30 hover:scale-[1.02] active:scale-95'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 border border-gray-200 dark:border-slate-700 cursor-not-allowed'
                        }`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : reward.claimed ? (
                        <>
                          {t('claimed')} <ExternalLink className="w-3 h-3 ml-2" />
                        </>
                      ) : affordable ? (
                        t('claimNow')
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-2" /> {t('locked')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Coins History Section */}
      <section className="mt-12 md:mt-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="p-2.5 bg-amber-500/10 rounded-xl">
            <History className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-brand-dark dark:text-white tracking-tight">{t('coinsHistory')}</h2>
            <p className="text-sm font-bold text-gray-400 dark:text-slate-500">{t('trackingEarnings')}</p>
          </div>
        </div>
        <CoinsHistory showTitle={false} transactions={transactions} />
      </section>
    </div>
  );
};

export const Rewards: React.FC = () => {
  return (
    <ShopProvider>
      <RewardsContent />
    </ShopProvider>
  );
};