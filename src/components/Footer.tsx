import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
    isDark: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDark }) => {
    const { t } = useLanguage();
    return (
        <div className="py-2 text-center animate-in fade-in duration-1000 delay-500 fill-mode-both">
            <p className={`text-[10px] md:text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('developedBy')}{' '}
                <a href="https://t.me/xmichael446" target="_blank" rel="noopener noreferrer" className="text-brand-primary font-black cursor-pointer hover:underline underline-offset-4">Michael</a>
            </p>
        </div>
    );
};

export default Footer;
