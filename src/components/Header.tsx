import React, { useState, useRef, useEffect } from 'react';
import { Bell, Coins, Zap, Sun, Moon, LogOut, Flame, X, Camera, AlertCircle, Edit3 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigation } from '../context/NavigationContext';
import { apiService } from '../services/ApiService';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0] ?? '').join('').toUpperCase();
}
function getAvatarBg(id: number) {
  return `hsl(${(id * 137) % 360}, 60%, 50%)`;
}

// Isolated modal component — owns all edit state so typing doesn't re-render Header
const ProfileEditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initials: string;
  avatarBg: string;
  onSaved: (url: string | null) => void;
}> = React.memo(({ isOpen, onClose, initials, avatarBg, onSaved }) => {
  const { t } = useLanguage();
  const { refetch } = useDashboard();
  const [profileLoading, setProfileLoading] = useState(false);
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

  useEffect(() => {
    if (!isOpen) return;
    setSaveError(null);
    setAvatarFile(null);
    setProfileLoading(true);
    apiService.getProfile()
      .then(res => {
        setBio(res.data.bio ?? '');
        setAvatarPreview(res.data.avatar ? `${baseUrl}${res.data.avatar}` : null);
      })
      .catch(() => { setBio(''); setAvatarPreview(null); })
      .finally(() => setProfileLoading(false));
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await apiService.updateProfile(bio, avatarFile ?? undefined);
      const url = res.data.avatar ? `${baseUrl}${res.data.avatar}` : null;
      setAvatarPreview(url);
      setAvatarFile(null);
      refetch();
      onSaved(url);
      onClose();
    } catch (err: any) {
      setSaveError(err?.data?.message ?? err?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSaveError(t('avatarTooBig')); return; }
    setSaveError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in fade-in duration-300">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-[15px] font-bold text-brand-dark dark:text-white">{t('editProfile')}</h2>
          <button onClick={() => !saving && onClose()}
            className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {profileLoading ? (
          <div className="flex items-center justify-center py-14">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar"
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-slate-700" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl font-bold ring-2 ring-gray-100 dark:ring-slate-700"
                    style={{ backgroundColor: avatarBg }}>
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-7 h-7 text-white" />
                </div>
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="text-[12px] text-brand-primary font-bold font-mono uppercase tracking-wide hover:text-brand-primary/80 transition-colors">
                {t('uploadPhoto')}
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            </div>

            <div>
              <label className="block text-[11px] font-bold font-mono uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">
                {t('bio')}
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 280))}
                placeholder={t('bioPlaceholder')}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-[14px] text-brand-dark dark:text-white placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary resize-none font-sans transition-all"
              />
              <p className="text-right text-[10px] font-mono text-gray-300 dark:text-slate-600 mt-1">{bio.length} / 280</p>
            </div>

            {saveError && (
              <div className="flex items-center gap-2 text-red-500 text-[12px] font-mono bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {saveError}
              </div>
            )}

            <button onClick={handleSave} disabled={saving}
              className="w-full h-12 rounded-xl bg-brand-primary text-white font-bold text-[13px] uppercase tracking-wider font-mono hover:bg-brand-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {t('saveChanges')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, onLogout }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, enrollment } = useDashboard();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { navigateTo } = useNavigation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Edit Profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState<string | null>(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

  // Fetch avatar from dashboard on mount
  React.useEffect(() => {
    if (user?.avatar && !user.avatar.includes('picsum.photos') && user.avatar !== '/avatar.png') {
        const url = user.avatar.startsWith('http') ? user.avatar : `${baseUrl}${user.avatar}`;
        setHeaderAvatarUrl(url);
    } else {
        setHeaderAvatarUrl(null);
    }
  }, [user?.avatar, baseUrl]);

  const openEditModal = () => {
    setShowEditModal(true);
    setShowProfileMenu(false);
  };

  const getNotificationTypeInfo = (type: string) => {
    switch (type) {
      case 'lesson_times': return {
        label: t('reminder'),
        header: t('lessonReminder'),
        color: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
      };
      case 'hw_approved': return {
        label: t('assignment'),
        header: t('assignmentApproved'),
        color: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
      };
      default: return {
        label: t('info'),
        header: t('info'),
        color: 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-slate-700 dark:text-slate-400'
      };
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenNotifications = () => {
    const newState = !showNotifications;
    setShowNotifications(newState);
    setShowProfileMenu(false);
    if (newState && unreadCount > 0) {
      markAllAsRead().then(r => { console.log(r) });
    }
  };

  const avatarBg = getAvatarBg(user?.id ?? 0);
  const initials = getInitials(user?.name ?? 'S');

  return (
    <>
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-100/80 dark:border-slate-800/80 fixed w-full md:sticky top-0 z-30 px-3 md:px-8 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-3.5 md:py-3.5 flex items-center justify-between shadow-[0_1px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_20px_rgba(0,0,0,0.2)] transition-colors duration-300">
        {/* Mobile Logo */}
        <div className="flex items-center md:hidden min-w-0">
          <img
            src={isDark ? "/logo-dark.png" : "/logo-light.png"}
            alt="YouTrack Logo"
            className="w-16 sm:w-20 h-6 sm:h-7 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
          />
        </div>

        {/* Desktop spacer */}
        <div className="hidden md:block" />

        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink ml-auto">
          {/* Stats cluster */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Streak chip */}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 rounded-xl px-2.5 py-1.5 shrink-0">
              <Flame className={`w-3.5 h-3.5 shrink-0 ${(enrollment?.streak ?? 0) > 0 ? 'text-amber-500' : 'text-gray-300 dark:text-slate-600'}`} />
              <span className={`font-semibold text-[12px] whitespace-nowrap font-mono tabular-nums leading-none ${(enrollment?.streak ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-slate-500'}`}>
                {enrollment?.streak ?? 0}d
              </span>
            </div>

            {/* Level + XP chip */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/50 rounded-xl px-2.5 py-1.5 shrink-0">
              {enrollment?.level ? (
                <span className="w-[18px] h-[18px] rounded-md flex items-center justify-center text-[12px] shrink-0 leading-none"
                  style={{ backgroundColor: `${enrollment.level.badge_color}22` }}>
                  {enrollment.level.icon}
                </span>
              ) : (
                <Zap className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              )}
              <span className="font-semibold text-[12px] text-gray-700 dark:text-slate-200 whitespace-nowrap font-mono tabular-nums leading-none">
                {enrollment?.level
                  ? <>Lvl&nbsp;{enrollment.level.number}<span className="hidden sm:inline text-gray-400 dark:text-slate-500">&nbsp;·&nbsp;{user?.xp || 0}&nbsp;<span className="text-[10px]">XP</span></span></>
                  : <>{user?.xp || 0}&nbsp;<span className="text-gray-400 dark:text-slate-500 text-[10px]">XP</span></>}
              </span>
            </div>

            {/* Coins chip */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/50 rounded-xl px-2.5 py-1.5 shrink-0">
              <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-semibold text-[12px] text-gray-700 dark:text-slate-200 whitespace-nowrap font-mono tabular-nums leading-none">
                {user?.coins || 0}
              </span>
            </div>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={handleOpenNotifications}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 relative ${showNotifications ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2.5 w-[280px] md:w-[340px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in duration-200">
                  <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-900 dark:text-white">{t('notifications')}</h3>
                    <button onClick={() => markAllAsRead()}
                      className="text-[10px] font-mono font-bold text-brand-primary hover:text-brand-accent transition-colors uppercase tracking-wider">
                      {t('markAllRead')}
                    </button>
                  </div>
                  <div className="max-h-[65vh] md:max-h-96 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/50">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-gray-200 dark:text-slate-700 mx-auto mb-2" />
                        <p className="text-xs font-mono text-gray-400 dark:text-slate-500">{t('noNotifications')}</p>
                      </div>
                    ) : (
                      notifications.map(notification => {
                        const typeInfo = getNotificationTypeInfo(notification.type);
                        const message = language === 'uz' ? notification.message_uz : notification.message_en;
                        return (
                          <div key={notification.id} className={`p-3.5 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors ${!notification.read ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''}`}>
                            <div className="flex justify-between items-start mb-1.5">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border font-mono tracking-wider ${typeInfo.color}`}>
                                {typeInfo.label.toUpperCase()}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 tabular-nums font-mono">
                                {formatTime(notification.scheduled_datetime)}
                              </span>
                            </div>
                            <p className="text-[12px] font-bold text-brand-dark dark:text-white leading-snug">{typeInfo.header}</p>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed whitespace-pre-line">{message}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <div className="flex items-center">
                <button
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                  className="flex items-center gap-2.5 pl-2.5 md:pl-3.5 border-l border-gray-200 dark:border-slate-700/70 group transition-all active:scale-95"
                >
                  <div className="hidden sm:block text-right hover:opacity-80 transition-opacity cursor-pointer" onClick={(e) => { e.stopPropagation(); navigateTo('profile'); setShowProfileMenu(false); }}>
                    <p className="text-[12px] font-bold text-gray-900 dark:text-white leading-none truncate max-w-[110px]">{user?.name || 'Student'}</p>
                    <p className="text-[9px] font-mono font-bold text-gray-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">{t('student')}</p>
                  </div>
                  {/* Avatar */}
                  <div className="relative cursor-pointer hover:ring-brand-primary/40 transition-all" onClick={(e) => { e.stopPropagation(); navigateTo('profile'); setShowProfileMenu(false); }}>
                    {headerAvatarUrl ? (
                      <img src={headerAvatarUrl} alt="avatar"
                        className="w-9 h-9 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-sm ring-2 ring-brand-primary/10 group-hover:ring-brand-primary/30 transition-all" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[13px] font-bold border-2 border-white dark:border-slate-800 shadow-sm ring-2 ring-brand-primary/10 group-hover:ring-brand-primary/30 transition-all"
                        style={{ backgroundColor: avatarBg }}>
                        {initials}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  </div>
                </button>
              </div>

              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in duration-200">
                  {/* Profile Header */}
                  <div 
                    className="p-4 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => { navigateTo('profile'); setShowProfileMenu(false); }}
                  >
                    {headerAvatarUrl ? (
                      <img src={headerAvatarUrl} alt="avatar"
                        className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0"
                        style={{ backgroundColor: avatarBg }}>
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-brand-dark dark:text-white truncate">{user?.name || 'Student'}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">{t('student')}</span>
                        <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">{user?.accessCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-0.5">
                    {/* Edit Profile */}
                    <button
                      onClick={openEditModal}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                        <Edit3 className="w-4 h-4" />
                      </div>
                      <span>{t('editProfile')}</span>
                    </button>

                    {/* Night Mode */}
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </div>
                        <span>{t('nightMode')}</span>
                      </div>
                      <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-brand-primary' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </button>

                    {/* Language */}
                    <div className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold font-mono">{language.toUpperCase()}</span>
                        </div>
                        <span>{t('language')}</span>
                      </div>
                      <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg gap-0.5">
                        <button onClick={() => setLanguage('uz')}
                          className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all font-mono ${language === 'uz' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-dark dark:text-white' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'}`}>
                          UZB
                        </button>
                        <button onClick={() => setLanguage('en')}
                          className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all font-mono ${language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-dark dark:text-white' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'}`}>
                          ENG
                        </button>
                      </div>
                    </div>

                    <div className="my-1 border-t border-gray-100 dark:border-slate-800" />

                    {/* Logout */}
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors group"
                      onClick={() => { setShowProfileMenu(false); onLogout(); }}
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initials={initials}
        avatarBg={avatarBg}
        onSaved={(url) => setHeaderAvatarUrl(url)}
      />
    </>
  );
};

export default Header;
