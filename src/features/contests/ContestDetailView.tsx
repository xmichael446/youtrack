import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Award,
  BookOpen,
  Search,
  Coins,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useDashboard } from '../../context/DashboardContext';
import { useContests } from '../../context/ContestContext';
import { useNavigation } from '../../context/NavigationContext';
import LoadingScreen from '../../components/LoadingScreen';
import Toast from '../../components/ui/Toast';
import BackButton from '../../components/ui/BackButton';
import StatusBadge from '../../components/ui/StatusBadge';
import PlaceIcon from '../../components/ui/PlaceIcon';
import RankBadge from '../../components/ui/RankBadge';
import { useCountdown } from '../../hooks/useCountdown';
import { formatDateTime } from '../../utils/formatDateTime';
import { prizeGradient, CONTEST_STORAGE_KEY, ContestPlayState } from '../../utils/contestHelpers';
import ContestActionButton from './ContestActionButton';
import type { ContestNav } from './contestTypes';
import type {
  ContestDetailData,
  ContestResultsData,
  ContestLiveLeaderboardResponse,
} from '../../services/apiTypes';

const ContestDetailView: React.FC<{
  contestId: number;
  onNavigate: (nav: ContestNav) => void;
}> = ({ contestId, onNavigate }) => {
  const { t } = useLanguage();
  const { user } = useDashboard();
  const { navigateToProfile, goBack } = useNavigation();
  const { getContestDetail, registerForContest, getContestResults, getContestLeaderboard } = useContests();
  const [detail, setDetail] = useState<ContestDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [results, setResults] = useState<ContestResultsData | null>(null);
  const [liveLeaderboard, setLiveLeaderboard] = useState<ContestLiveLeaderboardResponse | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Find my entry in the leaderboard to get the rank
  const myLeaderboardEntry = results?.leaderboard?.find(entry => {
    const profileId = entry.id || entry.enrollment_id;
    return profileId === user.id;
  });
  const myRank = results?.my_attempt?.rank || liveLeaderboard?.my_rank || myLeaderboardEntry?.rank;

  // Read submitted play state from localStorage once on mount
  const [localPlayState] = useState<ContestPlayState | null>(() => {
    try {
      const raw = localStorage.getItem(CONTEST_STORAGE_KEY(contestId));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const isSubmitted = localPlayState?.submitted === true;

  const countdown = useCountdown(
    detail?.status === 'scheduled' ? detail.scheduled_start :
    detail?.status === 'open' ? detail.scheduled_end : null
  );

  useEffect(() => {
    setLoading(true);
    getContestDetail(contestId)
      .then(d => { setDetail(d); setError(null); })
      .catch(e => setError(e?.message || t('contestNotFound')))
      .finally(() => setLoading(false));
  }, [contestId, getContestDetail]);

  // Live-refresh every 30 s while contest is open
  useEffect(() => {
    if (!detail || detail.status !== 'open') return;
    const id = setInterval(() => {
      getContestDetail(contestId).then(d => setDetail(d)).catch(() => {});
      getContestLeaderboard(contestId).then(l => setLiveLeaderboard(l)).catch(() => {});
    }, 30_000);
    return () => clearInterval(id);
  }, [detail?.status, contestId, getContestDetail, getContestLeaderboard]);

  // Load full results when finalized, or live leaderboard when open/closed
  useEffect(() => {
    if (!detail) return;
    if (detail.status === 'finalized') {
      getContestResults(contestId).then(r => setResults(r)).catch(() => {});
    } else if (detail.status === 'open' || detail.status === 'closed') {
      getContestLeaderboard(contestId)
        .then(l => setLiveLeaderboard(l))
        .catch(err => console.error("Live Leaderboard Error:", err));
    }
  }, [detail?.status, contestId, getContestResults, getContestLeaderboard]);

  const handleAction = async () => {
    if (!detail) return;
    if (detail.status === 'scheduled' && !detail.is_registered) {
      setRegistering(true);
      try {
        const res = await registerForContest(contestId);
        setDetail(d => d ? { ...d, is_registered: true, registration_count: res.registration_count } : d);
        setToast({ msg: res.message, type: 'success' });
      } catch (e: any) {
        setToast({ msg: e?.data?.message || e?.message || 'Registration failed', type: 'error' });
      } finally {
        setRegistering(false);
      }
    } else if (detail.status === 'open' && detail.is_registered && !isSubmitted) {
      onNavigate({ view: 'play', contestId });
    }
  };

  if (loading) return (
    <div className="space-y-5 animate-in fade-in duration-normal min-h-[60vh] flex flex-col items-center justify-center">
      <LoadingScreen message={t('inspectingBattle')} />
    </div>
  );

  if (error || !detail) return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <BackButton label={t('contestBackToList')} onClick={() => goBack('contests')} />
      <div className="flex flex-col items-center gap-3 py-20 bg-red-50/50 dark:bg-red-900/10 rounded-card border border-red-100 dark:border-red-500/10">
        <div className="w-12 h-12 rounded-card bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-red-500 font-medium">{error || t('contestNotFound')}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <BackButton label={t('contestBackToList')} onClick={() => goBack('contests')} />

      {/* Header card -- light theme consistent with lesson cards */}
      <div className="bg-surface-primary dark:bg-surface-dark-secondary rounded-card border border-gray-100 dark:border-slate-800 overflow-hidden shadow-card dark:shadow-card-dark">
        {/* Brand accent top strip */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-primary via-cyan-400 to-brand-primary/40" />

        <div className="p-4 md:p-6">
          {/* Title + badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-label font-mono text-brand-primary uppercase tracking-[3px] mb-1">{t('contestDetails')}</p>
              <h2 className="text-h2 tracking-tight text-gray-900 dark:text-white">{t('vocabContest')} #{detail.number}</h2>
            </div>
            <StatusBadge status={detail.status} t={t} />
          </div>

          {/* Compact info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            {[
              { label: t('contestInfoStart'), value: formatDateTime(detail.scheduled_start), icon: Calendar },
              { label: t('contestInfoDuration'), value: t('contestDuration'), icon: Clock },
              { label: t('contestInfoQuestions'), value: String(detail.question_count), icon: BookOpen },
              { label: t('contestInfoRegistered'), value: String(detail.registration_count), icon: Users, live: detail.status === 'open' },
            ].map(({ label, value, icon: Icon, live }) => (
              <div key={label} className="flex items-center gap-2 min-w-0">
                <Icon className="w-3 h-3 text-brand-primary/50 shrink-0" />
                <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted truncate">{label}</span>
                <span className="text-caption font-bold text-text-theme-secondary dark:text-text-theme-dark-secondary ml-auto shrink-0 tabular-nums">{value}</span>
                {live && (
                  <span className="relative flex w-1.5 h-1.5 shrink-0 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500" />
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Countdown */}
          {(detail.status === 'scheduled' || detail.status === 'open') && (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-button text-xs font-mono mb-4 bg-brand-primary/5 border border-brand-primary/15">
              <Clock className="w-3 h-3 text-brand-primary" />
              <span className="text-text-theme-secondary dark:text-text-theme-dark-secondary">{detail.status === 'scheduled' ? t('contestStartsIn') : t('contestEndsIn')}:</span>
              <span className="text-gray-900 dark:text-white font-bold tabular-nums">{countdown}</span>
            </div>
          )}

          {/* Prize name pills / Winners */}
          {detail.status === 'finalized' && detail.winners && detail.winners.length > 0 ? (
            <div className="space-y-2 mt-4">
              {detail.winners.map((winner, idx) => {
                const place = winner.place || idx + 1;
                const name = winner.name || t('unknownStudent');
                const avatar = (winner as any).avatar;
                const rewardName = winner.reward_name;
                const xp = winner.xp;
                const coins = winner.coins;
                const profileId = winner.id;
                const isMe = !!profileId && profileId === user.id;

                return (
                  <div key={profileId || idx} onClick={() => {
                    if (isMe) navigateToProfile(null);
                    else if (profileId) navigateToProfile(profileId);
                  }} className="flex items-center justify-between gap-3 p-3 rounded-input bg-surface-secondary dark:bg-surface-dark-secondary/50 border border-gray-100 dark:border-slate-700/50 shadow-card transition-all hover:bg-gray-100 dark:hover:bg-surface-dark-secondary cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        <RankBadge rank={place} />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-body font-bold block leading-tight ${isMe ? 'text-brand-primary' : 'text-gray-900 dark:text-text-theme-dark-primary'} group-hover:text-brand-primary transition-colors`}>{name}</span>
                        {rewardName && (
                          <span className="text-caption font-medium text-text-theme-secondary dark:text-text-theme-dark-secondary block mt-0.5">{rewardName}</span>
                        )}
                      </div>
                    </div>
                    {(xp || coins) && (
                      <div className={`flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0 px-2 py-1 sm:py-2 rounded-button border shadow-sm ${
                        place === 1 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/30' :
                        place === 2 ? 'bg-surface-secondary dark:bg-surface-dark-secondary border-slate-200 dark:border-slate-700' :
                        'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700/30'
                      }`}>
                        <div className="flex items-center gap-2">
                          {xp && <span className={`text-[10px] font-mono font-bold ${
                            place === 1 ? 'text-amber-600 dark:text-amber-400' :
                            place === 2 ? 'text-slate-600 dark:text-slate-400' :
                            'text-orange-600 dark:text-orange-400'
                          }`}>+{xp} XP</span>}
                          {xp && coins && <div className={`hidden sm:block w-1 h-1 rounded-full ${
                            place === 1 ? 'bg-amber-300 dark:bg-amber-700' :
                            place === 2 ? 'bg-slate-300 dark:bg-slate-700' :
                            'bg-orange-300 dark:bg-orange-700'
                          }`} />}
                          {coins && <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                            place === 1 ? 'text-amber-600 dark:text-amber-400' :
                            place === 2 ? 'text-slate-600 dark:text-slate-400' :
                            'text-orange-600 dark:text-orange-400'
                          }`}>+{coins} <Coins className="w-2.5 h-2.5" /></span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : detail.prizes && detail.prizes.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {detail.prizes.map(p => (
                <div key={p.place} className="inline-flex items-center gap-2 px-2 py-1 rounded-button text-caption font-semibold bg-surface-secondary dark:bg-surface-dark-secondary border border-gray-100 dark:border-slate-700">
                  <PlaceIcon place={p.place} className="w-3.5 h-3.5" />
                  <span className="text-text-theme-secondary dark:text-text-theme-dark-secondary">{p.reward_name}</span>
                </div>
              ))}
            </div>
          ) : null}

          {/* Submitted -- show score inside the card */}
          {isSubmitted && detail.status === 'open' && localPlayState?.score !== undefined && (
            <div className="mt-4 flex items-center gap-3 px-3 py-2 rounded-input bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{t('contestSubmitted')}</span>
              <span className="ml-auto text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                {localPlayState.score}/{localPlayState.total}
              </span>
            </div>
          )}
          {isSubmitted && detail.status === 'open' && localPlayState?.score === undefined && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-input bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{t('contestSubmitted')} · {t('contestWaitingResults')}</span>
            </div>
          )}
        </div>
      </div>

      <div className={detail.status === 'finalized' ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"}>
        {/* Left Column: Registrations or Live/Final Leaderboard */}
        <div className={detail.status === 'finalized' ? "" : "order-2 lg:order-1"}>
          {detail.status === 'scheduled' ? (
            <div>
              <h3 className="text-label font-mono uppercase tracking-[2px] mb-3 flex items-center gap-2 px-1 text-text-theme-muted dark:text-text-theme-dark-muted">
                <div className="w-5 h-5 rounded-md bg-brand-primary/10 flex items-center justify-center">
                  <Users className="w-3 h-3 text-brand-primary" />
                </div>
                {t('contestRegistrations').replace('{count}', String(detail.registrations?.length || detail.registration_count))}
              </h3>
              {detail.registrations && detail.registrations.length > 0 ? (
                <div className="overflow-hidden rounded-input border border-gray-100 dark:border-slate-800 bg-surface-primary dark:bg-surface-dark-secondary/50">
                  <table className="w-full text-left text-sm"><thead className="bg-gray-50/50 dark:bg-surface-dark-secondary/50 text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary font-mono uppercase tracking-wider"><tr><th className="px-4 py-3 font-medium text-center w-12">#</th><th className="px-4 py-3 font-medium">Student</th><th className="px-4 py-3 font-medium text-right">XP</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                      {detail.registrations.map((reg, idx) => {
                        const rawName = reg.full_name || (reg as any).name || (reg as any).student_name || (reg as any).student?.full_name || '';
                        const name = typeof rawName === 'string' && rawName.trim() !== '' ? rawName.trim() : 'Unknown Student';
                        const avatar = reg.avatar || (reg as any).student?.avatar;
                        const profileId = reg.id || (reg as any).student_id || (reg as any).enrollment_id || (reg as any).student?.id;
                        const isMe = (!!profileId && profileId === user.id) || (name === user.name);
                        return (
                          <tr key={profileId || idx} onClick={() => {
                            if (isMe) navigateToProfile(null);
                            else if (profileId) navigateToProfile(profileId);
                          }} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                            <td className="px-2 sm:px-4 py-3 text-center text-text-theme-muted dark:text-text-theme-dark-muted font-mono text-caption">{idx + 1}</td>
                            <td className="px-2 sm:px-4 py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className={`font-semibold ${isMe ? 'text-brand-primary' : 'text-gray-900 dark:text-text-theme-dark-primary'} text-caption group-hover:text-brand-primary transition-colors`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isMe) navigateToProfile(null);
                                    else if (profileId) navigateToProfile(profileId);
                                  }}>{name}</span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2 sm:gap-2">
                                {reg.level && (
                                  <span className="text-[10px] sm:text-xs" title={reg.level.name}>{reg.level.icon}</span>
                                )}
                                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2 sm:px-2 py-0.5 rounded-full whitespace-nowrap">{reg.xp} XP</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}</tbody></table>
                </div>
              ) : (
                <p className="text-body text-text-theme-muted dark:text-text-theme-dark-muted italic py-2 px-1">No one registered yet.</p>
              )}
            </div>
          ) : detail.status === 'finalized' ? (
            <div className="space-y-8 animate-in fade-in duration-700">
              {/* My result section -- redesigned to match lesson quiz style */}
              {results?.my_attempt && (
                <div className="bg-surface-secondary dark:bg-surface-dark-secondary/50 p-4 rounded-card border border-gray-100 dark:border-slate-700/50 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-primary/10 rounded-input flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-brand-primary" />
                      </div>
                      <div>
                        <h4 className="text-h4 text-gray-900 dark:text-white">{t('contestYourResult')}</h4>
                        <p className="text-label font-mono text-text-theme-secondary uppercase tracking-wider mt-0.5">{myRank ? `Rank #${myRank}` : t('contestSubmitted')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-label font-mono font-bold text-text-theme-muted uppercase tracking-widest block mb-1">{t('correctAnswers')}</span>
                      <span className="text-h2 font-mono text-brand-primary">{results.my_attempt.score}<span className="text-gray-300 dark:text-text-theme-dark-muted mx-1">/</span>{results.my_attempt.total}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate({ view: 'review', contestId, answers: results.my_attempt?.answers || [] })}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-surface-primary dark:bg-surface-dark-secondary text-brand-primary border border-brand-primary/20 rounded-input font-bold text-body hover:bg-brand-primary/5 transition-all shadow-card active:scale-[0.98]"
                  >
                    <Search className="w-4 h-4" />
                    {t('reviewAnswers')}
                  </button>
                </div>
              )}

              <div>
                <h3 className="text-label font-mono uppercase tracking-[2px] mb-3 flex items-center gap-2 px-1 text-text-theme-muted dark:text-text-theme-dark-muted">
                  <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-amber-500" />
                  </div>
                  {t('contestLeaderboard')}
                </h3>

                <div className="overflow-hidden rounded-input border border-gray-100 dark:border-slate-800 bg-surface-primary dark:bg-surface-dark-secondary/50">
                  <table className="w-full text-left text-sm"><thead className="bg-surface-secondary/50 dark:bg-surface-dark-secondary/50 text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary font-mono uppercase tracking-wider"><tr><th className="px-2 sm:px-4 py-3 font-medium text-center w-10 sm:w-14">Rank</th><th className="px-2 sm:px-4 py-3 font-medium">Student</th><th className="px-2 sm:px-4 py-3 font-medium text-right">Score</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                      {(results?.leaderboard || []).map((entry: any, idx: number) => {
                        const profileId = entry.id || entry.enrollment_id || entry.student_id || entry.student?.id;
                        const name = entry.name || 'Unknown Student';
                        const isMe = (!!profileId && profileId === user.id) || (name === user.name);
                        const avatar = (entry as any).avatar;

                        const place = entry.rank || idx + 1;
                        const prize = entry.prize;

                        return (
                          <tr key={profileId || idx} onClick={() => {
                            if (isMe) navigateToProfile(null);
                            else if (profileId) navigateToProfile(profileId);
                          }} className={`transition-colors cursor-pointer group ${isMe ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : 'hover:bg-gray-50/5 dark:hover:bg-slate-800/50'}`}>
                            <td className="px-2 sm:px-4 py-3 text-center">
                              <div className="flex justify-center"><PlaceIcon place={place} /></div>
                            </td>
                            <td className="px-2 sm:px-4 py-3">
                              <div className="flex items-center justify-between gap-2 sm:gap-3">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className={`font-semibold text-xs sm:text-sm ${isMe ? 'text-brand-primary' : 'text-gray-900 dark:text-text-theme-dark-primary'} group-hover:text-brand-primary transition-colors cursor-pointer`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isMe) navigateToProfile(null);
                                        else if (profileId) navigateToProfile(profileId);
                                      }}>{name as string}</span>
                                    {isMe && <span className="text-[8px] sm:text-[9px] font-bold font-mono uppercase tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25 px-1 sm:px-2 py-0.5 rounded-full shrink-0">YOU</span>}
                                  </div>
                                </div>
                                {prize && (
                                  <div className="flex items-center gap-1 shrink-0 px-2 sm:px-2 py-0.5 sm:py-1 rounded-button bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30">
                                    <PlaceIcon place={prize.place} className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-300 hidden md:inline">{prize.reward_name}</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-300 md:hidden">{prize.reward_name.split(' ')[0]}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-right">
                              <span className={`text-[10px] sm:text-[11px] font-mono font-bold tabular-nums ${isMe ? 'text-brand-primary' : 'text-text-theme-muted dark:text-text-theme-dark-muted'}`}>{entry.score}/{entry.total}</span>
                            </td>
                          </tr>
                        );
                      })}</tbody></table></div></div>
            </div>
          ) : detail.status === 'open' || detail.status === 'closed' ? (
            <div>
              <h3 className="text-label font-mono uppercase tracking-[2px] mb-3 flex items-center gap-2 px-1 text-text-theme-muted dark:text-text-theme-dark-muted">
                <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
                  <span className="relative flex w-2 h-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
                  </span>
                </div>
                Live Leaderboard
              </h3>

              <div className="overflow-hidden rounded-input border border-gray-100 dark:border-slate-800 bg-surface-primary dark:bg-surface-dark-secondary/50">
                {!liveLeaderboard ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                    <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted font-mono">Loading live rankings...</p>
                  </div>
                ) : liveLeaderboard.leaderboard.length > 0 ? (
                  <table className="w-full text-left text-sm"><thead className="bg-surface-secondary/50 dark:bg-surface-dark-secondary/50 text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary font-mono uppercase tracking-wider"><tr><th className="px-2 sm:px-4 py-3 font-medium text-center w-10 sm:w-14">Rank</th><th className="px-2 sm:px-4 py-3 font-medium">Student</th><th className="px-2 sm:px-4 py-3 font-medium text-right">Score</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                      {liveLeaderboard.leaderboard.map((entry, idx) => {
                        const profileId = entry.id || entry.enrollment_id || (entry as any).student_id || (entry as any).student?.id;
                        const name = entry.name || 'Unknown Student';
                        const isMe = (!!profileId && profileId === user.id) || (name === user.name);

                        return (
                          <tr key={profileId || idx} onClick={() => {
                            if (isMe) navigateToProfile(null);
                            else if (profileId) navigateToProfile(profileId);
                          }} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors animate-in fade-in duration-normal cursor-pointer group">
                            <td className="px-2 sm:px-4 py-3 text-center">
                              <div className="flex justify-center"><PlaceIcon place={entry.rank || idx + 1} /></div>
                            </td>
                            <td className="px-2 sm:px-4 py-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className={`font-semibold text-xs sm:text-sm ${isMe ? 'text-brand-primary' : 'text-gray-900 dark:text-text-theme-dark-primary'} group-hover:text-brand-primary transition-colors cursor-pointer`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isMe) navigateToProfile(null);
                                        else if (profileId) navigateToProfile(profileId);
                                      }}>
                                      {name}
                                    </span>
                                    {isMe && <span className="text-[8px] sm:text-[9px] font-bold font-mono uppercase tracking-wider bg-brand-primary/15 text-brand-primary border border-brand-primary/25 px-1 sm:px-2 py-0.5 rounded-full shrink-0">YOU</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-right">
                              <span className={`text-caption font-mono font-bold tabular-nums ${isMe ? 'text-brand-primary' : 'text-text-theme-muted dark:text-text-theme-dark-muted'}`}>{entry.score}/{entry.total}</span>
                            </td>
                          </tr>
                        );
                      })}</tbody></table>
                ) : (
                  <p className="text-body text-text-theme-muted dark:text-text-theme-dark-muted italic py-6 px-1 text-center">{t('waitingSubmissions')}</p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column: Prizes */}
        {detail.status !== 'finalized' && detail.prizes.length > 0 && (
          <div className="order-1 lg:order-2">
            <div>
              <h3 className="text-label font-mono uppercase tracking-[2px] mb-3 flex items-center gap-2 px-1 text-text-theme-muted dark:text-text-theme-dark-muted">
                <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <Award className="w-3 h-3 text-amber-500" />
                </div>
                {t('contestPrizes')}
              </h3>
              <div className="divide-y divide-gray-100 dark:divide-slate-800/50 bg-surface-primary dark:bg-surface-dark-secondary/50 border border-gray-100 dark:border-slate-800 rounded-input overflow-hidden">
                {detail.prizes.map(prize => {
                  const g = prizeGradient(prize.place);
                  return (
                    <div key={prize.place} className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0 drop-shadow-sm"><PlaceIcon place={prize.place} /></div>
                        <div>
                          <p className="text-body font-bold text-gray-900 dark:text-text-theme-dark-primary tracking-tight">{prize.reward_name}</p>
                          {prize.reward_description && (
                            <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted mt-0.5">{prize.reward_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full border ${g.badge}`}>+{prize.xp} XP</span>
                        <span className="text-[10px] font-mono font-bold flex items-center gap-1 text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-2 py-1 rounded-full">+{prize.coins} <Coins className="w-3 h-3" /></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action button -- hidden if submitted */}
      {!isSubmitted && <ContestActionButton detail={detail} onAction={handleAction} loading={registering} t={t} />}
    </div>
  );
};

export default ContestDetailView;
