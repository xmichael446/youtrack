
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';
import {
    LessonsResponse,
    MarkAttendanceResponse,
    HomeworkSubmissionData,
    ApiError,
    QuizResponse,
    QuizSubmission,
    QuizSubmitResponse,
    QuizQuestionsResponse,
    QuizReviewResponse
} from '../services/apiTypes';

interface LessonsContextType {
    lessonsData: LessonsResponse['data'] | null;
    loading: boolean;
    error: string | null;
    fetchLessons: () => Promise<void>;
    markAttendance: (keyword: string) => Promise<MarkAttendanceResponse>;
    submitAssignment: (data: Omit<HomeworkSubmissionData, 'assignment_id' | 'student_code'>, assignmentId?: number) => Promise<void>;
    getQuizQuestions: (sessionId: number) => Promise<QuizQuestionsResponse>;
    getQuizReview: (attemptId: number) => Promise<QuizReviewResponse>;
    submitQuiz: (data: QuizSubmission) => Promise<QuizSubmitResponse>;
}

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

export const LessonsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lessonsData, setLessonsData] = useState<LessonsResponse['data'] | null>(null);
    const [loading, setLoading] = useState(true);
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

    const submitAssignment = async (data: Omit<HomeworkSubmissionData, 'assignment_id'>, assignmentId?: number) => {
        const idToSubmit = assignmentId || lessonsData?.assignments?.current?.id;
        
        if (!idToSubmit) {
            throw new Error("Missing assignment data");
        }

        try {
            await apiService.submitHomework({
                assignment_id: idToSubmit,
                ...data
            });

            // Refresh lessons data after successful submission
            await fetchLessons();
        } catch (err: any) {
            const msg = err.data?.message || err.message || "Failed to submit homework";
            throw new Error(msg);
        }
    };

    const getQuizQuestions = async (sessionId: number): Promise<QuizQuestionsResponse> => {
        try {
            return await apiService.getQuizQuestions(sessionId);
        } catch (err: any) {
            const msg = err.data?.message || err.message || "Failed to load quiz questions";
            throw new Error(msg);
        }
    };

    const getQuizReview = async (attemptId: number): Promise<QuizReviewResponse> => {
        try {
            return await apiService.getQuizReview(attemptId);
        } catch (err: any) {
            const msg = err.data?.message || err.message || "Failed to load quiz review";
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
        getQuizQuestions,
        getQuizReview,
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
