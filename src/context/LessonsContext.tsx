
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';
import {
    LessonsResponse,
    MarkAttendanceResponse,
    HomeworkSubmissionData,
    ApiError,
    QuizResponse,
    QuizSubmission,
    QuizSubmitResponse
} from '../services/apiTypes';

interface LessonsContextType {
    lessonsData: LessonsResponse['data'] | null;
    loading: boolean;
    error: string | null;
    fetchLessons: () => Promise<void>;
    markAttendance: (keyword: string) => Promise<MarkAttendanceResponse>;
    submitAssignment: (data: Omit<HomeworkSubmissionData, 'assignment_id' | 'student_code'>) => Promise<void>;
    getQuiz: (lessonId: number) => Promise<QuizResponse>;
    submitQuiz: (data: QuizSubmission) => Promise<QuizSubmitResponse>;
}

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

export const LessonsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lessonsData, setLessonsData] = useState<LessonsResponse['data'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);



    const fetchLessons = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getLessons();
            if (response.success) {
                setLessonsData(response.data ?? { attendance: null as any, assignments: null as any });
            } else {
                setError("Failed to load lessons data");
            }
        } catch (err: any) {
            console.error("Failed to fetch lessons:", err);
            setError(err.message || "Failed to load lessons");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchLessons();
    }, []);

    const markAttendance = async (keyword: string): Promise<MarkAttendanceResponse> => {
        if (!lessonsData?.attendance) {
            throw new Error("Missing attendance data");
        }

        try {
            const response = await apiService.markAttendance({
                track_id: lessonsData.attendance.track_id,
                keyword
            });

            // Refresh lessons data after successful attendance
            if (response.success) {
                await fetchLessons();
            }

            return response;
        } catch (err: any) {
            const msg = err.data?.message || err.message || "Failed to mark attendance";
            throw new Error(msg);
        }
    };

    const submitAssignment = async (data: Omit<HomeworkSubmissionData, 'assignment_id'>) => {
        if (!lessonsData?.assignments?.current) {
            throw new Error("Missing assignment data");
        }

        try {
            await apiService.submitHomework({
                assignment_id: lessonsData.assignments.current.id,
                ...data
            });

            // Refresh lessons data after successful submission
            await fetchLessons();
        } catch (err: any) {
            const msg = err.data?.message || err.message || "Failed to submit homework";
            throw new Error(msg);
        }
    };

    const getQuiz = async (lessonId: number): Promise<QuizResponse> => {
        try {
            return await apiService.getQuiz(lessonId);
        } catch (err: any) {
            const msg = err.data?.message || err.message || "Failed to load quiz";
            throw new Error(msg);
        }
    };

    const submitQuiz = async (data: QuizSubmission): Promise<QuizSubmitResponse> => {
        try {
            const response = await apiService.submitQuiz(data);
            return response;
        } catch (err: any) {
            const msg = err.data?.message || err.message || "Failed to submit quiz";
            throw new Error(msg);
        }
    };

    const value: LessonsContextType = {
        lessonsData,
        loading,
        error,
        fetchLessons,
        markAttendance,
        submitAssignment,
        getQuiz,
        submitQuiz
    };

    return <LessonsContext.Provider value={value}>{children}</LessonsContext.Provider>;
};

export const useLessons = () => {
    const context = useContext(LessonsContext);
    if (context === undefined) {
        throw new Error('useLessons must be used within a LessonsProvider');
    }
    return context;
};
