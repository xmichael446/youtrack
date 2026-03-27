import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
    isDark: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDark }) => {
    const { t } = useLanguage();
    return (
        <div className="py-2 text-center animate-in fade-in duration-1000 delay-500 fill-mode-both">
            <p className={`text-caption ${isDark ? 'text-text-theme-dark-muted' : 'text-text-theme-muted'}`}>
                {t('developedBy')}{' '}
                <a
                    href="https://t.me/xmichael446"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-brand-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-dark-primary focus-visible:rounded-sm"
                >
                    Michael
                </a>
            </p>
        </div>
    );
};

export default Footer;
