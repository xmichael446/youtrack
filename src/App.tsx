import React, { useState } from 'react';
import { ViewState } from './types';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Lessons from './pages/Lessons';
import { Rewards } from './pages/Rewards';
import Login from './pages/Login';
import Footer from './components/Footer';
import { LayoutDashboard, Trophy, BookOpen, Gift } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { LeaderboardProvider } from './context/LeaderboardContext';
import { NotificationProvider } from './context/NotificationContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isLogged') === 'true';
  });

  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const { t } = useLanguage();

  const handleLogin = (code: string) => {
    console.log('Logging in with code:', code);
    setIsAuthenticated(true);
    localStorage.setItem('isLogged', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLogged');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('studentCode');
  };

  // Efficient Favicon Management
  React.useEffect(() => {
    const mode = isDark ? 'dark' : 'light';
    const baseUrl = `/favicon/${mode}/`;

    const iconLinks = [
      { rel: 'apple-touch-icon', href: `${baseUrl}apple-touch-icon.png`, sizes: '180x180' },
      { rel: 'icon', href: `${baseUrl}favicon-32x32.png`, sizes: '32x32', type: 'image/png' },
      { rel: 'icon', href: `${baseUrl}favicon-16x16.png`, sizes: '16x16', type: 'image/png' },
      { rel: 'manifest', href: `${baseUrl}site.webmanifest` }
    ];

    iconLinks.forEach(linkDef => {
      let link = document.querySelector(`link[rel="${linkDef.rel}"]${linkDef.sizes ? `[sizes="${linkDef.sizes}"]` : ''}`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = linkDef.rel;
        if (linkDef.sizes) link.sizes = linkDef.sizes;
        if (linkDef.type) link.type = linkDef.type;
        document.head.appendChild(link);
      }
      if (link.href !== linkDef.href) {
        link.href = linkDef.href;
      }
    });
  }, [isDark]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} isDark={isDark} toggleTheme={toggleTheme} />;
  }

  return (
    <DashboardProvider>
      <NotificationProvider>
        <AppContent
          currentView={currentView}
          setCurrentView={setCurrentView}
          isDark={isDark}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
        />
      </NotificationProvider>
    </DashboardProvider>
  );
};

