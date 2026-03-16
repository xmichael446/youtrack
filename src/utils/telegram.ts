declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initData: string;
                openTelegramLink: (url: string) => void;
                openLink: (url: string) => void;
            };
        };
    }
}

export function isTelegramWebApp(): boolean {
    return !!(window.Telegram?.WebApp?.initData);
}

/**
 * Opens a t.me deep link. Uses Telegram.WebApp.openTelegramLink() when
 * running inside a Telegram Mini App, otherwise falls back to window.open().
 */
export function openTelegramLink(url: string): void {
    if (isTelegramWebApp()) {
        window.Telegram!.WebApp!.openTelegramLink(url);
    } else {
        window.open(url, '_blank');
    }
}
