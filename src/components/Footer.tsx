import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
    isDark: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDark }) => {
    const { t } = useLanguage();
    return (
        <div className="py-2 text-center animate-in fade-in duration-1000 delay-500 fill-mode-both">
            <p className={`text-xs font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {t('developedBy')}{' '}
                <a
                    href="https://t.me/xmichael446"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-brand-accent transition-colors"
                >
                    Michael
                </a>
            </p>
        </div>
    );
};

export default Footer;
