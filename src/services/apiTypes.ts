
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestConfig {
    endpoint: string;
    method?: HttpMethod;
    data?: any;
    files?: File[];
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
}

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}

export interface ApiError {
    message: string;
    status?: number;
    statusText?: string;
    data?: any;
}

export interface StateConfig<T> {
    initialValue: T;
    onUpdate?: (newValue: T) => void;
    onError?: (error: ApiError) => void;
}

export interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
    lastUpdated: Date | null;
}

export type StateListener<T> = (state: ApiState<T>) => void;

// --- Lessons View Types ---

export interface AttendanceData {
    track_id: number;
    lesson_topic: string;
    number: number;
    opens_at: string;
    closes_at: string;
    status: 'attended' | 'absent' | null;
}

export interface AssignmentAttachment {
    name: string;
    link: string;
    size?: number;
    extension?: string;
    type?: 'file' | 'link' | 'image'; // adjusting based on usage
}

export interface AssignmentData {
    id: number;
    number: number;
    description: string;
    lesson_topic: string;
    start_datetime: string;
    deadline: string;
    attachments: AssignmentAttachment[];
}

export interface PreviousLesson {
    lesson_name: string;
    lesson_date: string;
    created_at: string;
    status: 'approved' | 'rejected' | 'awaiting_approval' | 'approval_time_exceeded' | null;
    teacher_comment?: string;
}

export interface LessonsResponse {
    success: boolean;
    data: {
        attendance: AttendanceData;
        assignment: AssignmentData | null;
        previous: PreviousLesson[];
    };
}

// --- Action Types ---

export interface MarkAttendanceResponse {
    success: boolean;
    data: {
        xp: number;
        coins: number;
        message: string;
    };
}

export interface AttachmentSubmission {
    type: 'file' | 'image' | 'link';
    name: string;
    url?: string;
}

export interface HomeworkSubmissionData {
    assignment_id: number;
    student_code: string;
    comment?: string;
    attachments?: AttachmentSubmission[];
    files?: File[];
}

export interface HomeworkSubmissionResponse {
    success: boolean;
    message: string;
    submission_id: number;
}

// --- Shop Types ---

export interface Reward {
    id: number;
    name: string;
    image: string | null;
    cost: number;
    claimed: boolean;
    description?: string;
}

export interface Transaction {
    datetime: string;
    reason: string;
    xp: number;
    coins: number;
    negative?: boolean;
}

export interface ShopData {
    rewards: Reward[];
    transactions: Transaction[];
}

export interface ShopResponse {
    success: boolean;
    data: ShopData;
}

export interface ClaimRewardResponse {
    success: boolean;
    message: string;
}

// --- Notification Types ---

export interface Notification {
    id: number;
    type: string;
    message_uz: string;
    message_en: string;
    scheduled_datetime: string;
    read: boolean;
}

export type NotificationsResponse = Notification[];
