import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useNavigation } from '../context/NavigationContext';
import { apiService } from '../services/ApiService';
import LoadingScreen from '../components/LoadingScreen';
import type { ProfileData, ActivityEntry, HeatmapEntry } from '../services/apiTypes';

import {
  ProfileHero,
  AchievementShowcase,
  ActivityHeatmap,
  ActivityFeed,
  ProfileEdit,
  PrivacySettings,
} from '../features/profile';

// ---------------------------------------------------------------------------
// Inline Toast (profile-local, matches original styling)
// ---------------------------------------------------------------------------

const Toast: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => (
  <div role={type === 'error' ? 'alert' : 'status'} aria-live={type === 'error' ? 'assertive' : 'polite'}
    className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-white text-sm font-medium animate-in fade-in duration-300
    ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
    {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
    {message}
  </div>
);

// ---------------------------------------------------------------------------
// Main Profile page
// ---------------------------------------------------------------------------

const Profile: React.FC = () => {
  const { profileEnrollmentId } = useNavigation();
  const { t } = useLanguage();
  const [subView, setSubView] = useState<'view' | 'edit' | 'settings'>('view');

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [hasMoreActivity, setHasMoreActivity] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<'notFound' | 'general' | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = profileEnrollmentId
        ? await apiService.getProfileView(profileEnrollmentId)
        : await apiService.getProfile();
      setProfile(res.data);

      const showActivity = res.data.is_own_profile || !res.data.privacy.hide_activity;
      if (showActivity) {
        const [heatRes, actRes] = await Promise.all([
          apiService.getProfileHeatmap(profileEnrollmentId ?? null),
          apiService.getProfileActivity(1, profileEnrollmentId ?? null),
        ]);
        setHeatmap(heatRes.data);
        setActivity(actRes.data.entries);
        setActivityPage(1);
        setHasMoreActivity(actRes.data.has_next);
      }
    } catch (err: any) {
      setError(err.status === 404 ? 'notFound' : 'general');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    setSubView('view');
  }, [profileEnrollmentId]);

  const handleLoadMore = async () => {
    if (!profile) return;
    setLoadingMore(true);
    try {
      const res = await apiService.getProfileActivity(activityPage + 1, profileEnrollmentId ?? null);
      setActivity(prev => [...prev, ...res.data.entries]);
      setActivityPage(activityPage + 1);
      setHasMoreActivity(res.data.has_next);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSaveProfile = async (bio: string, avatar?: File) => {
    setSaving(true);
    try {
      const res = await apiService.updateProfile(bio, avatar);
      setProfile(res.data);
      setSubView('view');
      showToast(t('profileUpdated'));
    } catch (err: any) {
      showToast(err?.data?.message ?? err?.message ?? 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePrivacy = async (field: 'hide_balance' | 'hide_activity', value: boolean) => {
    await apiService.updatePrivacy({ [field]: value });
    setProfile(prev => prev ? { ...prev, privacy: { ...prev.privacy, [field]: value } } : prev);
    showToast(t('settingsSaved'));
  };

  if (loading) {
    return <LoadingScreen message={t('loading')} />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-gray-400 dark:text-slate-500" />
        <div>
          <p className="text-base font-bold text-brand-dark dark:text-white">
            {error === 'notFound' ? t('studentNotFound') : t('somethingWentWrong')}
          </p>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            {error === 'notFound' ? t('studentNotFoundDesc') : t('somethingWentWrongDesc')}
          </p>
        </div>
        <button onClick={loadProfile}
          className="px-4 h-9 rounded-xl bg-brand-primary/10 text-brand-primary text-xs font-medium hover:bg-brand-primary/20 transition-colors">
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  const showActivity = profile.is_own_profile || !profile.privacy.hide_activity;

  return (
    <div className="space-y-4 pb-10 animate-in fade-in duration-700">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {subView === 'edit' && (
        <ProfileEdit profile={profile} enrollmentId={profileEnrollmentId}
          onSave={handleSaveProfile} onBack={() => setSubView('view')} saving={saving} />
      )}

      {subView === 'settings' && (
        <PrivacySettings profile={profile} onToggle={handleTogglePrivacy} onBack={() => setSubView('view')} />
      )}

      {subView === 'view' && (
        <>
          <ProfileHero profile={profile} enrollmentId={profileEnrollmentId}
            onEdit={() => setSubView('edit')} onSettings={() => setSubView('settings')} />
          <AchievementShowcase achievements={profile.achievements} />
          {showActivity && (
            <>
              <ActivityHeatmap entries={heatmap} />
              <ActivityFeed entries={activity} hasMore={hasMoreActivity}
                onLoadMore={handleLoadMore} loadingMore={loadingMore} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
