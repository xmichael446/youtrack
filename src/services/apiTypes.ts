
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
    status: 'attended' | 'absent' | 'marked' | null;
}

export interface AssignmentAttachment {
    name: string;
    link: string;
    size?: number;
    extension?: string;
    type?: 'file' | 'link' | 'image'; // adjusting based on usage
}

export interface SubmissionAttachment {
    name: string;
    link: string;
    size?: number;
    extension?: string;
}

export interface Submission {
    id: number;
    status: 'approved' | 'rejected' | 'pending' | 'submitted';
    student_comment?: string;
    teacher_comment?: string;
    created_at: string;
    attachments: SubmissionAttachment[];
}

export interface AssignmentData {
    id: number;
    number: number | string;
    description: string;
    lesson_topic: string;
    start_datetime: string;
    deadline: string;
    attachments: AssignmentAttachment[];
    submissions: Submission[];
    quiz?: QuizSessionData | null;
}

export interface AssignmentsData {
    current: AssignmentData | null;
    previous: AssignmentData[];
}

export interface LessonsResponse {
    success: boolean;
    data: {
        attendance: AttendanceData | null;
        assignments: AssignmentsData | null;
        quiz: QuizSessionData | null;
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
    comment?: string;
    attachments?: AttachmentSubmission[];
    files?: File[];
}

export interface HomeworkSubmissionResponse {
    success: boolean;
    message: string;
    submission_id: number;
}

// --- Level Types ---

export interface LevelInfo {
    number: number;
    name: string;
    icon: string;
    badge_color: string;
    description?: string;
    xp_current: number;
    xp_required: number;
    xp_next: number;
    progress_percent: number;
}

export interface CompactLevelInfo {
    number: number;
    name: string;
    icon: string;
    badge_color?: string;
}

// --- Shop Types ---

export interface BalanceReward {
    id: number;
    name: string;
    image: string | null;
    cost: number;
    claimed: boolean;
    description?: string;
}

export interface LevelReward {
    id: number;
    name: string;
    image: string | null;
    description?: string;
    required_level: CompactLevelInfo;
    unlocked: boolean;
    granted: boolean;
}

// Backward compat alias
export type Reward = BalanceReward;

export interface Transaction {
    datetime: string;
    reason: string;
    xp: number;
    coins: number;
    negative?: boolean;
}

export interface ShopData {
    balance_rewards: BalanceReward[];
    level_rewards: LevelReward[];
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

// --- Quiz Types ---

export interface QuizOption {
    id: number;
    content: string;
    is_correct?: boolean;
}

export interface QuizQuestion {
    id: number;
    word: string;
    question_text: string;
    options: QuizOption[];
}

export interface QuizAttempt {
    id: number;
    score: number;
    total: number;
    reviewed: boolean;
    points_awarded: boolean;
    created_at: string;
}

export interface QuizSessionData {
    session_id: number;
    vocab_level: string;
    passing_score: number;
    question_count: number;
    already_awarded: boolean;
    has_reviewed: boolean;
    previous_attempts: QuizAttempt[];
}

export interface QuizQuestionsData {
    session_id: number;
    vocab_level: string;
    passing_score: number;
    questions: QuizQuestion[];
    source_text?: string;  // text passage to read before quiz
}

export interface QuizQuestionsResponse {
    success: boolean;
    data: QuizQuestionsData;
}

export interface QuizResponse {
    success: boolean;
    data: QuizSessionData;
}

export interface QuizAnswer {
    question_id: number;
    option_id: number;
}

export interface QuizSubmission {
    session_id: number;
    answers: QuizAnswer[];
}

export interface QuizQuestionResult {
    question_id: number;
    word: string;
    question_text: string;
    options: QuizOption[];
    selected_option_id: number;
    is_correct: boolean;
    explanation: string;
}

export interface QuizSubmitResponseData {
    attempt_id: number;
    score: number;
    total: number;
    passing_score: number;
    passed: boolean;
    already_awarded: boolean;
    has_reviewed: boolean;
    points_awarded: boolean;
    xp: number;
    coins: number;
}

export interface QuizSubmitResponse {
    success: boolean;
    data: QuizSubmitResponseData;
}

export interface QuizReviewData {
    attempt_id: number;
    score: number;
    total: number;
    passing_score: number;
    passed: boolean;
    points_awarded: boolean;
    reviewed: boolean;
    answers: QuizQuestionResult[];
}

export interface QuizReviewResponse {
    success: boolean;
    data: QuizReviewData;
}
