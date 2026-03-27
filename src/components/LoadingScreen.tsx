import React from 'react';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Syncing YouTrack' }) => {
    return (
        <div className="flex-1 w-full min-h-[60vh] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-[3px] border-brand-primary/10 rounded-full"></div>
                    <div className="absolute inset-0 border-[3px] border-transparent border-t-brand-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-[2px] border-transparent border-t-brand-primary/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
                </div>
                <p className="text-[10px] font-mono font-bold text-text-theme-muted dark:text-text-theme-dark-muted uppercase tracking-[5px] animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
