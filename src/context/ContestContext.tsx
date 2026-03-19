import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiService } from '../services/ApiService';
import { ContestListItem, ContestDetailData, ContestStartResponse, ContestSubmitResponse, ContestResultsData, ContestLeaderboardEntry } from '../services/apiTypes';

interface ContestContextType {
    contests: ContestListItem[];
    loading: boolean;
    error: string | null;
    fetchContests: () => Promise<void>;
    getContestDetail: (contestId: number) => Promise<ContestDetailData>;
    registerForContest: (contestId: number) => Promise<{ message: string; registration_count: number }>;
    startContest: (contestId: number) => Promise<ContestStartResponse>;
    submitContest: (contestId: number, answers: { question_id: number; option_id: number }[]) => Promise<ContestSubmitResponse>;
    getContestResults: (contestId: number) => Promise<ContestResultsData>;
    getContestLeaderboard: (contestId: number) => Promise<ContestLeaderboardEntry[]>;
}

const ContestContext = createContext<ContestContextType | undefined>(undefined);

export const ContestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [contests, setContests] = useState<ContestListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiService.getContestList();
            setContests(res.data ?? []);
        } catch (err: any) {
            setError(err.message || 'Failed to load contests');
        } finally {
            setLoading(false);
        }
    }, []);

    const getContestDetail = useCallback(async (contestId: number): Promise<ContestDetailData> => {
        const res = await apiService.getContestDetail(contestId);
        return res.data;
    }, []);

    const registerForContest = useCallback(async (contestId: number) => {
        const res = await apiService.registerForContest(contestId);
        // Optimistically update the list
        setContests(prev => prev.map(c =>
            c.id === contestId
                ? { ...c, is_registered: true, registration_count: res.registration_count }
                : c
        ));
        return { message: res.message, registration_count: res.registration_count };
    }, []);

    const startContest = useCallback(async (contestId: number): Promise<ContestStartResponse> => {
        return apiService.startContest(contestId);
    }, []);

    const submitContest = useCallback(async (contestId: number, answers: { question_id: number; option_id: number }[]): Promise<ContestSubmitResponse> => {
        return apiService.submitContest({ contest_id: contestId, answers });
    }, []);

    const getContestResults = useCallback(async (contestId: number): Promise<ContestResultsData> => {
        const res = await apiService.getContestResults(contestId);
        return res.data;
    }, []);

    const getContestLeaderboard = useCallback(async (contestId: number): Promise<ContestLeaderboardEntry[]> => {
        return apiService.getContestLeaderboard(contestId);
    }, []);

    return (
        <ContestContext.Provider value={{
            contests,
            loading,
            error,
            fetchContests,
            getContestDetail,
            registerForContest,
            startContest,
            submitContest,
            getContestResults,
            getContestLeaderboard,
        }}>
            {children}
        </ContestContext.Provider>
    );
};

export const useContests = () => {
    const ctx = useContext(ContestContext);
    if (!ctx) throw new Error('useContests must be used within ContestProvider');
    return ctx;
};
