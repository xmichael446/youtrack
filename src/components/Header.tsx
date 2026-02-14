import React, { useState, useEffect } from 'react';
import { Bell, Coins, Zap, Sun, Moon, User as UserIcon, LogOut } from 'lucide-react';
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
  const [showCoinsHistory, setShowCoinsHistory] = useState(false);
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
    setShowCoinsHistory(false);
    setShowProfileMenu(false);

    if (newState && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 fixed w-full md:sticky top-0 z-30 px-2 md:px-8 pt-2 pb-4 md:py-4 flex items-center justify-between shadow-sm transition-colors duration-300">
      <div className="flex items-center md:hidden min-w-0">
        <img
          src={isDark ? "/logo-dark.png" : "/logo-light.png"}
          alt="YouTrack Logo"
          className="w-16 sm:w-20 h-6 sm:h-7 object-contain"
          onError={(e) => {
            // Fallback to generic logo
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>

      {/* Left side spacer for desktop to align with content */}
      <div className="hidden md:block"></div>

      <div className="flex items-center space-x-2 md:space-x-6 min-w-0 flex-shrink ml-auto">
        {/* Combined Stats Pill - Stacked on Mobile for UX */}
        <div className="flex flex-col md:flex-row md:items-center bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-100 dark:border-slate-700/50 rounded-xl md:rounded-2xl shadow-sm min-w-0 relative">
          <div
            className="flex items-center space-x-1.5 md:space-x-2 px-2 md:px-0 py-1 md:py-0 rounded-lg"
          >
            <Coins className="w-3 md:w-4 h-3 md:h-4 text-amber-500 fill-amber-500 shrink-0" />
            <span className="font-bold text-[11px] md:text-sm text-gray-700 dark:text-slate-200 whitespace-nowrap leading-none">{user?.coins || 0} Coins</span>
          </div>

          {/* Vertical divider on mobile, horizontal on desktop */}
          <div className="hidden md:block w-px h-4 bg-gray-200 dark:bg-slate-700 mx-3"></div>
          <div className="md:hidden h-px w-full bg-gray-200 dark:bg-slate-700/50 my-1"></div>

          <div className="flex items-center space-x-1.5 md:space-x-2 px-2 md:px-0">
            <Zap className="w-3 md:w-4 h-3 md:h-4 text-brand-primary fill-brand-primary shrink-0" />
            <span className="font-bold text-[11px] md:text-sm text-gray-700 dark:text-slate-200 whitespace-nowrap leading-none">{user?.xp || 0} XP</span>
          </div>
        </div>

        {/* Action Group */}
        <div className="flex items-center space-x-1 md:space-x-3 shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleOpenNotifications}
              className="w-11 h-11 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-all relative border border-transparent hover:border-brand-primary/10 shadow-none active:scale-95"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-3 w-[260px] md:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-gray-300 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 bg-gray-50/50 dark:bg-slate-800/50 border-b-2 border-gray-200 dark:border-slate-700 flex justify-between items-center gap-2 flex-wrap sm:flex-nowrap">
                  <h3 className="font-bold text-[10px] sm:text-xs text-gray-900 dark:text-white uppercase tracking-wider shrink-0">{t('notifications')}</h3>
                  <span
                    onClick={() => markAllAsRead()}
                    className="text-[8px] sm:text-[9px] text-brand-primary font-black cursor-pointer hover:text-brand-accent transition-colors uppercase tracking-widest shrink-0"
                  >
                    {t('markAllRead')}
                  </span>
                </div>
                <div className="max-h-[60vh] md:max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/50 text-left">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-xs">
                      {t('noNotifications') || 'No notifications'}
                    </div>
                  ) : (
                    notifications.map(notification => {
                      const typeInfo = getNotificationTypeInfo(notification.type);
                      const message = language === 'uz' ? notification.message_uz : notification.message_en;

                      return (
                        <div key={notification.id} className={`p-2.5 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors border-b-2 border-gray-100 dark:border-slate-800/50 ${!notification.read ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''}`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-lg border ${typeInfo.color}`}>
                              {typeInfo.label.toUpperCase()}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 tabular-nums uppercase">
                              {formatTime(notification.scheduled_datetime)}
                            </span>
                          </div>
                          <p className="text-[11px] font-black text-brand-dark dark:text-white leading-snug">{typeInfo.header}</p>
                          <p className="text-[10px] text-neutral-body dark:text-slate-400 mt-0.5 leading-relaxed opacity-80 whitespace-pre-line">{message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Hook - Only trigger button in header flow */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                setShowCoinsHistory(false);
              }}
              className={`flex items-center pl-2 sm:pl-4 border-l-2 border-gray-300 dark:border-slate-800 group transition-all active:scale-95 ${showProfileMenu ? 'opacity-70' : ''}`}
            >
              <div className="hidden sm:block text-right mr-3">
                <p className="text-xs font-black text-gray-900 dark:text-white leading-none truncate max-w-[120px]">{user?.name || 'Student'}</p>
                <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-widest">{t('student')}</p>
              </div>
              <div className="relative">
                <img
                  src={user?.avatar || '/default-avatar.png'}
                  alt={user?.name || 'Student'}
                  className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover ring-2 ring-brand-primary/10 group-hover:ring-brand-primary/30 transition-all"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-gray-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-5 bg-gray-50/50 dark:bg-slate-800/50 border-b-2 border-gray-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-sm font-black text-brand-dark dark:text-white truncate">{user?.name || 'Student'}</h3>
                    <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{t('student')}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">ID: {user?.accessCode}</p>
                </div>

                <div className="p-2 space-y-1">
                  {/* Night Mode Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-3 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mr-3 transition-all">
                        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <span>{t('nightMode')}</span>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-slate-700'}`}>
                      <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </button>

                  {/* Language Selector */}
                  <div className="w-full flex items-center justify-between px-3 py-3 text-xs font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center mr-3 transition-all">
                        <span className="text-[10px] font-black">{language.toUpperCase()}</span>
                      </div>
                      <span>{t('language') || 'Language'}</span>
                    </div>
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                      <button
                        onClick={() => setLanguage('uz')}
                        className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${language === 'uz' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-dark dark:text-white' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                      >
                        UZB
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-dark dark:text-white' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                      >
                        ENG
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logout Button in Dropdown */}
                <button
                  className="w-full flex items-center justify-between px-3 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors group"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mr-3 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-all">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span>{t('logout')}</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
