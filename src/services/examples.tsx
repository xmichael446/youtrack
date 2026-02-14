
import React, { useState } from 'react';
import { apiService } from './ApiService';
import { useFetch, usePost, useHomeworkSubmission, useMutation } from './useApi';

// ============================================
// Example 1: Direct API Service Usage
// ============================================

export function DirectApiExample() {
    const [userData, setUserData] = useState(null);

    const fetchUserData = async () => {
        try {
            // Simple GET request
            const response = await apiService.get('/user/profile');
            setUserData(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const updateProfile = async (data: any) => {
        try {
            // POST request with data
            const response = await apiService.post('/user/profile', data);
            console.log('Profile updated:', response.data);
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    return (
        <div>
            <button onClick={fetchUserData}>Fetch User</button>
            <button onClick={() => updateProfile({ name: 'John Doe' })}>
                Update Profile
            </button>
        </div>
    );
}

// ============================================
// Example 2: Using State Management
// ============================================

export function StateManagementExample() {
    const fetchDashboard = async () => {
        try {
            // Fetch and store in state with key 'dashboard'
            const data = await apiService.fetchAndStore(
                'dashboard',
                '/dashboard',
                undefined,
                { enrollments: [], stats: {} } // initial value
            );
            console.log('Dashboard data:', data);
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        }
    };

    // Subscribe to state changes
    React.useEffect(() => {
        const unsubscribe = apiService.subscribe('dashboard', (state) => {
            console.log('Dashboard state updated:', state);
            // state.data - the actual data
            // state.loading - loading status
            // state.error - error if any
            // state.lastUpdated - timestamp of last update
        });

        return unsubscribe;
    }, []);

    return (
        <div>
            <button onClick={fetchDashboard}>Load Dashboard</button>
        </div>
    );
}

// ============================================
// Example 3: Using React Hooks (Recommended)
// ============================================

export function HooksExample() {
    // Auto-fetch on mount
    const { data, loading, error, refetch } = useFetch(
        'enrollments',
        '/enrollments',
        undefined,
        { initialValue: [], autoFetch: true }
    );

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h2>Enrollments</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            <button onClick={refetch}>Refresh</button>
        </div>
    );
}

// ============================================
// Example 4: Homework Submission with Files
// ============================================

export function HomeworkSubmissionExample() {
    const { data, loading, error, submit, reset } = useHomeworkSubmission();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        try {
            const result = await submit(
                1, // lessonId
                'Here is my homework submission', // comment
                selectedFiles // files
            );
            console.log('Submission successful:', result);
            alert('Homework submitted successfully!');
        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to submit homework');
        }
    };

    return (
        <div>
            <h2>Submit Homework</h2>
            <input type="file" multiple onChange={handleFileChange} />
            <button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Homework'}
            </button>
            {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}
            {data && <div style={{ color: 'green' }}>Submitted! Status: {data.status}</div>}
            <button onClick={reset}>Reset</button>
        </div>
    );
}

// ============================================
// Example 5: Using Mutation Hook
// ============================================

export function MutationExample() {
    const { data, loading, error, mutate } = useMutation('/lessons/enroll', 'POST');

    const enrollInLesson = async (lessonId: number) => {
        try {
            const result = await mutate({ lessonId });
            console.log('Enrolled:', result);
        } catch (error) {
            console.error('Enrollment failed:', error);
        }
    };

    return (
        <div>
            <button onClick={() => enrollInLesson(1)} disabled={loading}>
                {loading ? 'Enrolling...' : 'Enroll in Lesson'}
            </button>
            {error && <div>Error: {error.message}</div>}
            {data && <div>Success!</div>}
        </div>
    );
}

// ============================================
// Example 6: Manual POST with State
// ============================================

export function PostWithStateExample() {
    const { data, loading, error, post } = usePost('lesson-progress', '/lessons/progress');

    const updateProgress = async (lessonId: number, progress: number) => {
        try {
            await post({ lessonId, progress });
            console.log('Progress updated');
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    };

    return (
        <div>
            <button onClick={() => updateProgress(1, 75)} disabled={loading}>
                Update Progress
            </button>
            {loading && <div>Updating...</div>}
            {error && <div>Error: {error.message}</div>}
            {data && <div>Progress: {JSON.stringify(data)}</div>}
        </div>
    );
}

// ============================================
// Example 7: Authentication Setup
// ============================================

export function setupAuthentication(token: string) {
    // Set auth token for all future requests
    apiService.setAuthToken(token);
}

export function logout() {
    // Clear auth token
    apiService.clearAuthToken();
    // Clear all cached states
    apiService.clearAllStates();
}

// ============================================
// Example 8: Custom Base URL
// ============================================

export function setupCustomBaseURL() {
    // Change base URL (useful for different environments)
    apiService.setBaseURL('https://api.youtrack.com/v1');
}

// ============================================
// Example 9: Multiple State Updates
// ============================================

export function MultipleStateExample() {
    // Fetch multiple endpoints and store in different states
    const enrollments = useFetch('enrollments', '/enrollments', undefined, {
        initialValue: [],
        autoFetch: true,
    });

    const notifications = useFetch('notifications', '/notifications', undefined, {
        initialValue: [],
        autoFetch: true,
    });

    const rewards = useFetch('rewards', '/rewards', undefined, {
        initialValue: [],
        autoFetch: true,
    });

    return (
        <div>
            <h2>Dashboard</h2>

            <section>
                <h3>Enrollments</h3>
                {enrollments.loading && <div>Loading...</div>}
                {enrollments.error && <div>Error: {enrollments.error.message}</div>}
                {enrollments.data && <pre>{JSON.stringify(enrollments.data, null, 2)}</pre>}
            </section>

            <section>
                <h3>Notifications</h3>
                {notifications.loading && <div>Loading...</div>}
                {notifications.data && <div>Count: {notifications.data.length}</div>}
            </section>

            <section>
                <h3>Rewards</h3>
                {rewards.loading && <div>Loading...</div>}
                {rewards.data && <div>Available: {rewards.data.length}</div>}
            </section>
        </div>
    );
}

// ============================================
// Example 10: File Upload Only
// ============================================

export async function uploadFiles(files: File[]) {
    try {
        const response = await apiService.post('/upload', undefined, files);
        console.log('Files uploaded:', response.data);
        return response.data;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}
