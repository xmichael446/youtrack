import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/ApiService';
import { Reward, Transaction, ShopData } from '../services/apiTypes';

interface ShopContextType {
    rewards: Reward[];
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
    fetchShopData: () => Promise<void>;
    claimReward: (rewardId: number) => Promise<void>;
    refetch: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<ShopData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);



    const fetchShopData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.getShop();
            if (response.success) {
                setData(response.data);
            } else {
                setError("Failed to load shop data");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load shop data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShopData();
    }, [fetchShopData]);

    const claimReward = async (rewardId: number) => {
        try {
            const response = await apiService.claimReward(rewardId);
            if (response.success) {
                await fetchShopData(); // Refresh data to update claimed status
            } else {
                throw new Error(response.message || "Failed to claim reward");
            }
        } catch (err: any) {
            throw err;
        }
    };

    const value = {
        rewards: data?.rewards || [],
        transactions: data?.transactions || [],
        loading,
        error,
        fetchShopData,
        claimReward,
        refetch: fetchShopData
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error('useShop must be used within a ShopProvider');
    }
    return context;
};
