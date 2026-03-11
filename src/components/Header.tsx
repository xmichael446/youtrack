import React, { useState } from 'react';
import { Bell, Coins, Zap, Sun, Moon, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDashboard } from '../context/DashboardContext';
import { useNotifications } from '../context/NotificationContext';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, onLogout }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useDashboard();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
      markAllAsRead().then(r => {console.log(r)});
    }
  };

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-100/80 dark:border-slate-800/80 fixed w-full md:sticky top-0 z-30 px-3 md:px-8 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-3.5 md:py-3.5 flex items-center justify-between shadow-[0_1px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_20px_rgba(0,0,0,0.2)] transition-colors duration-300">
      {/* Mobile Logo */}
      <div className="flex items-center md:hidden min-w-0">
        <img
          src={isDark ? "/logo-dark.png" : "/logo-light.png"}
          alt="YouTrack Logo"
          className="w-16 sm:w-20 h-6 sm:h-7 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>

      {/* Desktop spacer */}
      <div className="hidden md:block"></div>

      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink ml-auto">
        {/* Stats Pill — redesigned as a single clean card */}
        <div className="flex items-center bg-gray-50 dark:bg-slate-800/70 border border-gray-100 dark:border-slate-700/50 rounded-2xl px-3.5 py-2 gap-3 shadow-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
            <span className="font-bold text-[12px] md:text-sm text-gray-700 dark:text-slate-200 whitespace-nowrap font-mono tabular-nums">{user?.coins || 0}</span>
          </div>
          <div className="w-px h-4 bg-gray-200 dark:bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" />
            </div>
            <span className="font-bold text-[12px] md:text-sm text-gray-700 dark:text-slate-200 whitespace-nowrap font-mono tabular-nums">{user?.xp || 0} <span className="text-gray-400 dark:text-slate-500 text-[10px]">XP</span></span>
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
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2.5 w-[280px] md:w-[340px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-900 dark:text-white">{t('notifications')}</h3>
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[10px] font-mono font-bold text-brand-primary hover:text-brand-accent transition-colors uppercase tracking-wider"
                  >
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
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 pl-2.5 md:pl-3.5 border-l border-gray-200 dark:border-slate-700/70 group transition-all active:scale-95"
            >
              <div className="hidden sm:block text-right">
                <p className="text-[12px] font-bold text-gray-900 dark:text-white leading-none truncate max-w-[110px]">{user?.name || 'Student'}</p>
                <p className="text-[9px] font-mono font-bold text-gray-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">{t('student')}</p>
              </div>
              <div className="relative">
                <img
                  src={user?.avatar || '/default-avatar.png'}
                  alt={user?.name || 'Student'}
                  className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm object-cover ring-2 ring-brand-primary/10 group-hover:ring-brand-primary/30 transition-all"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-2.5 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Profile Header */}
                <div className="p-4 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
                  <img
                    src={user?.avatar || '/default-avatar.png'}
                    alt={user?.name || 'Student'}
                    className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-brand-dark dark:text-white truncate">{user?.name || 'Student'}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">{t('student')}</span>
                      <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">{user?.accessCode}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 space-y-0.5">
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
                      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDark ? 'translate-x-4' : 'translate-x-0'}`}></div>
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
                      <button
                        onClick={() => setLanguage('uz')}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all font-mono ${language === 'uz' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-dark dark:text-white' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'}`}
                      >
                        UZB
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-bold transition-all font-mono ${language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-dark dark:text-white' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'}`}
                      >
                        ENG
                      </button>
                    </div>
                  </div>

                  <div className="my-1 border-t border-gray-100 dark:border-slate-800"></div>

                  {/* Logout */}
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors group"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
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
  );
};

export default Header;
