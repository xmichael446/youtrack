
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
    enrollment_id: number;
    full_name: string;
    score: number;
    total: number;
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
    message: string;
}

export interface ContestLeaderboardEntry {
    rank: number;
    enrollment_id: number;
    full_name: string;
    score: number;
    total: number;
    submitted_at: string;
}

export interface ContestPrizeWon {
    place: number;
    reward_name: string;
}

export interface ContestMyAttempt {
    score: number;
    total: number;
    rank: number;
    submitted_at: string;
    prize: ContestPrizeWon | null;
    answers: QuizQuestionResult[];
}

export interface ContestResultsData {
    contest_id: number;
    number: number;
    leaderboard: ContestLeaderboardEntry[];
    my_attempt: ContestMyAttempt | null;
}

export interface ContestResultsResponse {
    success: boolean;
    data: ContestResultsData;
}

export interface ContestLiveLeaderboardResponse {
    success: boolean;
    data: ContestLeaderboardEntry[];
}

// --- Profile Types ---

export interface Achievement {
    key: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    earned_at: string | null;
}

export interface ProfilePrivacy {
    hide_balance: boolean;
    hide_activity: boolean;
}

export interface ProfileStats {
    attendance_pct?: number;
    assignment_pct?: number;
    total_points: number;
    balance: number | null;
}

export interface ProfileData {
    is_own_profile: boolean;
    full_name: string;
    avatar: string | null;
    bio: string;
    group_name: string;
    course_name: string;
    level: LevelInfo | null;
    rank: number;
    streak: number;
    longest_streak: number;
    stats: ProfileStats;
    achievements: Achievement[];
    privacy: ProfilePrivacy;
}

export interface ProfileResponse {
    success: boolean;
    data: ProfileData;
}

export interface ActivityEntry {
    reason: string;
    xp: number;
    coins: number;
    negative: boolean;
    datetime: string;
}

export interface ActivityData {
    entries: ActivityEntry[];
    page: number;
    total_pages: number;
    has_next: boolean;
}

export interface ActivityResponse {
    success: boolean;
    data: ActivityData;
}

export interface HeatmapEntry {
    date: string;
    count: number;
}

export interface HeatmapResponse {
    success: boolean;
    data: HeatmapEntry[];
}
