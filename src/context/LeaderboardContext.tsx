import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePost } from '../services/useApi';
import { ApiError } from '../services/apiTypes';

interface LeaderboardEntry {
    id?: number;
    rank: number;
    full_name: string;
    total_points: number;
    last_rank: number;
}

interface EnrollmentData {
    rank: number;
    week_points: number;
    total_points: number;
}

interface LeaderboardData {
    success: boolean;
    data: {
        enrollment: EnrollmentData;
        group: LeaderboardEntry[];
        course: LeaderboardEntry[];
    };
}

interface LeaderboardContextType {
    // Raw API data
    leaderboardData: LeaderboardData['data'] | null;
    loading: boolean;
    error: ApiError | null;
    refetch: () => void;

    // Enrollment data (constant across tabs)
    enrollment: EnrollmentData | null;

    // Computed data
    groupLeaderboard: LeaderboardEntry[];
    courseLeaderboard: LeaderboardEntry[];
    currentUserGroupEntry: LeaderboardEntry | null;
    currentUserCourseEntry: LeaderboardEntry | null;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export const LeaderboardProvider: React.FC<{
    children: React.ReactNode;
    accessCode?: string;
    enrollmentId?: number;
}> = ({ children, accessCode, enrollmentId }) => {
    const { data: leaderboardData, loading, error, post } = usePost<LeaderboardData>(
        'leaderboard-data',
        'api/leaderboard/'
    );

    // Trigger POST request when access code is available
    useEffect(() => {
        if (accessCode) {
            post({ student_code: accessCode });
        }
    }, [accessCode, post]);

    // Extract leaderboard data
    const data = leaderboardData?.data || null;
    const enrollment = data?.enrollment || null;
    const groupLeaderboard = data?.group || [];
    const courseLeaderboard = data?.course || [];

    // Find current user in leaderboards by matching enrollment ID
    const currentUserGroupEntry = groupLeaderboard.find(entry => entry.id === enrollmentId) || null;
    const currentUserCourseEntry = courseLeaderboard.find(entry => entry.id === enrollmentId) || null;

    // Refetch function
    const refetch = () => {
        if (accessCode) {
            post({ student_code: accessCode });
        }
    };

    const value: LeaderboardContextType = {
        leaderboardData: data,
        loading,
        error,
        refetch,
        enrollment,
        groupLeaderboard,
        courseLeaderboard,
        currentUserGroupEntry,
        currentUserCourseEntry,
    };

    return <LeaderboardContext.Provider value={value}>{children}</LeaderboardContext.Provider>;
};

export const useLeaderboard = () => {
    const context = useContext(LeaderboardContext);
    if (context === undefined) {
        throw new Error('useLeaderboard must be used within a LeaderboardProvider');
    }
    return context;
};
