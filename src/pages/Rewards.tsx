import React, { useState } from 'react';
import { Coins, History, Check, Lock, ExternalLink, Loader2, ShoppingBag, Sparkles, Trophy, Gift } from 'lucide-react';
import CoinsHistory from '../components/CoinsHistory';
import { useLanguage } from '../context/LanguageContext';
import { ShopProvider, useShop } from '../context/ShopContext';
import { useDashboard } from '../context/DashboardContext';
import { BalanceReward, LevelReward } from '../services/apiTypes';

const RewardsContent: React.FC = () => {
  const { t } = useLanguage();
  const { rewards, levelRewards, transactions, loading, error, claimReward } = useShop();
  const { user, enrollment, refetch } = useDashboard();
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
      window.open(`https://t.me/ytrck_bot?start=reward_${reward.id}`, '_blank');
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
    if (!reward.unlocked || reward.granted) return;

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
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-[3px] border-brand-primary/10 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-transparent border-t-brand-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error && rewards.length === 0 && levelRewards.length === 0) {
    return (
      <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-500/10">
        <p className="text-red-500 font-bold text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* Page Header */}
      <div className="flex items-start gap-4 px-1">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 shrink-0 ring-2 ring-amber-400/20">
          <Gift className="w-7 h-7 md:w-8 md:h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-[800] tracking-tight text-brand-dark dark:text-white">
            {t('rewardsShop')}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-0.5">
            {t('exchangeCoins')}
          </p>
        </div>
      </div>

      {/* Balance Hero Card */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        {/* Ambient blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/20 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-primary/10 rounded-full -ml-24 -mb-24 blur-2xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(18,194,220,0.08),transparent_60%)] pointer-events-none"></div>

        <div className="relative z-10 p-7 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Coin Balance */}
          <div className="text-center md:text-left">
            <p className="text-[10px] font-mono font-bold text-brand-primary uppercase tracking-[3px] mb-3 opacity-80">{t('yourBalance')}</p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-5xl md:text-6xl font-[800] tracking-tighter text-white tabular-nums">{currentBalance}</span>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-white/10"></div>

          {/* Level Info */}
          {enrollment?.level ? (
            <div className="text-center md:text-right">
              <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[2px] mb-2">{t('currentLevel')}</p>
              <div className="flex items-center justify-center md:justify-end gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: `${enrollment.level.badge_color}25`, border: `1px solid ${enrollment.level.badge_color}40` }}
                >
                  {enrollment.level.icon}
                </div>
                <div className="text-left">
                  <p className="text-white font-bold leading-none">Lvl {enrollment.level.number}</p>
                  <p className="text-white/60 text-xs font-medium">{enrollment.level.name}</p>
                </div>
              </div>
              <div className="w-40 md:ml-auto">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${enrollment.level.progress_percent}%`, backgroundColor: enrollment.level.badge_color }}
                  />
                </div>
                <p className="text-[10px] font-mono text-white/40 mt-1 text-right">{enrollment.level.xp_current} / {enrollment.level.xp_next} XP</p>
              </div>
            </div>
          ) : (
            <div className="text-center md:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/15 border border-brand-primary/20 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                <span className="text-[9px] font-mono font-bold text-brand-primary uppercase tracking-wider">Rewards Shop</span>
              </div>
              <p className="text-slate-400 font-medium text-sm max-w-[180px] leading-snug">
                {t('shopWelcome')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Coin Rewards Section */}
      <div>
        <div className="flex items-center gap-3 px-1 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center shrink-0">
            <Coins className="w-[18px] h-[18px] text-amber-500" />
          </div>
          <div>
            <h2 className="text-[12px] font-mono font-bold text-brand-dark dark:text-white uppercase tracking-[2px]">{t('balanceRewards')}</h2>
            <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400">{t('exchangeCoins')}</p>
          </div>
        </div>

        {rewards.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-slate-500 font-medium text-sm italic">"{t('noRewards')}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {sortedRewards.map((reward) => {
              const affordable = currentBalance >= reward.cost;
              const isProcessing = processingId === reward.id;

              return (
                <div
                  key={reward.id}
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
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {t('locked')}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h3 className="font-[800] text-brand-dark dark:text-white text-lg leading-tight tracking-tight break-words flex-1">{reward.name}</h3>
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
                        className={`w-full py-3.5 rounded-2xl font-bold text-[11px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95
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
                            <Lock className="w-3.5 h-3.5" /> {t('locked')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Level Rewards Section */}
      {(levelRewards.length > 0 || !loading) && (
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 fill-mode-both">
          <div className="flex items-center gap-3 px-1 mb-5">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/10 flex items-center justify-center shrink-0">
              <Trophy className="w-[18px] h-[18px] text-violet-500" />
            </div>
            <div>
              <h2 className="text-[12px] font-mono font-bold text-brand-dark dark:text-white uppercase tracking-[2px]">{t('levelRewards')}</h2>
              <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400">Reach the required level to claim for free</p>
            </div>
          </div>

          {levelRewards.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800 text-center">
              <Trophy className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-slate-500 font-medium text-sm italic">"{t('noRewards')}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {sortedLevelRewards.map((reward) => {
                const isUnlocked = reward.unlocked;
                const isGranted = reward.granted;
                const isProcessing = processingId === reward.id;
                const levelColor = reward.required_level?.badge_color || '#8b5cf6';

                return (
                  <div
                    key={reward.id}
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
                            <Lock className="w-3.5 h-3.5" /> Level {reward.required_level.number} Required
                          </div>
                        </div>
                      )}

                      {isGranted && (
                        <div className="absolute inset-0 bg-emerald-950/30 backdrop-blur-[2px] flex items-center justify-center z-10">
                          <div className="bg-emerald-500 text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl font-mono">
                            <Check className="w-3.5 h-3.5 stroke-[3px]" /> Granted
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 md:p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <h3 className="font-[800] text-brand-dark dark:text-white text-lg leading-tight tracking-tight break-words flex-1">{reward.name}</h3>
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
                          disabled={(!isUnlocked || isGranted) || isProcessing}
                          onClick={() => handleClaimLevel(reward)}
                          className={`w-full py-3.5 rounded-2xl font-bold text-[11px] font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95
                            ${isGranted
                              ? 'bg-emerald-500 text-white cursor-default'
                              : isUnlocked
                                ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02]'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed border border-gray-200 dark:border-slate-700'
                            }`}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isGranted ? (
                            <><Check className="w-3.5 h-3.5" /> {t('alreadyGranted')}</>
                          ) : isUnlocked ? (
                            t('claimFree')
                          ) : (
                            <><Lock className="w-3.5 h-3.5" /> Level {reward.required_level.number} Required</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Coins History */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
        <div className="flex items-center gap-3 px-1 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center shrink-0">
            <History className="w-[18px] h-[18px] text-amber-500" />
          </div>
          <div>
            <h2 className="text-[12px] font-mono font-bold text-brand-dark dark:text-white uppercase tracking-[2px]">{t('coinsHistory')}</h2>
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
