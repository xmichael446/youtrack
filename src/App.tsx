import React, { useState, useCallback } from 'react';
import { ViewState } from './types';
import { useRouter } from './router/useRouter';
import type { RouteParams } from './router/routes';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Lessons from './pages/Lessons';
import { Rewards } from './pages/Rewards';
import Profile from './pages/Profile';
import { Contests } from './pages/Contests';
import Login from './pages/Login';
import Footer from './components/Footer';
import { LayoutDashboard, Trophy, BookOpen, Gift, Swords } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { NotificationProvider } from './context/NotificationContext';
import { NavigationContext } from './context/NavigationContext';

const NavItem = ({
  view, icon: Icon, label, currentView, onNavigate,
}: {
  view: ViewState; icon: React.ElementType; label: string;
  currentView: ViewState; onNavigate: (view: ViewState) => void;
}) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => onNavigate(view)}
      className={`flex flex-col md:flex-row items-center justify-center md:justify-start px-2 py-2 md:px-4 md:py-2 w-full md:w-auto rounded-2xl transition-all duration-300 group relative
        ${isActive
          ? 'text-brand-primary bg-brand-primary/8 dark:bg-brand-primary/12 md:bg-gradient-to-r md:from-brand-primary/10 md:to-transparent shadow-sm'
          : 'text-text-theme-muted dark:text-text-theme-dark-muted hover:text-brand-primary dark:hover:text-brand-primary hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary/50'
        }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-primary rounded-r-full hidden md:block shadow-[0_0_8px_rgba(18,194,220,0.6)]"></div>
      )}
      <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        <Icon className={`w-5 h-5 md:w-[18px] md:h-[18px] transition-all duration-300 ${isActive ? 'stroke-[2.5px] drop-shadow-[0_0_6px_rgba(18,194,220,0.5)]' : ''}`} />
        {isActive && (
          <div className="absolute -inset-2 bg-brand-primary/15 blur-lg rounded-full md:hidden"></div>
        )}
      </div>
      <span className={`text-caption md:text-body mt-1 md:mt-0 md:ml-3 md:capitalize transition-all ${isActive ? 'text-brand-primary' : ''}`}>
        {label}
      </span>
    </button>
  );
};

const SidebarProgress = () => {
  const { course } = useDashboard();
  const { t } = useLanguage();
  return (
    <div className="bg-brand-dark dark:bg-surface-dark-secondary rounded-2xl p-4 text-white shadow-sm relative overflow-hidden group border border-white/5">
      <div className="relative z-10">
        <p className="section-label text-brand-primary mb-1">{t('overallProgress')}</p>
        <p className="text-h4 leading-tight mb-4 text-white/90">{course?.name || 'Loading...'}</p>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary transition-all duration-1000 rounded-full"
              style={{ width: `${course?.completion || 0}%` }}
            ></div>
          </div>
          <span className="text-caption text-white/60 tabular-nums">{course?.completion || 0}%</span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { view: currentView, params, navigate, goBack } = useRouter('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isLogged') === 'true';
  });

  // Derive profileEnrollmentId from route params for deep-link support
  const profileEnrollmentId = currentView === 'profile' && params.id
    ? Number(params.id)
    : null;

  const navigateToProfile = useCallback((enrollmentId: number | null) => {
    if (enrollmentId !== null) {
      navigate('profile', { id: String(enrollmentId) });
    } else {
      navigate('profile');
    }
  }, [navigate]);

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

  const navigateTo = (view: ViewState, routeParams: RouteParams = {}) => {
    navigate(view, routeParams);
  };

  return (
    <NavigationContext.Provider value={{ params, profileEnrollmentId, navigateToProfile, goBack, navigateTo }}>
      <DashboardProvider>
        <NotificationProvider>
          <AppContent
            currentView={currentView}
            navigateTo={navigateTo}
            isDark={isDark}
            toggleTheme={toggleTheme}
            handleLogout={handleLogout}
          />
        </NotificationProvider>
      </DashboardProvider>
    </NavigationContext.Provider>
  );
};

const AppContent: React.FC<{
  currentView: ViewState;
  navigateTo: (view: ViewState, params?: RouteParams) => void;
  isDark: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
}> = ({ currentView, navigateTo, isDark, toggleTheme, handleLogout }) => {
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
        case 'profile': return <Profile />;
        case 'contests': return <Contests />;
        default: return <Dashboard />;
      }
    })();

    return (
      <div key={currentView} className="w-full">
        {View}
      </div>
    );
  };

  return (
    <>
      <div className="h-dvh w-full bg-surface-secondary dark:bg-surface-dark-primary flex flex-col md:flex-row font-sans text-text-theme-primary dark:text-text-theme-dark-primary overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-surface-primary dark:bg-surface-dark-secondary border-r border-surface-secondary dark:border-surface-dark-elevated h-full z-40 p-4 shrink-0">
          {/* Logo */}
          <div className="px-2 py-4 mb-6 flex items-center justify-center">
            <img
              src={isDark ? "/logo-dark.png" : "/logo-light.png"}
              alt="YouTrack Logo"
              className="w-40 h-10 object-contain"
            />
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label={t('dashboard')} currentView={currentView} onNavigate={navigateTo} />
            <NavItem view="leaderboard" icon={Trophy} label={t('leaderboard')} currentView={currentView} onNavigate={navigateTo} />
            <NavItem view="lessons" icon={BookOpen} label={t('lessons')} currentView={currentView} onNavigate={navigateTo} />
            <NavItem view="contests" icon={Swords} label={t('contests')} currentView={currentView} onNavigate={navigateTo} />
            <NavItem view="rewards" icon={Gift} label={t('giftShop')} currentView={currentView} onNavigate={navigateTo} />
          </nav>

          {/* Sidebar Footer */}
          <div className="space-y-4 mt-4">
            <SidebarProgress />
            <div className="pt-4 border-t border-surface-secondary dark:border-surface-dark-elevated/50">
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
            className="flex-1 overflow-y-auto p-4 md:p-8 pt-[calc(5.5rem+env(safe-area-inset-top))] md:pt-8 pb-[calc(90px+env(safe-area-inset-bottom))] md:pb-8 custom-scrollbar bg-surface-secondary dark:bg-surface-dark-primary flex flex-col"
          >
            <div className="max-w-5xl mx-auto w-full flex-1 relative">
              {renderView()}
            </div>
          </main>

          {/* Bottom Nav (Mobile) */}
          <nav className="md:hidden absolute bottom-0 left-0 right-0 bg-surface-primary/90 dark:bg-surface-dark-secondary/90 backdrop-blur-2xl border-t border-surface-secondary dark:border-surface-dark-elevated pt-2 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.06)] transition-colors duration-300">
            <div className="flex justify-around items-center px-1">
              <NavItem view="dashboard" icon={LayoutDashboard} label={t('dashboard')} currentView={currentView} onNavigate={navigateTo} />
              <NavItem view="leaderboard" icon={Trophy} label={t('leaderboard')} currentView={currentView} onNavigate={navigateTo} />
              <NavItem view="lessons" icon={BookOpen} label={t('lessons')} currentView={currentView} onNavigate={navigateTo} />
              <NavItem view="contests" icon={Swords} label={t('contests')} currentView={currentView} onNavigate={navigateTo} />
              <NavItem view="rewards" icon={Gift} label={t('giftShop')} currentView={currentView} onNavigate={navigateTo} />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default App;
