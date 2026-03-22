export interface CompactLevelInfo {
    id: number;
    name: string;
    icon: string;
}

export interface QuizOption {
    id: number;
    content: string;
    is_correct?: boolean;
}

export interface QuizQuestion {
    id: number;
    question_text: string;
    options: QuizOption[];
    explanation?: string;
    vocab_level?: number;
    source_text?: string;
}

export interface QuizQuestionResult extends QuizQuestion {
    selected_option_id: number | null;
    is_correct: boolean;
}

// --- Contest Types ---

export type ContestStatus = 'scheduled' | 'open' | 'closed' | 'finalized';

export interface ContestListItem {
    id: number;
    number: number;
    status: ContestStatus;
    scheduled_start: string;
    scheduled_end: string;
    question_count: number;
    registration_count: number;
    is_registered: boolean;
}

export interface ContestListResponse {
    success: boolean;
    data: ContestListItem[];
}

export interface ContestPrize {
    place: number;
    reward_name: string;
    reward_description: string;
    xp: number;
    coins: number;
}

export interface ContestRegistration {
    id: number;
    full_name: string;
    avatar: string | null;
    rank: number;
    xp: number;
    level: CompactLevelInfo | null;
}

export interface ContestWinner {
    place: number;
    id: number;
    name: string;
    avatar: string | null;
    score: number;
    total: number;
    reward_name: string | null;
    xp: number | null;
    coins: number | null;
}

export interface ContestDetailData {
    id: number;
    number: number;
    status: ContestStatus;
    scheduled_start: string;
    scheduled_end: string;
    question_count: number;
    registration_count: number;
    is_registered: boolean;
    prizes: ContestPrize[];
    winners: ContestWinner[];
    registrations: ContestRegistration[];
}

export interface ContestDetailResponse {
    success: boolean;
    data: ContestDetailData;
}

export interface ContestRegisterResponse {
    success: boolean;
    message: string;
    registration_count: number;
}

export interface ContestStartResponse {
    success: boolean;
    contest_end_time: string;
    questions: QuizQuestion[];
}

export interface ContestAnswer {
    question_id: number;
    option_id: number;
}

export interface ContestSubmission {
    contest_id: number;
    answers: ContestAnswer[];
}

export interface ContestSubmitResponse {
    success: boolean;
    score: number;
    total: number;
    submitted_at: string;
}

export interface ContestLeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    total: number;
    submitted_at: string;
    prize?: ContestPrize | null;
    enrollment_id?: number; // fallback for navigation if id is not present
    id?: number;
}

export interface ContestLiveLeaderboardResponse {
    success: boolean;
    contest_id: number;
    status: ContestStatus;
    leaderboard: ContestLeaderboardEntry[];
    my_rank: number | null;
    my_score: number | null;
}

export interface ContestMyAttempt {
    attempt_id: number;
    score: number;
    total: number;
    submitted_at: string;
    prize_awarded: boolean;
    rank?: number; // Frontend might compute this or it might be in some versions of API
    prize?: ContestPrize | null;
    answers: QuizQuestionResult[];
}

export interface ContestResultsData {
    success: boolean;
    leaderboard: ContestLeaderboardEntry[];
    my_attempt: ContestMyAttempt | null;
}

export interface ContestResultsResponse {
    success: boolean;
    data: ContestResultsData;
}

export interface AssignmentData {
    id: number;
    number: number;
    lesson_topic: string;
    description?: string;
    deadline: string;
    start_datetime: string;
    status: string;
    submissions: any[];
    is_expired: boolean;
    is_overdue: boolean;
    attachments?: { type: 'link' | 'file'; name: string; link?: string; url?: string; size?: number }[];
    quiz?: QuizSessionData | null;
}

export interface AttendanceData {
    id: number;
    number?: number;
    lesson_topic?: string;
    date: string;
    status: string;
    track_id: number;
    keyword?: string;
    opens_at?: string;
    closes_at?: string;
}

export interface HomeworkSubmissionData {
    assignment_id: number;
    comment?: string;
    files?: File[];
    attachments?: any[];
}

export interface HomeworkSubmissionResponse {
    success: boolean;
    message: string;
}

export interface LessonsResponse {
    success: boolean;
    data: any;
}

export interface MarkAttendanceResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface ShopResponse {
    success: boolean;
    data: any;
}

export interface ClaimRewardResponse {
    success: boolean;
    message: string;
}

export interface BalanceReward {
    id: number;
    name: string;
    description: string;
    cost: number;
    image: string | null;
    claimed: boolean;
}

export interface LevelReward {
    id: number;
    name: string;
    description: string;
    required_level: {
        number: number;
        name: string;
        icon: string;
        badge_color: string;
    };
    image: string | null;
    granted: boolean;
    unlocked: boolean;
}

export interface NotificationsResponse {
    success: boolean;
    data: any[];
}

export interface QuizSessionData {
    session_id: number;
    question_count: number;
    passing_score: number | null;
    already_awarded: boolean;
    has_reviewed: boolean;
    previous_attempts: any[];
}

export interface QuizQuestionsData {
    questions: QuizQuestion[];
    source_text?: string;
    vocab_level?: number;
}

export interface QuizQuestionsResponse {
    success: boolean;
    data: QuizQuestionsData;
}

export interface QuizSubmitResponseData {
    score: number;
    total: number;
    passed: boolean;
    points_awarded: boolean;
    xp: number;
    coins: number;
    passing_score: number;
    already_awarded: boolean;
    attempt_id: number;
}

export interface QuizSubmitResponse {
    success: boolean;
    data: QuizSubmitResponseData;
}

export interface QuizReviewResponse {
    success: boolean;
    data: {
        answers: QuizQuestionResult[];
    };
}

export interface QuizSubmission {
    session_id: number;
    answers: {
        question_id: number;
        option_id: number;
    }[];
}

export interface Achievement {
    key: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    achieved: boolean;
    earned_at: string | null;
}

export interface ContestBadge {
    id: number;
    contest_number: number;
    contest_name: string;
    place: number;
    reward_name: string;
    reward_image: string | null;
    earned_at: string;
}

export interface ProfileData {
    full_name: string;
    avatar: string | null;
    bio: string | null;
    group_name: string;
    course_name: string;
    rank: number;
    streak: number;
    level: {
        number: number;
        name: string;
        icon: string;
        xp_current: number;
        xp_next: number;
        progress_percent: number;
        badge_color: string;
    };
    stats: {
        attendance_pct?: number;
        assignment_pct?: number;
        balance?: number;
        total_points: number;
    };
    achievements: Achievement[];
    contest_badges: ContestBadge[];
    is_own_profile: boolean;
    privacy: {
        hide_balance: boolean;
        hide_activity: boolean;
    };
}

export interface ProfileResponse {
    success: boolean;
    data: ProfileData;
}

export interface ActivityEntry {
    xp: number;
    coins: number;
    reason: string;
    datetime: string;
    negative: boolean;
}

export interface ActivityResponse {
    success: boolean;
    data: {
        entries: ActivityEntry[];
        has_next: boolean;
    };
}

export interface HeatmapEntry {
    date: string;
    count: number;
}

export interface HeatmapResponse {
    success: boolean;
    data: HeatmapEntry[];
}

export interface ApiRequestConfig {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    params?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
    files?: File[];
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}

export interface ApiError {
    message: string;
    status: number;
    statusText: string;
    data?: any;
}

export interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
    lastUpdated: Date | null;
}

export type StateListener<T> = (state: ApiState<T>) => void;

