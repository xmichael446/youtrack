import React, { useState } from 'react';
import { ViewState } from './types';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Lessons from './pages/Lessons';
import { Rewards } from './pages/Rewards';
import Login from './pages/Login';
import Footer from './components/Footer';
import { LayoutDashboard, Trophy, BookOpen, Gift, LogOut } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { LeaderboardProvider } from './context/LeaderboardContext';
import { NotificationProvider } from './context/NotificationContext';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isLogged') === 'true';
  });

  React.useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} isDark={isDark} />;
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

// Separate component to access DashboardContext
const AppContent: React.FC<{
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  isDark: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
}> = ({ currentView, setCurrentView, isDark, toggleTheme, handleLogout }) => {
  const { t } = useLanguage();
  const { user } = useDashboard();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'leaderboard': return <Leaderboard />;
      case 'lessons': return <Lessons />;
      case 'rewards': return <Rewards />;
      default: return <Dashboard />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col md:flex-row items-center justify-center md:justify-start px-2 py-3 md:px-5 md:py-4 w-full md:w-auto rounded-[18px] transition-all duration-300 lg:duration-500 group relative
          ${currentView === view
          ? 'text-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 shadow-[0_4px_20px_-10px_rgba(18,194,220,0.3)]'
          : 'text-gray-400 dark:text-slate-500 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-gray-50 dark:hover:bg-slate-800/50'
        }`}
    >
      <Icon className={`w-6 h-6 md:w-5 md:h-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${currentView === view ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(18,194,220,0.4)]' : ''}`} />
      <span className="text-[9px] md:text-sm font-black mt-1.5 md:mt-0 md:ml-4 tracking-wider uppercase md:capitalize lg:tracking-normal">{label}</span>
      {currentView === view && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-primary rounded-full hidden md:block"></div>
      )}
    </button>
  );

  // Loading Screen Component
  const LoadingScreen = () => {
    const { loading } = useDashboard();

    if (!loading) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-brand-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-brand-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-bold text-gray-600 dark:text-slate-400 animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  };

  // Sidebar Progress Component
  const SidebarProgress = () => {
    const { course } = useDashboard();
    return (
      <div className="bg-slate-950 dark:bg-slate-800 rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/20 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">{t('overallProgress')}</p>
          <span className="text-[10px] font-black text-white/50">{course?.completion || 0}%</span>
        </div>
        <p className="font-black text-lg leading-tight mb-4">{course?.name || 'Loading...'}</p>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-brand-primary shadow-[0_0_10px_rgba(18,194,220,0.5)]" style={{ width: `${course?.completion || 0}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <LeaderboardProvider accessCode={user?.accessCode} enrollmentId={user?.id}>
      <LoadingScreen />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-gray-900 dark:text-slate-100 transition-colors duration-300">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 h-screen sticky top-0 z-40 p-4 lg:p-6">
          <div className="px-2 py-4 mb-8 flex items-center justify-center">
            <img
              src={isDark ? "/logo-dark.png" : "/logo-light.png"}
              alt="YouTrack Logo"
              className="w-48 h-16 object-contain"
              onError={(e) => {
                // Fallback to generic logo
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>

          <div className="flex-1 space-y-2 md:space-y-3">
            <NavItem view="dashboard" icon={LayoutDashboard} label={t('dashboard')} />
            <NavItem view="leaderboard" icon={Trophy} label={t('leaderboard')} />
            <NavItem view="lessons" icon={BookOpen} label={t('lessons')} />
            <NavItem view="rewards" icon={Gift} label={t('giftShop')} />
          </div>

          <div className="space-y-4">
            <SidebarProgress />

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center md:justify-start px-5 py-4 rounded-[18px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 font-bold group"
            >
              <LogOut className="w-5 h-5 mr-4 group-hover:-translate-x-1 transition-transform" />
              {t('logout')}
            </button>

            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800/50">
              <Footer isDark={isDark} />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header isDark={isDark} toggleTheme={toggleTheme} onLogout={handleLogout} />

          <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8 pb-32 md:pb-8 custom-scrollbar scroll-smooth bg-gray-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
            <div className="max-w-5xl mx-auto w-full flex-1">
              {renderView()}
            </div>
          </main>
        </div>

        {/* Bottom Nav (Mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 pt-3 pb-safe z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_15px_rgba(0,0,0,0.2)] transition-colors duration-300">
          <div className="flex justify-around items-center p-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label={t('dashboard')} />
            <NavItem view="leaderboard" icon={Trophy} label={t('leaderboard')} />
            <NavItem view="lessons" icon={BookOpen} label={t('lessons')} />
            <NavItem view="rewards" icon={Gift} label={t('giftShop')} />
          </div>

          <Footer isDark={isDark} />
        </nav>
      </div>
    </LeaderboardProvider>
  );
};

export default App;