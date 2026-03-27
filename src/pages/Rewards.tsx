import React, { useState } from 'react';
import { Coins, History, Check, Lock, ExternalLink, ShoppingBag, Gift } from 'lucide-react';
import CoinsHistory from '../components/CoinsHistory';
import LoadingScreen from '../components/LoadingScreen';
import { useLanguage } from '../context/LanguageContext';
import { ShopProvider, useShop } from '../context/ShopContext';
import { useDashboard } from '../context/DashboardContext';
import { BalanceReward, LevelReward } from '../services/apiTypes';
import { openTelegramLink } from '../utils/telegram';
import { Card, Button, Badge, EmptyState, Modal } from '../components/ui';

type ClaimTarget =
  | { type: 'balance'; reward: BalanceReward }
  | { type: 'level'; reward: LevelReward };

const RewardsContent: React.FC = () => {
  const { t } = useLanguage();
  const { rewards, levelRewards, transactions, loading, error, claimReward } = useShop();
  const { user, refetch } = useDashboard();
  const currentBalance = user?.coins || 0;

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [claimTarget, setClaimTarget] = useState<ClaimTarget | null>(null);

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

  const handleConfirmClaim = async () => {
    if (!claimTarget) return;
    setClaimTarget(null);
    if (claimTarget.type === 'balance') {
      await handleClaim(claimTarget.reward);
    } else {
      await handleClaimLevel(claimTarget.reward);
    }
  };

  if (loading && rewards.length === 0 && levelRewards.length === 0) {
    return <LoadingScreen message={t('openingShop')} />;
  }

  if (error && rewards.length === 0 && levelRewards.length === 0) {
    return (
      <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-card border border-red-100 dark:border-red-500/10">
        <p className="text-red-500 font-bold text-sm">{error}</p>
      </div>
    );
  }

  const claimTargetName = claimTarget
    ? claimTarget.type === 'balance'
      ? claimTarget.reward.name
      : claimTarget.reward.name
    : '';
  const claimTargetCost = claimTarget?.type === 'balance' ? claimTarget.reward.cost : null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-10">

      {/* Claim Confirmation Modal */}
      <Modal
        isOpen={!!claimTarget}
        onClose={() => setClaimTarget(null)}
        title={t('confirmClaim') || 'Confirm Claim'}
        maxWidth="sm"
        footer={
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => setClaimTarget(null)}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              loading={!!processingId}
              onClick={handleConfirmClaim}
            >
              {t('confirm') || 'Confirm'}
            </Button>
          </div>
        }
      >
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-card bg-brand-primary/10 flex items-center justify-center mx-auto">
            <Gift className="w-7 h-7 text-brand-primary" />
          </div>
          <p className="text-h4 text-text-theme-primary dark:text-text-theme-dark-primary">
            {claimTargetName}
          </p>
          {claimTargetCost !== null && (
            <div className="flex items-center justify-center gap-2">
              <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-body text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                {claimTargetCost} {t('coins') || 'coins'}
              </span>
            </div>
          )}
          <p className="text-body text-text-theme-secondary dark:text-text-theme-dark-secondary">
            {claimTargetCost !== null
              ? (t('confirmClaimDesc') || `Are you sure you want to spend ${claimTargetCost} coins on "${claimTargetName}"?`).replace('{cost}', String(claimTargetCost)).replace('{name}', claimTargetName)
              : (t('confirmClaimFreeDesc') || `Claim "${claimTargetName}" for free?`).replace('{name}', claimTargetName)
            }
          </p>
        </div>
      </Modal>

      {/* Page Header */}
      <div className="px-1">
        <h1 className="text-h1 tracking-tight text-brand-dark dark:text-text-theme-dark-primary flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-brand-primary shrink-0" />
          {t('rewardsShop')}
        </h1>
        <p className="text-body text-text-theme-secondary dark:text-text-theme-dark-secondary mt-1">
          {t('exchangeCoins')}
        </p>
      </div>

      {/* Balance Header Card */}
      <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200/50 dark:border-amber-700/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary uppercase tracking-wider mb-1">
              {t('availableToSpend') || 'Available to spend'}
            </p>
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-500 fill-amber-500 shrink-0" />
              <span className="text-h1 text-amber-600 dark:text-amber-400 tabular-nums">
                {currentBalance.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-card bg-amber-500/10 flex items-center justify-center">
            <Coins className="w-7 h-7 text-amber-500" />
          </div>
        </div>
      </Card>

      {/* Unified Rewards Grid */}
      {(rewards.length === 0 && levelRewards.length === 0) ? (
        <Card padding="lg">
          <EmptyState
            icon={<Gift className="w-6 h-6" />}
            message={t('noRewards')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Coin Rewards */}
          {sortedRewards.map((reward) => {
            const affordable = currentBalance >= reward.cost;
            const isProcessing = processingId === reward.id;
            const needed = reward.cost - currentBalance;

            return (
              <Card
                key={`balance-${reward.id}`}
                hoverable={!reward.claimed}
                padding="none"
                className={`overflow-hidden flex flex-col transition-all duration-500
                  ${reward.claimed
                    ? 'border border-emerald-200 dark:border-emerald-500/20'
                    : affordable
                      ? 'border border-brand-primary/20 hover:-translate-y-1'
                      : 'opacity-70 hover:opacity-90 hover:-translate-y-0.5'
                  }`}
              >
                {/* Image */}
                <div className="h-52 bg-surface-secondary dark:bg-surface-dark-elevated relative overflow-hidden group/reward">
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
                      <ShoppingBag className="w-16 h-16 text-surface-secondary dark:text-surface-dark-elevated" />
                    </div>
                  )}

                  {reward.claimed && (
                    <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <Badge variant="success" size="md">
                        <Check className="w-3 h-3 stroke-[3px]" /> {t('claimed')}
                      </Badge>
                    </div>
                  )}

                  {!affordable && !reward.claimed && (
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-pill text-caption flex items-center gap-1">
                      <Coins className="w-2.5 h-2.5" /> {t('needMore').replace('{count}', String(needed))}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="text-h4 text-brand-dark dark:text-text-theme-dark-primary leading-tight break-words flex-1">{reward.name}</h3>
                    <Badge
                      variant={affordable || reward.claimed ? 'warning' : 'muted'}
                      size="md"
                      className="shrink-0"
                    >
                      <Coins className="w-3 h-3" />
                      {reward.cost}
                    </Badge>
                  </div>

                  {reward.description && (
                    <p className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary mb-4 leading-relaxed italic">
                      "{reward.description}"
                    </p>
                  )}

                  <div className="mt-auto">
                    {reward.claimed ? (
                      <Button
                        variant="secondary"
                        size="md"
                        fullWidth
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        iconPosition="right"
                        onClick={() => handleClaim(reward)}
                      >
                        {t('claimed')}
                      </Button>
                    ) : affordable ? (
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        loading={isProcessing}
                        onClick={() => setClaimTarget({ type: 'balance', reward })}
                      >
                        {t('claimNow')}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="md"
                        fullWidth
                        disabled
                        icon={<Coins className="w-3.5 h-3.5" />}
                      >
                        {t('needMoreCoins').replace('{count}', String(needed))}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Level Rewards */}
          {sortedLevelRewards.map((reward) => {
            const isUnlocked = reward.unlocked;
            const isGranted = reward.granted;
            const isProcessing = processingId === reward.id;
            const levelColor = reward.required_level?.badge_color || '#8b5cf6';

            return (
              <Card
                key={`level-${reward.id}`}
                hoverable={isUnlocked && !isGranted}
                padding="none"
                className={`overflow-hidden flex flex-col transition-all duration-500
                  ${isGranted
                    ? 'border border-emerald-200 dark:border-emerald-500/20'
                    : isUnlocked
                      ? 'border border-violet-200 dark:border-violet-500/20 hover:-translate-y-1'
                      : 'opacity-70 hover:opacity-90'
                  }`}
              >
                {/* Image */}
                <div className="h-52 bg-surface-secondary dark:bg-surface-dark-elevated relative overflow-hidden group/reward">
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
                      <Badge variant="muted" size="md">
                        <Lock className="w-3 h-3" /> {t('levelRequired').replace('{level}', String(reward.required_level.number))}
                      </Badge>
                    </div>
                  )}

                  {isGranted && (
                    <div className="absolute inset-0 bg-emerald-950/30 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <Badge variant="success" size="md">
                        <Check className="w-3 h-3 stroke-[3px]" /> {t('granted')}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="text-h4 text-brand-dark dark:text-text-theme-dark-primary leading-tight break-words flex-1">{reward.name}</h3>
                    <span
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-pill text-label uppercase tracking-wider border font-semibold"
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
                    <p className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary mb-4 leading-relaxed italic">
                      "{reward.description}"
                    </p>
                  )}

                  <div className="mt-auto">
                    {isGranted ? (
                      <Button
                        variant="secondary"
                        size="md"
                        fullWidth
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        iconPosition="right"
                        onClick={() => handleClaimLevel(reward)}
                      >
                        {t('claimed') || 'Claimed'}
                      </Button>
                    ) : isUnlocked ? (
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        loading={isProcessing}
                        className="bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
                        onClick={() => setClaimTarget({ type: 'level', reward })}
                      >
                        {t('claimFree')}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="md"
                        fullWidth
                        disabled
                        icon={<Lock className="w-3.5 h-3.5" />}
                      >
                        {t('levelRequired').replace('{level}', String(reward.required_level.number))}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Coins History */}
      <section className="animate-in fade-in duration-700 delay-200 fill-mode-both">
        <div className="flex items-center gap-3 px-1 mb-4">
          <div className="w-9 h-9 rounded-input bg-amber-500/10 border border-amber-500/10 flex items-center justify-center shrink-0">
            <History className="w-[18px] h-[18px] text-amber-500" />
          </div>
          <div>
            <h2 className="section-label">{t('coinsHistory')}</h2>
            <p className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary">{t('trackingEarnings')}</p>
          </div>
        </div>
        <div className="bg-surface-primary dark:bg-surface-dark-secondary rounded-card shadow-card dark:shadow-card-dark border border-surface-secondary dark:border-surface-dark-elevated overflow-hidden">
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
