import { User, StudentRank, ActivityItem, RewardItem, HomeworkSubmission, CurriculumItem } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Qobilov Hasan',
  avatar: 'https://picsum.photos/200/200',
  coins: 27,
  xp: 240,
  groupRank: 2,
  globalRank: 5
};


export const LEADERBOARD_DATA: StudentRank[] = [
  { rank: 1, name: 'Ozodbek Rajabov', points: 240, avgXp: '98%' },
  { rank: 2, name: 'Qobilov Hasan', points: 240, avgXp: '96%', isCurrentUser: true },
  { rank: 3, name: 'Tajimuratov Ilxam', points: 70, avgXp: '45%' },
  { rank: 4, name: 'Odina Yuldasheva', points: 65, avgXp: '42%' },
  { rank: 5, name: 'Ochilov Bunyod', points: 50, avgXp: '30%' },
];

export const COURSE_LEADERBOARD_DATA: StudentRank[] = [
  { rank: 1, name: 'Ozodbek Rajabov', points: 240, avgXp: '98%' },
  { rank: 2, name: 'Qobilov Hasan', points: 240, avgXp: '96%', isCurrentUser: true },
  { rank: 3, name: 'Dilshod Karimov', points: 220, avgXp: '92%' },
  { rank: 4, name: 'Malika Tursunova', points: 210, avgXp: '88%' },
  { rank: 5, name: 'Sardor Alimov', points: 200, avgXp: '85%' },
  { rank: 6, name: 'Tajimuratov Ilxam', points: 70, avgXp: '45%' },
  { rank: 7, name: 'Odina Yuldasheva', points: 65, avgXp: '42%' },
  { rank: 8, name: 'Ochilov Bunyod', points: 50, avgXp: '30%' },
];

export const ACTIVITY_LOG: ActivityItem[] = [
  { id: 'a1', date: 'Feb 3, 2026', action: 'Lesson Attendance', xpChange: 10, coinChange: 1 },
  { id: 'a2', date: 'Feb 2, 2026', action: 'Homework Submission (Lesson 6)', xpChange: 20, coinChange: 5 },
  { id: 'a3', date: 'Feb 1, 2026', action: "Claimed 'L&R Intensive 4.0 (Previous)'", xpChange: null, coinChange: -20 },
  { id: 'a4', date: 'Jan 30, 2026', action: 'Lesson Attendance', xpChange: 10, coinChange: 1 },
];

export const REWARDS_DATA: RewardItem[] = [
  {
    id: 'r1',
    title: 'L&R Intensive 4.0 (Previous)',
    cost: 20,
    description: 'Sizdan oldingi L&R Intensive kursi uchun Link. 24ta Video dars, 12ta Article hamda 24ta Homework.',
    claimed: false,
    image: 'https://picsum.photos/400/200'
  },
  {
    id: 'r2',
    title: '1-on-1 Mock Exam',
    cost: 50,
    description: 'Personal feedback session with the instructor.',
    claimed: false,
    image: 'https://picsum.photos/401/200'
  },
];

export const SUBMISSION_HISTORY: HomeworkSubmission[] = [
  { lessonId: 7, date: 'Feb 3, 03:28 AM', status: 'Awaiting approval' },
  { lessonId: 7, date: 'Feb 2, 08:20 PM', status: 'Rejected', comment: "boshqa vazifani topshirgansiz! Buni hali o'tmadikkku!!" },
  { lessonId: 7, date: 'Feb 2, 08:17 PM', status: 'Rejected', comment: "boshqa vazifa" },
];

export const CURRICULUM_DATA: CurriculumItem[] = [
  { id: 'c1', order: 1, topic: 'Introduction to IELTS & Reading Basics', date: '2026-01-15', time: '19:00', duration: '90 min', status: 'attended' },
  { id: 'c2', order: 2, topic: 'Scanning & Skimming Techniques', date: '2026-01-20', time: '19:00', duration: '90 min', status: 'attended' },
  { id: 'c3', order: 3, topic: 'Sentence Completion & True/False/Not Given', date: '2026-01-25', time: '19:00', duration: '90 min', status: 'absent' },
  { id: 'c4', order: 4, topic: 'Matching Headings & Information', date: '2026-01-30', time: '19:00', duration: '90 min', status: 'attended' },
  { id: 'c5', order: 5, topic: 'Multiple Choice & Diagram Labeling', date: '2026-02-04', time: '19:00', duration: '90 min', status: 'attended' },
  { id: 'c6', order: 6, topic: 'Summary Completion & Table Tasks', date: '2026-02-09', time: '19:00', duration: '90 min', status: 'upcoming' },
  { id: 'c7', order: 7, topic: 'Full Reading Mock Test - Level 1', date: '2026-02-14', time: '19:00', duration: '120 min', status: 'upcoming' },
  { id: 'c8', order: 8, topic: 'Review & Strategy Session', date: '2026-02-19', time: '19:00', duration: '90 min', status: 'upcoming' },
];
export const COURSE_INFO = {
  title: 'L&R Intensive 5.0',
  description: 'Master IELTS Reading & Listening with intensive practice, daily tasks, and live strategy sessions.',
  logo: 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png', // More descriptive course logo icon
  instructor: {
    name: 'Mr. Adizov'
  }
};