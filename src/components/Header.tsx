import React, { useState, useEffect, useRef } from 'react';
import { Bell, Coins, Zap, Sun, Moon, LogOut, Flame } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigation } from '../context/NavigationContext';
import { apiService } from '../services/ApiService';
import { Z_INDEX } from '../constants/zIndex';
import { Card, Badge, Button, EmptyState } from '../components/ui';

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

type NotificationGroup = 'Today' | 'Yesterday' | 'Earlier';

function getNotificationGroup(isoString: string): NotificationGroup {
  const date = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (notifDate.getTime() === today.getTime()) return 'Today';
  if (notifDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return 'Earlier';
}

const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, onLogout }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, enrollment } = useDashboard();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const { navigateTo } = useNavigation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState<string | null>(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

  const notificationBtnRef = useRef<HTMLButtonElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const profilePanelRef = useRef<HTMLDivElement>(null);

  // Fetch avatar from PROFILE API on mount and when dashboard user changes
  useEffect(() => {
    apiService.getProfile()
      .then(res => {
        if (res.data.avatar && !res.data.avatar.includes('picsum.photos') && res.data.avatar !== '/avatar.png') {
            const url = res.data.avatar.startsWith('http') ? res.data.avatar : `${baseUrl}${res.data.avatar}`;
            setHeaderAvatarUrl(url);
        } else {
            setHeaderAvatarUrl(null);
        }
      })
      .catch(() => {
        // Fallback to dashboard user avatar if profile API fails
        if (user?.avatar && !user.avatar.includes('picsum.photos') && user.avatar !== '/avatar.png') {
            const url = user.avatar.startsWith('http') ? user.avatar : `${baseUrl}${user.avatar}`;
            setHeaderAvatarUrl(url);
        } else {
            setHeaderAvatarUrl(null);
        }
      });
  }, [user?.id, baseUrl]);

  // ESC to close dropdowns and return focus to trigger; click-outside to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNotifications) {
          setShowNotifications(false);
          notificationBtnRef.current?.focus();
        } else if (showProfileMenu) {
          setShowProfileMenu(false);
          profileBtnRef.current?.focus();
        }
      }
    };
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        showNotifications &&
        notificationPanelRef.current &&
        !notificationPanelRef.current.contains(target) &&
        !notificationBtnRef.current?.contains(target)
      ) {
        setShowNotifications(false);
      }
      if (
        showProfileMenu &&
        profilePanelRef.current &&
        !profilePanelRef.current.contains(target) &&
        !profileBtnRef.current?.contains(target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [showNotifications, showProfileMenu]);

  // Move focus into panel when it opens
  useEffect(() => {
    if (!showNotifications) return;
    notificationPanelRef.current
      ?.querySelector<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
      ?.focus();
  }, [showNotifications]);

  useEffect(() => {
    if (!showProfileMenu) return;
    profilePanelRef.current
      ?.querySelector<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
      ?.focus();
  }, [showProfileMenu]);

  const getNotificationTypeInfo = (type: string): {
    label: string;
    header: string;
    badgeVariant: 'brand' | 'success' | 'muted';
  } => {
    switch (type) {
      case 'lesson_times': return {
        label: t('reminder'),
        header: t('lessonReminder'),
        badgeVariant: 'brand',
      };
      case 'hw_approved': return {
        label: t('assignment'),
        header: t('assignmentApproved'),
        badgeVariant: 'success',
      };
      default: return {
        label: t('info'),
        header: t('info'),
        badgeVariant: 'muted',
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
      markAllAsRead();
    }
  };

  const avatarBg = getAvatarBg(user?.id ?? 0);
  const initials = getInitials(user?.name ?? 'S');

  return (
    <>
      <header className="bg-surface-primary/95 dark:bg-surface-dark-secondary/95 backdrop-blur-lg border-b border-surface-secondary/80 dark:border-surface-dark-elevated/80 fixed w-full md:sticky top-0 px-3 md:px-8 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-3 md:py-3 flex items-center justify-between shadow-[0_1px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_20px_rgba(0,0,0,0.2)] transition-colors duration-normal" style={{ zIndex: Z_INDEX.dropdown }}>
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
          <div className="flex items-center gap-2">
            {/* Streak chip */}
            <div className="hidden md:flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 rounded-input px-2 py-1 shrink-0">
              <Flame className={`w-3.5 h-3.5 shrink-0 ${(enrollment?.streak ?? 0) > 0 ? 'text-amber-500' : 'text-surface-secondary dark:text-surface-dark-elevated'}`} />
              <span className={`text-body tabular-nums leading-none ${(enrollment?.streak ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-text-theme-muted dark:text-text-theme-dark-muted'}`}>
                {enrollment?.streak ?? 0}d
              </span>
            </div>

            {/* Level + XP chip */}
            <div className="hidden md:flex items-center gap-2 bg-surface-secondary dark:bg-surface-dark-secondary/70 border border-surface-secondary dark:border-surface-dark-elevated/50 rounded-input px-2 py-1 shrink-0">
              {enrollment?.level ? (
                <span className="w-[18px] h-[18px] rounded-md flex items-center justify-center text-caption shrink-0 leading-none"
                  style={{ backgroundColor: `${enrollment.level.badge_color}22` }}>
                  {enrollment.level.icon}
                </span>
              ) : (
                <Zap className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              )}
              <span className="text-body text-text-theme-secondary dark:text-text-theme-dark-primary whitespace-nowrap tabular-nums leading-none">
                {enrollment?.level
                  ? <>Lvl&nbsp;{enrollment.level.number}<span className="hidden sm:inline text-text-theme-muted dark:text-text-theme-dark-muted">&nbsp;·&nbsp;{user?.xp || 0}&nbsp;<span className="text-caption">XP</span></span></>
                  : <>{user?.xp || 0}&nbsp;<span className="text-text-theme-muted dark:text-text-theme-dark-muted text-caption">XP</span></>}
              </span>
            </div>

            {/* Coins chip */}
            <div className="flex items-center gap-2 bg-surface-secondary dark:bg-surface-dark-secondary/70 border border-surface-secondary dark:border-surface-dark-elevated/50 rounded-input px-2 py-1 shrink-0">
              <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-body text-text-theme-secondary dark:text-text-theme-dark-primary whitespace-nowrap tabular-nums leading-none">
                {user?.coins || 0}
              </span>
            </div>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            {/* Notifications */}
            <div className="relative">
              <button
                ref={notificationBtnRef}
                onClick={handleOpenNotifications}
                aria-label={unreadCount > 0 ? t('notificationsUnread', { count: unreadCount }) : t('notifications')}
                aria-expanded={showNotifications}
                aria-haspopup="true"
                className={`w-10 h-10 flex items-center justify-center rounded-input transition-all duration-fast relative ${showNotifications ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-theme-secondary dark:text-text-theme-dark-secondary hover:bg-surface-secondary dark:hover:bg-surface-dark-elevated'}`}
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-surface-primary dark:border-surface-dark-secondary rounded-full animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <Card
                  ref={notificationPanelRef}
                  variant="elevated"
                  padding="none"
                  role="region"
                  aria-label={t('notifications')}
                  className="absolute top-full right-0 mt-2 w-[280px] md:w-[340px] overflow-hidden animate-in fade-in duration-fast"
                  style={{ zIndex: Z_INDEX.overlay }}
                >
                  {/* Header row */}
                  <div className="px-4 py-3 bg-surface-secondary/50 dark:bg-surface-dark-secondary/50 border-b border-surface-secondary dark:border-surface-dark-elevated flex justify-between items-center">
                    <h3 className="text-h4 text-text-theme-primary dark:text-text-theme-dark-primary">{t('notifications')}</h3>
                    <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
                      {t('markAllRead')}
                    </Button>
                  </div>

                  {/* Notification list */}
                  <div className="max-h-[65vh] md:max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <EmptyState
                        icon={<Bell className="w-5 h-5" />}
                        message={t('noNotifications')}
                        className="py-8"
                      />
                    ) : (
                      (() => {
                        const groups: NotificationGroup[] = ['Today', 'Yesterday', 'Earlier'];
                        const grouped = groups.reduce<Record<NotificationGroup, typeof notifications>>((acc, g) => {
                          acc[g] = notifications.filter(n => getNotificationGroup(n.scheduled_datetime) === g);
                          return acc;
                        }, { Today: [], Yesterday: [], Earlier: [] });

                        return groups.map(groupLabel => {
                          const group = grouped[groupLabel];
                          if (group.length === 0) return null;
                          return (
                            <div key={groupLabel}>
                              <div className="px-4 py-2 text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary bg-surface-secondary dark:bg-surface-dark-secondary border-b border-surface-secondary dark:border-surface-dark-elevated">
                                {groupLabel}
                              </div>
                              <div className="divide-y divide-surface-secondary dark:divide-surface-dark-elevated/50">
                                {group.map(notification => {
                                  const typeInfo = getNotificationTypeInfo(notification.type);
                                  const message = language === 'uz' ? notification.message_uz : notification.message_en;
                                  return (
                                    <div
                                      key={notification.id}
                                      className={`p-3 hover:bg-surface-secondary/50 dark:hover:bg-surface-dark-secondary/50 transition-colors ${!notification.read ? 'border-l-4 border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10' : ''}`}
                                    >
                                      <div className="flex justify-between items-start mb-1">
                                        <Badge variant={typeInfo.badgeVariant} size="sm">
                                          {typeInfo.label}
                                        </Badge>
                                        <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted tabular-nums">
                                          {formatTime(notification.scheduled_datetime)}
                                        </span>
                                      </div>
                                      <p className="text-body text-brand-dark dark:text-text-theme-dark-primary leading-snug">{typeInfo.header}</p>
                                      <p className="text-caption text-text-theme-secondary dark:text-text-theme-dark-secondary mt-0.5 leading-relaxed whitespace-pre-line">{message}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-surface-secondary dark:border-surface-dark-elevated/70">
                <button
                  ref={profileBtnRef}
                  onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                  aria-label={t('profile')}
                  aria-expanded={showProfileMenu}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 hover:opacity-80 transition-all active:scale-95 group"
                >
                  {/* Clickable Name (Desktop) */}
                  <div className="hidden sm:block text-right">
                    <p className="text-body text-text-theme-primary dark:text-text-theme-dark-primary leading-none truncate max-w-[110px] group-hover:text-brand-primary transition-colors">{user?.name || 'Student'}</p>
                    <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted mt-0.5">{t('student')}</p>
                  </div>
                  
                  {/* Clickable Avatar */}
                  <div className="relative">
                    {headerAvatarUrl ? (
                      <img src={headerAvatarUrl} alt="avatar"
                        className={`w-9 h-9 rounded-input object-cover border-2 border-surface-primary dark:border-surface-dark-elevated shadow-sm ring-2 ${showProfileMenu ? 'ring-brand-primary' : 'ring-brand-primary/10 group-hover:ring-brand-primary/30'} transition-all`} />
                    ) : (
                      <div className={`w-9 h-9 rounded-input flex items-center justify-center text-white text-body border-2 border-surface-primary dark:border-surface-dark-elevated shadow-sm ring-2 ${showProfileMenu ? 'ring-brand-primary' : 'ring-brand-primary/10 group-hover:ring-brand-primary/30'} transition-all`}
                        style={{ backgroundColor: avatarBg }}>
                        {initials}
                      </div>
                    )}
                  </div>
                </button>
              </div>

              {showProfileMenu && (
                <div
                  ref={profilePanelRef}
                  role="menu"
                  aria-label={user?.name ?? t('student')}
                  className="absolute top-full right-0 mt-2 w-72 bg-surface-primary dark:bg-surface-dark-secondary rounded-card shadow-2xl border border-surface-secondary dark:border-surface-dark-elevated overflow-hidden animate-in fade-in duration-fast"
                  style={{ zIndex: Z_INDEX.overlay }}
                >
                  {/* Profile Header (Name also clickable here) */}
                  <div 
                    role="menuitem"
                    tabIndex={0}
                    className="p-4 bg-surface-secondary/50 dark:bg-surface-dark-elevated/50 border-b border-surface-secondary dark:border-surface-dark-elevated flex items-center gap-3 cursor-pointer hover:bg-surface-secondary dark:hover:bg-surface-dark-elevated transition-colors"
                    onClick={() => { navigateTo('profile'); setShowProfileMenu(false); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { navigateTo('profile'); setShowProfileMenu(false); } }}
                  >
                    {headerAvatarUrl ? (
                      <img src={headerAvatarUrl} alt="avatar"
                        className="w-12 h-12 rounded-input object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-input flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ backgroundColor: avatarBg }}>
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-body text-brand-dark dark:text-text-theme-dark-primary truncate">{user?.name || 'Student'}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="bg-brand-primary/10 text-brand-primary text-caption px-2 py-0.5 rounded-full">{t('student')}</span>
                        <span className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted">{user?.accessCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-0.5">
                    {/* Night Mode */}
                    <button
                      role="menuitem"
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-3 py-2 text-body text-text-theme-secondary dark:text-text-theme-dark-primary hover:bg-surface-secondary dark:hover:bg-surface-dark-elevated rounded-input transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-indigo-500 flex items-center justify-center shrink-0">
                          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </div>
                        <span>{t('nightMode')}</span>
                      </div>
                      <div className={`w-9 h-5 rounded-full relative transition-colors duration-normal ${isDark ? 'bg-brand-primary' : 'bg-surface-secondary'}`}>
                        <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-normal ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </button>

                    {/* Language */}
                    <div className="w-full flex items-center justify-between px-3 py-2 text-body text-text-theme-secondary dark:text-text-theme-dark-primary hover:bg-surface-secondary dark:hover:bg-surface-dark-elevated rounded-input transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-sky-500 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium">{language.toUpperCase()}</span>
                        </div>
                        <span>{t('language')}</span>
                      </div>
                      <div className="flex bg-surface-secondary dark:bg-surface-dark-elevated p-1 rounded-button gap-0.5">
                        <button onClick={() => setLanguage('uz')}
                          className={`px-2 py-1 rounded-md text-caption transition-all ${language === 'uz' ? 'bg-surface-primary dark:bg-surface-dark-elevated shadow-sm text-brand-dark dark:text-text-theme-dark-primary' : 'text-text-theme-muted dark:text-text-theme-dark-muted hover:text-text-theme-secondary'}`}>
                          UZB
                        </button>
                        <button onClick={() => setLanguage('en')}
                          className={`px-2 py-1 rounded-md text-caption transition-all ${language === 'en' ? 'bg-surface-primary dark:bg-surface-dark-elevated shadow-sm text-brand-dark dark:text-text-theme-dark-primary' : 'text-text-theme-muted dark:text-text-theme-dark-muted hover:text-text-theme-secondary'}`}>
                          ENG
                        </button>
                      </div>
                    </div>

                    <div className="my-1 border-t border-surface-secondary dark:border-surface-dark-elevated" />

                    {/* Logout */}
                    <button
                      role="menuitem"
                      className="w-full flex items-center gap-3 px-3 py-2 text-body text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-input transition-colors group"
                      onClick={() => { setShowProfileMenu(false); onLogout(); }}
                    >
                      <div className="text-red-500 flex items-center justify-center shrink-0 group-hover:text-red-600 transition-colors">
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
    </>
  );
};

export default Header;