const AppContent: React.FC<{
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  isDark: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
}> = ({ currentView, setCurrentView, isDark, toggleTheme, handleLogout }) => {
  const { t } = useLanguage();
  const { user } = useDashboard();
  const mainRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const resetScroll = () => {
      if (mainRef.current) {
        mainRef.current.scrollTop = 0;
        mainRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    resetScroll();
    const t1 = setTimeout(resetScroll, 10);
    const t2 = setTimeout(resetScroll, 50);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentView]);

  const renderView = () => {
    const View = (() => {
      switch (currentView) {
        case 'dashboard': return <Dashboard />;
        case 'leaderboard': return <Leaderboard />;
        case 'lessons': return <Lessons />;
        case 'rewards': return <Rewards />;
        default: return <Dashboard />;
      }
    })();

    return (
      <div key={currentView} className="animate-view-entry w-full">
        {View}
      </div>
    );
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: React.ElementType; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setCurrentView(view)}
        className={`flex flex-col md:flex-row items-center justify-center md:justify-start px-2 py-2.5 md:px-4 md:py-3.5 w-full md:w-auto rounded-2xl transition-all duration-300 group relative
          ${isActive
            ? 'text-brand-primary bg-brand-primary/8 dark:bg-brand-primary/12 md:bg-gradient-to-r md:from-brand-primary/10 md:to-transparent shadow-sm'
            : 'text-gray-400 dark:text-slate-500 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-gray-50 dark:hover:bg-slate-800/50'
          }`}
      >
        {/* Active indicator bar (desktop) */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-primary rounded-r-full hidden md:block shadow-[0_0_8px_rgba(18,194,220,0.6)]"></div>
        )}

        <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          <Icon className={`w-5 h-5 md:w-[18px] md:h-[18px] transition-all duration-300 ${isActive ? 'stroke-[2.5px] drop-shadow-[0_0_6px_rgba(18,194,220,0.5)]' : ''}`} />
          {isActive && (
            <div className="absolute -inset-2 bg-brand-primary/15 blur-lg rounded-full md:hidden"></div>
          )}
        </div>
        <span className={`text-[9px] md:text-[12px] font-bold mt-1 md:mt-0 md:ml-3.5 tracking-wide uppercase md:capitalize font-mono transition-all ${isActive ? 'text-brand-primary' : ''}`}>
          {label}
        </span>
      </button>
    );
  };

  const LoadingScreen = () => {
    const { loading } = useDashboard();
    if (!loading) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-[3px] border-brand-primary/10 rounded-full"></div>
            <div className="absolute inset-0 border-[3px] border-transparent border-t-brand-primary rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-[2px] border-transparent border-t-brand-primary/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
          </div>
          <p className="text-[10px] font-mono font-[800] text-gray-400 dark:text-slate-500 uppercase tracking-[5px] animate-pulse">
            Syncing YouTrack
          </p>
        </div>
      </div>
    );
  };

  const SidebarProgress = () => {
    const { course } = useDashboard();
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-brand-primary/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
        <div className="relative z-10">
          <p className="text-[9px] font-mono font-bold text-brand-primary uppercase tracking-[3px] mb-1.5">{t('overallProgress')}</p>
          <p className="font-bold text-base leading-tight mb-4 text-white/90">{course?.name || 'Loading...'}</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-primary shadow-[0_0_8px_rgba(18,194,220,0.6)] transition-all duration-1000 rounded-full"
                style={{ width: `${course?.completion || 0}%` }}
              ></div>
            </div>
            <span className="text-[11px] font-mono font-bold text-white/60 tabular-nums">{course?.completion || 0}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <LeaderboardProvider accessCode={user?.accessCode} enrollmentId={user?.id}>
      <LoadingScreen />
      <div className="h-dvh w-full bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-gray-900 dark:text-slate-100 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 h-full z-40 p-4 lg:p-5 shrink-0">
          {/* Logo */}
          <div className="px-2 py-5 mb-6 flex items-center justify-center">
            <img
              src={isDark ? "/logo-dark.png" : "/logo-light.png"}
              alt="YouTrack Logo"
              className="w-40 h-10 object-contain"
            />
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label={t('dashboard')} />
            <NavItem view="leaderboard" icon={Trophy} label={t('leaderboard')} />
            <NavItem view="lessons" icon={BookOpen} label={t('lessons')} />
            <NavItem view="rewards" icon={Gift} label={t('giftShop')} />
          </nav>

          {/* Sidebar Footer */}
          <div className="space-y-4 mt-4">
            <SidebarProgress />
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800/50">
              <Footer isDark={isDark} />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Header isDark={isDark} toggleTheme={toggleTheme} onLogout={handleLogout} />

          <main
            id="main-scroll-container"
            ref={mainRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 pt-[calc(5.5rem+env(safe-area-inset-top))] md:pt-8 pb-[calc(90px+env(safe-area-inset-bottom))] md:pb-8 custom-scrollbar bg-gray-50 dark:bg-slate-950 flex flex-col"
          >
            <div className="max-w-5xl mx-auto w-full flex-1">
              {renderView()}
            </div>
          </main>

          {/* Bottom Nav (Mobile) */}
          <nav className="md:hidden absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-gray-100 dark:border-slate-800 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.06)] transition-colors duration-300">
            <div className="flex justify-around items-center px-2">
              <NavItem view="dashboard" icon={LayoutDashboard} label={t('dashboard')} />
              <NavItem view="leaderboard" icon={Trophy} label={t('leaderboard')} />
              <NavItem view="lessons" icon={BookOpen} label={t('lessons')} />
              <NavItem view="rewards" icon={Gift} label={t('giftShop')} />
            </div>
          </nav>
        </div>
      </div>
    </LeaderboardProvider>
  );
};

export default App;
