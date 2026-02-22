import {
    ApiRequestConfig,
    ApiResponse,
    ApiError,
    ApiState,
    StateListener,
    HomeworkSubmissionData,
    HomeworkSubmissionResponse,
    LessonsResponse,
    MarkAttendanceResponse,
    ShopResponse,
    ClaimRewardResponse,
    NotificationsResponse,
} from './apiTypes';

class ApiService {
    private baseURL: string;
    private defaultHeaders: Record<string, string>;
    private states: Map<string, ApiState<any>>;
    private listeners: Map<string, Set<StateListener<any>>>;

    constructor(baseURL?: string) {
        this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
        const token = localStorage.getItem('authToken');
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        this.states = new Map();
        this.listeners = new Map();
    }

    /**
     * Set authorization token for authenticated requests
     */
    setAuthToken(token: string) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    /**
     * Remove authorization token
     */
    clearAuthToken() {
        delete this.defaultHeaders['Authorization'];
    }

    /**
     * Update base URL
     */
    setBaseURL(url: string) {
        this.baseURL = url;
    }

    /**
     * Build full URL with query parameters
     */
    private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
        const url = new URL(endpoint, this.baseURL);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, String(value));
            });
        }

        return url.toString();
    }

    /**
     * Create FormData for file uploads
     */
    private createFormData(data?: any, files?: File[], fileKey: string = 'files'): FormData {
        const formData = new FormData();

        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (typeof value === 'object') {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });
        }

        if (files && files.length > 0) {
            files.forEach((file) => {
                formData.append(fileKey, file);
            });
        }

        return formData;
    }

    /**
     * Make HTTP request
     */

    private async request<T>(config: ApiRequestConfig & { fileKey?: string }): Promise<ApiResponse<T>> {
        const { endpoint, method = 'GET', data, files, headers = {}, params, fileKey } = config;

        const url = this.buildURL(endpoint, params);
        const hasFiles = files && files.length > 0;

        const requestHeaders = { ...this.defaultHeaders, ...headers };

        // Remove Content-Type for FormData (browser will set it with boundary)
        if (hasFiles) {
            delete requestHeaders['Content-Type'];
        }

        const requestInit: RequestInit = {
            method,
            headers: requestHeaders,
        };

        // Add body for non-GET requests
        if (method !== 'GET' && (data || hasFiles)) {
            requestInit.body = hasFiles
                ? this.createFormData(data, files, fileKey)
                : JSON.stringify(data);
        }

        try {
            let response = await fetch(url, requestInit);

            if (response.status === 401) {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    try {
                        const refreshRes = await fetch(this.buildURL('/api/auth/token/refresh/'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refresh: refreshToken })
                        });
                        if (refreshRes.ok) {
                            const refreshData = await refreshRes.json();
                            this.setAuthToken(refreshData.access);
                            localStorage.setItem('authToken', refreshData.access);

                            // Retry original request
                            requestHeaders['Authorization'] = `Bearer ${refreshData.access}`;
                            requestInit.headers = requestHeaders;
                            response = await fetch(url, requestInit);
                        } else {
                            this.clearAuthToken();
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('refreshToken');
                            localStorage.setItem('isLogged', 'false');
                            window.location.reload();
                        }
                    } catch (e) {
                        // Let it fail normally
                    }
                } else {
                    this.clearAuthToken();
                    localStorage.removeItem('authToken');
                    localStorage.setItem('isLogged', 'false');
                    window.location.reload();
                }
            }

            // Parse response
            let responseData: T;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text() as any;
            }

            // Handle non-2xx responses
            if (!response.ok) {
                const error: ApiError = {
                    message: typeof responseData === 'string' ? responseData : 'Request failed',
                    status: response.status,
                    statusText: response.statusText,
                    data: responseData,
                };
                throw error;
            }

            return {
                data: responseData,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            };
        } catch (error: any) {
            // Handle network errors
            if (error.message && !error.status) {
                const apiError: ApiError = {
                    message: error.message || 'Network error occurred',
                    status: 0,
                    statusText: 'Network Error',
                };
                throw apiError;
            }
            throw error;
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
        return this.request<T>({ endpoint, method: 'GET', params });
    }

    /**
     * POST request
     */

    /**
     * POST request
     */
    async post<T>(endpoint: string, data?: any, files?: File[], fileKey?: string): Promise<ApiResponse<T>> {
        return this.request<T>({ endpoint, method: 'POST', data, files, fileKey });
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, data?: any, fileKey?: string): Promise<ApiResponse<T>> {
        return this.request<T>({ endpoint, method: 'PUT', data, fileKey });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>({ endpoint, method: 'DELETE' });
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>({ endpoint, method: 'PATCH', data });
    }

    /**
     * Initialize state for a specific key
     */
    private initializeState<T>(key: string, initialValue: T): void {
        if (!this.states.has(key)) {
            this.states.set(key, {
                data: initialValue,
                loading: false,
                error: null,
                lastUpdated: null,
            });
        }
    }

    /**
     * Update state and notify listeners
     */
    private updateState<T>(key: string, updates: Partial<ApiState<T>>): void {
        const currentState = this.states.get(key) || {
            data: null,
            loading: false,
            error: null,
            lastUpdated: null,
        };

        const newState = { ...currentState, ...updates };
        this.states.set(key, newState);

        // Notify listeners
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(listener => listener(newState));
        }
    }

    /**
     * Subscribe to state changes
     */
    subscribe<T>(key: string, listener: StateListener<T>): () => void {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }

        this.listeners.get(key)!.add(listener);

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.delete(listener);
            }
        };
    }

    /**
     * Get current state
     */
    getState<T>(key: string): ApiState<T> | null {
        return this.states.get(key) || null;
    }

    /**
     * Fetch data and store in state
     */
    async fetchAndStore<T>(
        key: string,
        endpoint: string,
        params?: Record<string, string | number | boolean>,
        initialValue?: T
    ): Promise<T> {
        // Initialize state if needed
        if (initialValue !== undefined) {
            this.initializeState(key, initialValue);
        }

        // Set loading state
        this.updateState(key, { loading: true, error: null });

        try {
            const response = await this.get<T>(endpoint, params);

            // Update state with data
            this.updateState(key, {
                data: response.data,
                loading: false,
                error: null,
                lastUpdated: new Date(),
            });

            return response.data;
        } catch (error: any) {
            const apiError: ApiError = {
                message: error.message || 'Failed to fetch data',
                status: error.status,
                statusText: error.statusText,
                data: error.data,
            };

            // Update state with error
            this.updateState(key, {
                loading: false,
                error: apiError,
            });

            throw apiError;
        }
    }

    /**
     * Post data and update state
     */
    async postAndStore<T>(
        key: string,
        endpoint: string,
        data?: any,
        files?: File[],
        initialValue?: T
    ): Promise<T> {
        // Initialize state if needed
        if (initialValue !== undefined) {
            this.initializeState(key, initialValue);
        }

        // Set loading state
        this.updateState(key, { loading: true, error: null });

        try {
            const response = await this.post<T>(endpoint, data, files);

            // Update state with data
            this.updateState(key, {
                data: response.data,
                loading: false,
                error: null,
                lastUpdated: new Date(),
            });

            return response.data;
        } catch (error: any) {
            const apiError: ApiError = {
                message: error.message || 'Failed to post data',
                status: error.status,
                statusText: error.statusText,
                data: error.data,
            };

            // Update state with error
            this.updateState(key, {
                loading: false,
                error: apiError,
            });

            throw apiError;
        }
    }

    /**
     * Submit homework with optional files
     */
    /**
     * Get Lessons Data
     */
    async getLessons(): Promise<LessonsResponse> {
        return (await this.post<LessonsResponse>('/api/lessons/')).data;
    }

    /**
     * Get Lessons Data and store in state
     */
    async getLessonsAndStore(key: string): Promise<LessonsResponse> {
        return this.postAndStore<LessonsResponse>(key, '/api/lessons/');
    }

    /**
     * Mark Attendance
     */
    async markAttendance(data: { track_id: number; keyword: string }): Promise<MarkAttendanceResponse> {
        return (await this.post<MarkAttendanceResponse>('/api/attendance/mark/', data)).data;
    }

    /**
     * Submit homework with optional files
     */
    async submitHomework(
        data: HomeworkSubmissionData
    ): Promise<HomeworkSubmissionResponse> {
        // Prepare plain data object for FormData creation
        // We separate files from the rest of the data because creaetFormData handles them specifically
        const { files, attachments, ...restData } = data;

        // Ensure attachments are serialized properly if they exist
        const payload: any = { ...restData };

        if (attachments) {
            payload.attachments = attachments; // The createFormData method in this class stringifies objects, which is what we want for 'attachments'
        }


        const response = await this.post<HomeworkSubmissionResponse>(
            '/api/bot/submit-assignment/',
            payload,
            files,
            'files' // The API expects 'files' as the key for multiple files
        );

        return response.data;
    }

    /**
     * Submit homework and store in state
     */
    async submitHomeworkAndStore(
        key: string,
        data: HomeworkSubmissionData
    ): Promise<HomeworkSubmissionResponse> {
        const { files, attachments, ...restData } = data;
        const payload: any = { ...restData };
        if (attachments) {
            payload.attachments = attachments;
        }

        return this.postAndStore<HomeworkSubmissionResponse>(
            key,
            '/api/bot/submit-assignment/',
            payload,
            files
        );
    }

    /**
     * Get Shop Data
     */
    async getShop(): Promise<ShopResponse> {
        return (await this.post<ShopResponse>('/api/shop/')).data;
    }

    /**
     * Claim Reward
     */
    async claimReward(rewardId: number): Promise<ClaimRewardResponse> {
        return (await this.post<ClaimRewardResponse>('/api/claim-reward/', { reward_id: rewardId })).data;
    }

    /**
     * Get Notifications
     */
    async getNotifications(): Promise<NotificationsResponse> {
        return (await this.post<NotificationsResponse>('/api/notifications/')).data;
    }

    /**
     * Mark Notification as Read
     */
    async markNotificationAsRead(notificationId: number): Promise<void> {
        await this.post('/api/notifications/mark-read/', { notification_id: notificationId });
    }

    /**
     * Clear state for a specific key
     */
    clearState(key: string): void {
        this.states.delete(key);
    }

    /**
     * Clear all states
     */
    clearAllStates(): void {
        this.states.clear();
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default ApiService;
