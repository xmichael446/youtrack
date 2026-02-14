
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';
import {
    LessonsResponse,
    MarkAttendanceResponse,
    HomeworkSubmissionData,
    ApiError
} from '../services/apiTypes';

interface LessonsContextType {
    lessonsData: LessonsResponse['data'] | null;
    loading: boolean;
    error: string | null;
    fetchLessons: () => Promise<void>;
    markAttendance: (keyword: string) => Promise<MarkAttendanceResponse>;
    submitAssignment: (data: Omit<HomeworkSubmissionData, 'assignment_id' | 'student_code'>) => Promise<void>;
}

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

export const LessonsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lessonsData, setLessonsData] = useState<LessonsResponse['data'] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get student code from local storage
    const studentCode = localStorage.getItem('studentCode') || '';

    const fetchLessons = async () => {
        if (!studentCode) {
            setError("Student code not found");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getLessons(studentCode);
            if (response.success && response.data) {
                setLessonsData(response.data);
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
        if (studentCode) {
            fetchLessons();
        }
    }, [studentCode]);

    const markAttendance = async (keyword: string): Promise<MarkAttendanceResponse> => {
        if (!studentCode || !lessonsData?.attendance) {
            throw new Error("Missing student code or attendance data");
        }

        try {
            const response = await apiService.markAttendance({
                student_code: studentCode,
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

    const submitAssignment = async (data: Omit<HomeworkSubmissionData, 'assignment_id' | 'student_code'>) => {
        if (!studentCode || !lessonsData?.assignment) {
            throw new Error("Missing student code or assignment data");
        }

        try {
            await apiService.submitHomework({
                assignment_id: lessonsData.assignment.id,
                student_code: studentCode,
                ...data
            });

            // Refresh lessons data after successful submission
            await fetchLessons();
        } catch (err: any) {
            const msg = err.data?.message || err.message || "Failed to submit homework";
            throw new Error(msg);
        }
    };

    const value: LessonsContextType = {
        lessonsData,
        loading,
        error,
        fetchLessons,
        markAttendance,
        submitAssignment
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
