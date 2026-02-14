import React, { useState } from 'react';
import { User, LogIn } from 'lucide-react';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { useMutation } from '../services/useApi';
import { apiService } from '../services/ApiService';

interface LoginProps {
    onLogin: (code: string) => void;
    isDark: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isDark }) => {
    const { t, language } = useLanguage();
    const [studentCode, setStudentCode] = useState('');
    const { mutate: loginMutation, loading: isLoading, error: apiError } = useMutation<{ token: string; user: any }>('api/login/', 'POST');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentCode.trim()) {
            return;
        }

        try {
            const response = await loginMutation({ student_code: studentCode });

            // Store the auth token and student code
            if (response?.token) {
                apiService.setAuthToken(response.token);
                localStorage.setItem('authToken', response.token);
            }
            localStorage.setItem('studentCode', studentCode);

            // Call the onLogin callback
            onLogin(studentCode);
        } catch (error: any) {
            // Error is already handled by useMutation and stored in apiError
            console.error('Login failed:', error);
        }
    };

    const handleTelegramLogin = () => {
        // Placeholder for Telegram login logic
        console.log("Telegram login clicked");
    };

    return (
        <div className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-500 selection:bg-brand-primary/30 relative overflow-hidden font-sans ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'}`}>

            {/* Dynamic Premium Background */}
            <div className={`absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] animate-pulse transition-colors duration-1000 ${isDark ? 'bg-brand-primary/20' : 'bg-brand-primary/10'}`}></div>
            <div className={`absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] animate-pulse delay-700 transition-colors duration-1000 ${isDark ? 'bg-brand-primary/15' : 'bg-brand-primary/5'}`}></div>

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
                                                setStudentCode(e.target.value);
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

                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                                    <span className={`px-4 ${isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-gray-400'}`}>
                                        {t('orContinueWith')}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleTelegramLogin}
                                className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-base border-2 flex items-center justify-center transition-all duration-300 group ${isDark
                                    ? 'border-white/10 bg-white/5 hover:bg-[#229ED9]/10 hover:border-[#229ED9]/50 text-white'
                                    : 'border-gray-100 bg-white hover:bg-[#229ED9]/5 hover:border-[#229ED9]/50 text-slate-700'
                                    }`}
                            >
                                <svg className="w-6 h-6 mr-3 text-[#229ED9] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12.004 12.004 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                </svg>
                                <span className="group-hover:text-[#229ED9] transition-colors">{t('loginTelegram')}</span>
                            </button>

                            {/* Support Link */}
                            <div className="mt-6 md:mt-8 text-center relative z-10">
                                <a href="https://t.me/lr_intensive_admin" target="_blank" rel="noopener noreferrer" className={`text-[10px] font-bold uppercase tracking-[0.25em] transition-all hover:tracking-[0.3em] ${isDark ? 'text-slate-600 hover:text-brand-primary' : 'text-slate-400 hover:text-brand-primary'}`}>
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
