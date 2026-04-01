import React, { useState, useEffect } from 'react';
import { User, LogIn, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { useMutation } from '../services/useApi';
import { apiService } from '../services/ApiService';
import { openTelegramLink } from '../utils/telegram';
import { Button, Input, Card } from '../components/ui';

interface LoginProps {
    onLogin: (code: string) => void;
    isDark: boolean;
    toggleTheme: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isDark, toggleTheme }) => {
    const { t, language, setLanguage } = useLanguage();
    const [studentCode, setStudentCode] = useState('');
    const [authStep, setAuthStep] = useState<'login' | 'polling'>('login');
    const [authData, setAuthData] = useState<{ start_param: string, access_code: string, deep_link: string } | null>(null);

    const { mutate: loginMutation, loading: isLoginLoading, error: loginError } = useMutation<any>('/api/login/', 'POST');
    const { mutate: initMutation, loading: isInitLoading, error: initError } = useMutation<any>('/api/auth/init/', 'POST');

    const isLoading = isLoginLoading || isInitLoading;
    const apiError = loginError || initError;

    const startPolling = async (start_param: string, access_code: string) => {
        let isPolling = true;

        const poll = async () => {
            if (!isPolling) return;

            try {
                const response = await apiService.post<any>('/api/auth/verify/', { start_param, access_code }, undefined, undefined);

                const data = response.data;
                if (data.success && isPolling) {
                    apiService.setAuthToken(data.access);
                    localStorage.setItem('authToken', data.access);
                    localStorage.setItem('refreshToken', data.refresh);
                    localStorage.setItem('studentCode', access_code);
                    onLogin(access_code);
                }
            } catch (err: any) {
                if (err.status === 408) {
                    if (isPolling) setTimeout(poll, 1000);
                    return;
                }

                setAuthStep('login');
                setAuthData(null);
            }
        };

        poll();

        return () => { isPolling = false; };
    };

    useEffect(() => {
        let cleanup: (() => void) | undefined;
        if (authStep === 'polling' && authData) {
            const cleanupFn = startPolling(authData.start_param, authData.access_code);
            cleanup = () => {
                cleanupFn.then(fn => fn && fn());
            };
        }
        return () => {
            if (cleanup) cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authStep, authData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentCode.trim()) {
            return;
        }

        try {
            await loginMutation({ student_code: studentCode });

            const initResponse = await initMutation({ access_code: studentCode });

            if (initResponse?.success) {
                setAuthData({
                    start_param: initResponse.start_param,
                    access_code: studentCode,
                    deep_link: initResponse.deep_link
                });
                setAuthStep('polling');
                openTelegramLink(initResponse.deep_link);
            }
        } catch (error: any) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className={`h-dvh w-full flex flex-col items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden font-sans ${isDark ? 'bg-surface-dark-primary text-text-theme-dark-primary' : 'bg-surface-secondary text-text-theme-primary'}`}>

            {/* Background Ambience */}
            <div className={`absolute top-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full blur-[160px] pointer-events-none transition-colors duration-1000 ${isDark ? 'bg-brand-primary/15' : 'bg-brand-primary/8'}`}></div>
            <div className={`absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full blur-[160px] pointer-events-none transition-colors duration-1000 ${isDark ? 'bg-brand-primary/10' : 'bg-brand-primary/5'}`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-violet-500/5' : 'bg-violet-500/3'}`}></div>

            {/* Top Controls */}
            <div className="absolute top-[calc(env(safe-area-inset-top)+1.25rem)] right-5 z-50 flex items-center gap-2 animate-in fade-in duration-500">
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-input transition-all duration-normal backdrop-blur-xl shadow-sm hover:scale-105 active:scale-95 ${isDark ? 'bg-surface-dark-secondary/60 text-yellow-400 hover:bg-surface-dark-elevated/60 border border-white/5' : 'bg-surface-primary/80 border border-surface-secondary/60 text-text-theme-secondary hover:bg-surface-primary'}`}
                >
                    {isDark ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
                    )}
                </button>

                <div className={`flex items-center p-1 rounded-input backdrop-blur-xl shadow-sm transition-colors duration-normal gap-0.5 ${isDark ? 'bg-surface-dark-secondary/60 border border-white/5' : 'bg-surface-primary/80 border border-surface-secondary/60'}`}>
                    {['uz', 'en'].map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang as 'uz' | 'en')}
                            className={`px-2 py-1 rounded-button text-[9px] tracking-widest transition-all duration-fast font-mono ${language === lang ? 'bg-brand-primary text-white shadow-sm' : 'text-text-theme-muted hover:text-text-theme-secondary dark:hover:text-text-theme-dark-secondary'}`}
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-sm md:max-w-4xl z-10 animate-in fade-in duration-700 ease-out">
                <Card
                    variant="elevated"
                    padding="none"
                    className={`backdrop-blur-2xl border md:rounded-[32px] shadow-2xl relative overflow-hidden transition-all duration-500 ${isDark ? 'bg-surface-dark-secondary/50 border-transparent shadow-black/40' : 'bg-surface-primary/85 border-surface-secondary/60 shadow-black/8'}`}
                >
                    {/* Subtle grid texture */}
                    <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                    <div className="flex flex-col md:flex-row">
                        {/* Branding Side */}
                        <div className={`p-6 md:p-12 md:w-1/2 flex flex-col items-center justify-center text-center relative z-10 border-b md:border-b-0 md:border-r ${isDark ? 'border-white/5' : 'border-surface-secondary/40'}`}>
                            <div className="mb-8 transform transition-transform duration-700 hover:scale-105">
                                <img
                                    src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                                    alt="YouTrack Logo"
                                    className="h-14 md:h-24 object-contain"
                                    style={{ filter: 'drop-shadow(0 8px 24px rgba(18,194,220,0.2))' }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/logo.png';
                                    }}
                                />
                            </div>

                            <h1 className={`text-h2 md:text-h1 tracking-tight mb-2 ${isDark ? 'text-text-theme-dark-primary' : 'text-text-theme-primary'}`}>
                                {t('loginYourSpace')}
                            </h1>
                            <p className={`text-body leading-relaxed ${isDark ? 'text-text-theme-dark-secondary' : 'text-text-theme-secondary'}`}>
                                {language === 'uz' ? (
                                    <><span className="text-brand-primary font-bold">YouTrack</span> {t('welcomeTo')}!</>
                                ) : (
                                    <>{t('welcomeTo')} <span className="text-brand-primary font-bold">YouTrack</span>!</>
                                )}
                            </p>
                        </div>

                        {/* Auth Section */}
                        <div className={`p-6 md:p-12 md:w-1/2 flex flex-col justify-center ${isDark ? 'bg-black/10' : 'bg-surface-primary/30'}`}>
                            {authStep === 'login' && (
                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <Input
                                        icon={<User className="w-[18px] h-[18px]" />}
                                        label={t('studentAccess')}
                                        size="lg"
                                        type="text"
                                        placeholder={t('enterStudentCode')}
                                        value={studentCode}
                                        onChange={(e) => setStudentCode(e.target.value)}
                                        className="font-mono"
                                        error={apiError ? (apiError.data?.message || apiError.message || t('pleaseEnterCode')) : undefined}
                                    />

                                    {apiError && (
                                        <div className="animate-in fade-in duration-fast -mt-3">
                                            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 py-3 px-4 rounded-card border border-red-500/20">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <p className="text-[11px] font-mono font-bold uppercase tracking-wider">
                                                    {apiError.data?.message || apiError.message || t('pleaseEnterCode')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        loading={isLoading}
                                        icon={<LogIn className="w-4 h-4" />}
                                        iconPosition="right"
                                        className="uppercase tracking-widest font-mono shadow-xl shadow-brand-primary/20 hover:shadow-brand-primary/35"
                                    >
                                        {isLoading ? t('verifying') : t('enterDashboard')}
                                    </Button>
                                </form>
                            )}

                            {authStep === 'polling' && authData && (
                                <div className="space-y-6 relative z-10 flex flex-col items-center py-4">
                                    {/* Animated spinner */}
                                    <div className="relative w-20 h-20">
                                        <div className={`absolute inset-0 rounded-full border-[3px] border-brand-primary/10`}></div>
                                        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-brand-primary animate-spin"></div>
                                        <div className="absolute inset-3 rounded-full border-[2px] border-transparent border-t-brand-primary/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className={`text-h4 ${isDark ? 'text-text-theme-dark-primary' : 'text-text-theme-primary'} tracking-tight`}>
                                            {t('waitingConfirmation')}
                                        </p>
                                        <p className={`text-body ${isDark ? 'text-text-theme-dark-secondary' : 'text-text-theme-secondary'} leading-relaxed`}>
                                            {t('botNotOpened')}
                                        </p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        fullWidth
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                                        }
                                        iconPosition="left"
                                        onClick={() => openTelegramLink(authData.deep_link)}
                                        className="bg-[#2AABEE] from-[#2AABEE] to-[#229ED9] shadow-xl shadow-[#2AABEE]/25 hover:shadow-[#2AABEE]/40 uppercase tracking-widest font-mono"
                                    >
                                        {t('openTelegram')}
                                    </Button>
                                </div>
                            )}

                            {/* Support */}
                            <div className="mt-6 text-center relative z-10">
                                <a
                                    href="https://t.me/lr_intensive_admin"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-caption font-mono uppercase tracking-[2px] whitespace-pre-line transition-colors hover:text-brand-primary ${isDark ? 'text-text-theme-dark-muted' : 'text-text-theme-muted'}`}
                                >
                                    {t('helpSupport')}
                                </a>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="mt-6">
                    <Footer isDark={isDark} />
                </div>
            </div>
        </div>
    );
};

export default Login;
