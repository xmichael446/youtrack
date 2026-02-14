import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePost } from '../services/useApi';
import { CURRENT_USER } from '../constants';
import { ApiError } from '../services/apiTypes';

interface Lesson {
    id: number;
    number: number;
    topic: string;
    start_datetime: string;
    duration: string;
    status: 'attended' | 'absent' | null;
}

interface Teacher {
    name: string;
    image: string;
    channel_link: string;
}

interface DashboardData {
    success: boolean;
    data: {
        enrollment: {
            id: number;
            full_name: string;
            total_points: number;
            balance: number;
            rank: number;
            last_rank: number;
            access_code: string;
            course: {
                name: string;
                description: string;
                logo: string;
                teachers: Teacher[];
                days: {
                    passed: number;
                    total: number;
                };
                attendance: {
                    percentage: number;
                    marked: number;
                    due: number;
                    total: number;
                };
                assignments: {
                    percentage: number;
                    approved: number;
                    due: number;
                    total: number;
                };
                completion: number;
            };
            curriculum: Lesson[];
            upcoming_lesson?: {
                id: number;
                number: number;
                topic: string;
                starts: string;
            };
        };
    };
}

interface DashboardContextType {
    // Raw API data
    enrollment: DashboardData['data']['enrollment'] | null;
    loading: boolean;
    error: ApiError | null;
    refetch: () => void;

    // Computed user data
    user: {
        id: number;
        name: string;
        coins: number;
        xp: number;
        avatar: string;
        rank: number;
        accessCode: string;
    };

    // Computed course data
    course: {
        name: string;
        description: string;
        logo: string;
        completion: number;
        daysPassed: number;
        daysTotal: number;
        attendancePercentage: number;
        attendanceMarked: number;
        attendanceTotal: number;
        attendanceDue: number;
        assignmentsApproved: number;
        assignmentsTotal: number;
        assignmentsDue: number;
        teachers: Teacher[];
    };

    // Upcoming lesson
    upcomingLesson: DashboardData['data']['enrollment']['upcoming_lesson'] | null;

    // Curriculum
    curriculum: Lesson[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const studentCode = localStorage.getItem('studentCode') || '';
    const { data: dashboardData, loading, error, post } = usePost<DashboardData>(
        'dashboard-data',
        'api/dashboard/'
    );

    // Trigger POST request on mount
    useEffect(() => {
        if (studentCode) {
            post({ student_code: studentCode });
        }
    }, [studentCode, post]);

    // Extract enrollment data
    const enrollment = dashboardData?.data?.enrollment || null;
    const courseData = enrollment?.course;

    // Computed user data with fallbacks
    const user = {
        id: enrollment?.id,
        name: enrollment?.full_name,
        coins: enrollment?.balance,
        xp: enrollment?.total_points,
        avatar: CURRENT_USER.avatar,
        rank: enrollment?.rank,
        accessCode: enrollment?.access_code,
    };

    // Computed course data with fallbacks
    const course = {
        name: courseData?.name,
        description: courseData?.description,
        logo: courseData?.logo,
        completion: courseData?.completion,
        daysPassed: courseData?.days?.passed,
        daysTotal: courseData?.days?.total,
        attendancePercentage: courseData?.attendance?.percentage,
        attendanceMarked: courseData?.attendance?.marked || 0,
        attendanceTotal: courseData?.attendance?.total || 0,
        attendanceDue: courseData?.attendance?.due || 0,
        assignmentsApproved: courseData?.assignments?.approved || 0,
        assignmentsTotal: courseData?.assignments?.total || 0,
        assignmentsDue: courseData?.assignments?.due || 0,
        teachers: courseData?.teachers || [],
    };

    // Upcoming lesson
    const upcomingLesson = enrollment?.upcoming_lesson || null;

    // Curriculum
    const curriculum = enrollment?.curriculum || [];

    // Refetch function
    const refetch = () => {
        if (studentCode) {
            post({ student_code: studentCode });
        }
    };

    const value: DashboardContextType = {
        enrollment,
        // Ensure loading is true until we have data or an error
        loading: loading || (!enrollment && !error),
        error,
        refetch,
        user,
        course,
        upcomingLesson,
        curriculum,
    };

    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
