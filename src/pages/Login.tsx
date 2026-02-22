import React, { useState, useEffect } from 'react';
import { User, LogIn } from 'lucide-react';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { useMutation } from '../services/useApi';
import { apiService } from '../services/ApiService';

interface LoginProps {
    onLogin: (code: string) => void;
    isDark: boolean;
    toggleTheme: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, isDark, toggleTheme }) => {
    const { t, language, setLanguage } = useLanguage();
    const [studentCode, setStudentCode] = useState('');
    const [authStep, setAuthStep] = useState<'login' | 'polling'>('login');
    const [authData, setAuthData] = useState<{ start_param: string, access_code: string, deep_link: string } | null>(null);

    const { mutate: loginMutation, loading: isLoginLoading, error: loginError } = useMutation<any>('api/login/', 'POST');
    const { mutate: initMutation, loading: isInitLoading, error: initError } = useMutation<any>('api/auth/init/', 'POST');

    const isLoading = isLoginLoading || isInitLoading;
    const apiError = loginError || initError;

    const startPolling = async (start_param: string, access_code: string) => {
        let isPolling = true;

        const poll = async () => {
            if (!isPolling) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/verify/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ start_param, access_code })
                });

                if (response.status === 408) {
                    // Timeout, keep polling
                    if (isPolling) setTimeout(poll, 1000);
                    return;
                }

                if (!response.ok) {
                    // Other error, restart
                    setAuthStep('login');
                    setAuthData(null);
                    return;
                }

                const data = await response.json();
                if (data.success && isPolling) {
                    apiService.setAuthToken(data.access);
                    localStorage.setItem('authToken', data.access);
                    localStorage.setItem('refreshToken', data.refresh);
                    localStorage.setItem('studentCode', access_code);
                    onLogin(access_code);
                }
            } catch (err) {
                // If network error, might want to stop or retry
                if (isPolling) setTimeout(poll, 2000);
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
                window.open(initResponse.deep_link, '_blank');
            }
        } catch (error: any) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-500 selection:bg-brand-primary/30 relative overflow-hidden font-sans ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>

            {/* Dynamic Premium Background */}
            <div className={`absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] animate-pulse transition-colors duration-1000 ${isDark ? 'bg-brand-primary/20' : 'bg-brand-primary/10'}`}></div>
            <div className={`absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] animate-pulse delay-700 transition-colors duration-1000 ${isDark ? 'bg-brand-primary/15' : 'bg-brand-primary/5'}`}></div>

            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 z-50 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-700">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`p-3 rounded-2xl transition-all duration-300 backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 ${isDark ? 'bg-slate-900/50 border border-white/10 text-yellow-400 hover:bg-slate-800/50' : 'bg-white/80 border border-white text-slate-600 hover:bg-white'}`}
                >
                    {isDark ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
                    )}
                </button>

                {/* Language Switcher */}
                <div className={`flex items-center p-1.5 rounded-2xl backdrop-blur-md shadow-lg border transition-colors duration-300 ${isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white/80 border-white'}`}>
                    <button
                        onClick={() => setLanguage('uz')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-300 ${language === 'uz' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        UZ
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all duration-300 ${language === 'en' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        EN
                    </button>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="w-full max-w-sm md:max-w-4xl z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
                <div className={`backdrop-blur-3xl border rounded-3xl md:rounded-5xl shadow-[0_32px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden group transition-all duration-500 ${isDark ? 'bg-slate-900/40 border-white/10' : 'bg-white/80 border-gray-200/50'}`}>

                    {/* Interactive Glow Grid */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.07] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row">
                        {/* Branding Section (Left/Top) */}
                        <div className="p-6 md:p-12 md:w-1/2 flex flex-col items-center justify-center text-center relative z-10 border-b md:border-b-0 md:border-r border-gray-200/10 dark:border-white/5">
                            {/* Scaled Logo Transition */}
                            <div className="mb-6 md:mb-10 flex justify-center transform transition-transform duration-700 hover:scale-105">
                                <img
                                    src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                                    alt="YouTrack Logo"
                                    className="h-14 md:h-28 object-contain drop-shadow-[0_8px_30px_rgba(18,194,220,0.2)]"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/logo.png';
                                    }}
                                />
                            </div>

                            <h4 className={`text-lg md:text-3xl font-black font-heading tracking-wider mb-2 md:mb-4 ${isDark ? 'text-white' : 'text-slate-950'}`}>
                                {t('loginYourSpace')!}
                            </h4>
                            <p className={`font-semibold text-base md:text-lg tracking-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {language === 'uz' ? (
                                    <><span className="text-brand-primary">YouTrack</span> {t('welcomeTo')}!</>
                                ) : (
                                    <>{t('welcomeTo')} <span className="text-brand-primary">YouTrack</span>!</>
                                )}
                            </p>
                        </div>

                        {/* Login Forms Section (Right/Bottom) */}
                        <div className="p-6 md:p-12 md:w-1/2 flex flex-col justify-center bg-white/5 dark:bg-black/20">
                            {authStep === 'login' && (
                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <div>
                                        <label className={`block text-[11px] font-bold uppercase tracking-[0.2em] mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {t('studentAccess')}
                                        </label>

                                        <div className="relative group/input">
                                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                <User className={`w-5 h-5 transition-all duration-300 ${isDark ? 'text-slate-600 group-focus-within/input:text-brand-primary' : 'text-slate-400 group-focus-within/input:text-brand-primary'}`} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder={t('enterStudentCode')}
                                                value={studentCode}
                                                onChange={(e) => {
                                                    const rawVal = e.target.value;
                                                    if (!rawVal) {
                                                        setStudentCode('');
                                                        return;
                                                    }

                                                    const numbersOnly = rawVal.replace(/[^0-9]/g, '');

                                                    if (numbersOnly) {
                                                        setStudentCode('YT-E' + numbersOnly.slice(0, 6));
                                                    } else {
                                                        if (rawVal === 'YT-E') {
                                                            setStudentCode('YT-E');
                                                        } else if (rawVal.startsWith('YT-E') && rawVal.length > 4) {
                                                            setStudentCode('YT-E');
                                                        } else {
                                                            setStudentCode('YT-E');
                                                        }
                                                    }
                                                }}
                                                className={`w-full border-2 text-sm md:text-base font-bold rounded-xl md:rounded-2xl pl-12 pr-4 py-3 md:py-4 focus:outline-none transition-all duration-300 ${isDark
                                                    ? 'bg-slate-950/50 border-white/5 text-white placeholder:text-slate-700 focus:border-brand-primary focus:bg-slate-900'
                                                    : 'bg-white border-gray-100 text-slate-950 placeholder:text-gray-400 focus:border-brand-primary focus:bg-white'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {apiError && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <p className="text-red-500 text-[11px] font-bold uppercase tracking-widest flex items-center bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                                {apiError.data?.message || apiError.message || t('pleaseEnterCode')}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-brand-primary text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-lg shadow-brand-primary/20 hover:bg-brand-accent hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center space-x-3">
                                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span className="text-sm uppercase tracking-widest font-bold">{t('verifying')}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="drop-shadow-sm">{t('enterDashboard')}</span>
                                                <LogIn className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {authStep === 'polling' && authData && (
                                <div className="space-y-6 relative z-10 flex flex-col items-center">
                                    <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className={`text-center font-bold px-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {language === 'uz' ? 'Tasdiqlash kutilmoqda...' : 'Waiting for confirmation...'}
                                    </p>
                                    <p className={`text-center text-sm px-4 mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {language === 'uz' ? 'Agarda bot avtomatik ochilmasa quyidagi o\'tish tugmasini bosing' : 'If the bot didn\'t open automatically, click the button below'}
                                    </p>
                                    <a
                                        href={authData.deep_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-[#2AABEE] text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-base shadow-lg shadow-[#2AABEE]/20 hover:bg-[#229ED9] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center uppercase tracking-wide"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                                        Open Telegram
                                    </a>
                                </div>
                            )}

                            {/* Support Link */}
                            <div className="mt-6 md:mt-8 text-center relative z-10">
                                <a href="https://t.me/lr_intensive_admin" target="_blank" rel="noopener noreferrer" className={`text-[10px] whitespace-pre-line font-bold uppercase tracking-[0.25em] transition-all hover:tracking-[0.3em] ${isDark ? 'text-slate-600 hover:text-brand-primary' : 'text-slate-400 hover:text-brand-primary'}`}>
                                    {t('helpSupport')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer isDark={isDark} />
            </div>
        </div>
    );
};

export default Login;
