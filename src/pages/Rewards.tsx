import React, { useState } from 'react';
import { Coins, History, Check, Lock, ExternalLink, Loader2, ShoppingBag, Gift } from 'lucide-react';
import CoinsHistory from '../components/CoinsHistory';
import LoadingScreen from '../components/LoadingScreen';
import { useLanguage } from '../context/LanguageContext';
import { ShopProvider, useShop } from '../context/ShopContext';
import { useDashboard } from '../context/DashboardContext';
import { BalanceReward, LevelReward } from '../services/apiTypes';
import { openTelegramLink } from '../utils/telegram';

const RewardsContent: React.FC = () => {
  const { t } = useLanguage();
  const { rewards, levelRewards, transactions, loading, error, claimReward } = useShop();
  const { user, refetch } = useDashboard();
  const currentBalance = user?.coins || 0;

  const [processingId, setProcessingId] = useState<number | null>(null);

  const sortedRewards = [...rewards].sort((a, b) => {
    if (a.claimed && !b.claimed) return -1;
    if (!a.claimed && b.claimed) return 1;
    if (a.claimed && b.claimed) return 0;

    const aAffordable = currentBalance >= a.cost;
    const bAffordable = currentBalance >= b.cost;

    if (aAffordable && !bAffordable) return -1;
    if (!aAffordable && bAffordable) return 1;

    return a.cost - b.cost;
  });

  const sortedLevelRewards = [...levelRewards].sort((a, b) => {
    if (a.granted && !b.granted) return -1;
    if (!a.granted && b.granted) return 1;
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return (a.required_level?.number || 0) - (b.required_level?.number || 0);
  });

  const handleClaim = async (reward: BalanceReward) => {
    if (reward.claimed) {
      openTelegramLink(`https://t.me/ytrck_bot?start=reward_${reward.id}`);
      return;
    }

    if (currentBalance < reward.cost) return;

    setProcessingId(reward.id);
    try {
      await claimReward(reward.id);
      refetch();
    } catch (err) {
      console.error("Failed to claim:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleClaimLevel = async (reward: LevelReward) => {
    if (reward.granted) {
      openTelegramLink(`https://t.me/ytrck_bot?start=reward_${reward.id}`);
      return;
    }

    if (!reward.unlocked) return;

    setProcessingId(reward.id);
    try {
      await claimReward(reward.id);
      refetch();
    } catch (err) {
      console.error("Failed to claim level reward:", err);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && rewards.length === 0 && levelRewards.length === 0) {
    return <LoadingScreen message={t('openingShop')} />;
  }

  if (error && rewards.length === 0 && levelRewards.length === 0) {
    return (
      <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-500/10">
        <p className="text-red-500 font-bold text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-10">

      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-dark dark:text-white flex items-center gap-2">
          <Gift className="w-6 h-6 text-amber-400 shrink-0" />
          {t('rewardsShop')}
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1">
          {t('exchangeCoins')}
        </p>
      </div>

      {/* Unified Rewards Grid */}
      {(rewards.length === 0 && levelRewards.length === 0) ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center">
          <ShoppingBag className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-slate-500 font-medium text-sm italic">"{t('noRewards')}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {/* Coin Rewards */}
          {sortedRewards.map((reward) => {
            const affordable = currentBalance >= reward.cost;
            const isProcessing = processingId === reward.id;
            const needed = reward.cost - currentBalance;

            return (
              <div
                key={`balance-${reward.id}`}
                className={`bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden flex flex-col group/reward transition-all duration-500 hover:-translate-y-1
                  ${reward.claimed
                    ? 'border-emerald-200 dark:border-emerald-500/20 shadow-md'
                    : affordable
                      ? 'border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-brand-primary/20'
                      : 'border-gray-100 dark:border-slate-800 shadow-sm opacity-70 hover:opacity-90'
                  }`}
              >
                {/* Image */}
                <div className="h-52 bg-gray-50 dark:bg-slate-800 relative overflow-hidden">
                  {reward.image ? (
                    <img
                      src={`${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')}/${(reward.image || '').replace(/^\/+/, '')}`}
                      alt={reward.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/reward:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/400/200?grayscale';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-slate-700" />
                    </div>
                  )}

                  {reward.claimed && (
                    <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <div className="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl font-mono">
                        <Check className="w-3.5 h-3.5 stroke-[3px]" /> {t('claimed')}
                      </div>
                    </div>
                  )}

                  {!affordable && !reward.claimed && (
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-wide flex items-center gap-1">
                      <Coins className="w-2.5 h-2.5" /> {t('needMore').replace('{count}', String(needed))}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 md:p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="font-semibold text-brand-dark dark:text-white text-lg leading-tight tracking-tight break-words flex-1">{reward.name}</h3>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold font-mono border
                      ${affordable || reward.claimed
                        ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        : 'bg-gray-50 dark:bg-slate-800 text-gray-400 border-gray-200 dark:border-slate-700'}`}>
                      <Coins className={`w-3.5 h-3.5 ${affordable || reward.claimed ? 'fill-amber-500' : 'fill-gray-400'}`} />
                      {reward.cost}
                    </span>
                  </div>

                  {reward.description && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-5 leading-relaxed italic">
                      "{reward.description}"
                    </p>
                  )}

                  <div className="mt-auto">
                    <button
                      disabled={(reward.claimed ? false : !affordable) || isProcessing}
                      onClick={() => handleClaim(reward)}
                      className={`w-full py-3.5 rounded-2xl font-semibold text-[11px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95
                        ${reward.claimed
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                          : affordable
                            ? 'bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 hover:scale-[1.02]'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed border border-gray-200 dark:border-slate-700'
                        }`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : reward.claimed ? (
                        <>
                          {t('claimed')}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </>
                      ) : affordable ? (
                        t('claimNow')
                      ) : (
                        <>
                          <Coins className="w-3.5 h-3.5" /> {t('needMoreCoins').replace('{count}', String(needed))}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Level Rewards */}
          {sortedLevelRewards.map((reward) => {
            const isUnlocked = reward.unlocked;
            const isGranted = reward.granted;
            const isProcessing = processingId === reward.id;
            const levelColor = reward.required_level?.badge_color || '#8b5cf6';

            return (
              <div
                key={`level-${reward.id}`}
                className={`bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden flex flex-col group/reward transition-all duration-500 hover:-translate-y-1
                  ${isGranted
                    ? 'border-emerald-200 dark:border-emerald-500/20 shadow-md'
                    : isUnlocked
                      ? 'border-violet-200 dark:border-violet-500/20 shadow-sm hover:shadow-xl'
                      : 'border-gray-100 dark:border-slate-800 opacity-70 hover:opacity-90'
                  }`}
              >
                {/* Image */}
                <div className="h-52 bg-gray-50 dark:bg-slate-800 relative overflow-hidden">
                  {reward.image ? (
                    <img
                      src={`${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')}/${(reward.image || '').replace(/^\/+/, '')}`}
                      alt={reward.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/reward:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://picsum.photos/400/200?grayscale';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {reward.required_level?.icon || '🎁'}
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <div className="bg-black/60 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 font-mono">
                        <Lock className="w-3.5 h-3.5" /> {t('levelRequired').replace('{level}', String(reward.required_level.number))}
                      </div>
                    </div>
                  )}

                  {isGranted && (
                    <div className="absolute inset-0 bg-emerald-950/30 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <div className="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl font-mono">
                        <Check className="w-3.5 h-3.5 stroke-[3px]" /> {t('granted')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 md:p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="font-semibold text-brand-dark dark:text-white text-lg leading-tight tracking-tight break-words flex-1">{reward.name}</h3>
                    <span
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold font-mono border"
                      style={{
                        backgroundColor: `${levelColor}12`,
                        color: levelColor,
                        borderColor: `${levelColor}30`,
                      }}
                    >
                      {reward.required_level.icon} Lvl {reward.required_level.number}
                    </span>
                  </div>

                  {reward.description && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-5 leading-relaxed italic">
                      "{reward.description}"
                    </p>
                  )}

                  <div className="mt-auto">
                    <button
                      disabled={(!isUnlocked && !isGranted) || isProcessing}
                      onClick={() => handleClaimLevel(reward)}
                      className={`w-full py-3.5 rounded-2xl font-semibold text-[11px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95
                        ${isGranted
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                          : isUnlocked
                            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed border border-gray-200 dark:border-slate-700'
                        }`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isGranted ? (
                        <>
                          {t('claimed') || 'Claimed'}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </>
                      ) : isUnlocked ? (
                        t('claimFree')
                      ) : (
                        <><Lock className="w-3.5 h-3.5" /> {t('levelRequired').replace('{level}', String(reward.required_level.number))}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Coins History */}
      <section className="animate-in fade-in duration-700 delay-200 fill-mode-both">
        <div className="flex items-center gap-3 px-1 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center shrink-0">
            <History className="w-[18px] h-[18px] text-amber-500" />
          </div>
          <div>
            <h2 className="text-[12px] font-mono font-semibold text-brand-dark dark:text-white uppercase tracking-[2px]">{t('coinsHistory')}</h2>
            <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400">{t('trackingEarnings')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
          <CoinsHistory showTitle={false} transactions={transactions} compact={false} />
        </div>
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
