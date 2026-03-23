import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types/language';
import { UZ_TRANSLATIONS, EN_TRANSLATIONS } from '../constants/translations/index';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved === 'uz' || saved === 'en') ? saved : 'uz';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key: string, params?: Record<string, string | number>): string => {
        const translations = language === 'uz' ? UZ_TRANSLATIONS : EN_TRANSLATIONS;
        let text = (translations as any)[key] || key;
        
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.split(`{${k}}`).join(String(v));
            });
        }
        
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
