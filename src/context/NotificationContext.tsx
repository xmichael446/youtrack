import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/ApiService';
import { Notification } from '../services/apiTypes';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // We get studentCode from localStorage as it's the most reliable source for the logged-in user identifier
    const studentCode = localStorage.getItem('studentCode');

    const fetchNotifications = useCallback(async () => {
        if (!studentCode) return;

        // Don't set loading to true if we already have notifications (background refresh)
        if (notifications.length === 0) {
            setLoading(true);
        }

        try {
            const data = await apiService.getNotifications(studentCode);
            // Ensure data is array
            if (Array.isArray(data)) {
                // Sort by ID descending (newest first) or date? 
                // The example JSON has IDs 42, 43, 44, 45 with scheduled_datetime increasing.
                // Usually notifications are newest first.
                // Let's sort by scheduled_datetime descending.
                const sorted = [...data].sort((a, b) =>
                    new Date(b.scheduled_datetime).getTime() - new Date(a.scheduled_datetime).getTime()
                );
                setNotifications(sorted);
            } else {
                console.error("Notifications data is not an array:", data);
                setNotifications([]);
            }
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch notifications:", err);
            setError(err.message || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, [studentCode]);

    useEffect(() => {
        fetchNotifications();
        // Optional: Set up polling every minute to check for new notifications
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: number) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            await apiService.markNotificationAsRead(id);
        } catch (err) {
            console.error("Failed to mark notification read", err);
            // Revert not implemented for simplicity, usually harmless if it fails silently
        }
    };

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.read);
        if (unread.length === 0) return;

        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        try {
            // Send requests in parallel
            await Promise.all(unread.map(n => apiService.markNotificationAsRead(n.id)));
        } catch (err) {
            console.error("Failed to mark all read", err);
            fetchNotifications(); // Re-fetch to sync truth
        }
    };

    const value = {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    };

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
