# YouTrack LMS - Project Overview

YouTrack LMS is a modern, React-based Learning Management System (LMS) designed for students to track their educational progress, attend lessons, participate in leaderboards, and earn rewards.

## Tech Stack
- **Frontend Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Context API
- **API Communication:** Custom `ApiService` with Fetch API, supporting token-based authentication and automatic token refresh.

## Project Structure
- `src/components/`: Reusable UI components (Header, Footer, CoinsHistory, etc.).
- `src/context/`: Global state management using Context API (Dashboard, Language, Leaderboard, Notification, Shop).
- `src/pages/`: Main view components (Dashboard, Leaderboard, Lessons, Login, Rewards).
- `src/services/`: API client logic and custom hooks (`ApiService.ts`, `useApi.ts`).
- `src/types/`: TypeScript interfaces and type definitions.
- `src/constants/`: Configuration values and multi-language translations.
- `public/`: Static assets, including themed favicons.

## Key Features
- **Student Dashboard:** Visual representation of course progress, attendance, and assignments.
- **Leaderboard:** Competitive ranking system for students.
- **Lesson Management:** View curriculum, upcoming lessons, and mark attendance.
- **Gift Shop:** Reward system where students can spend "coins" or "XP".
- **Multi-language Support:** English and Uzbek (managed via `LanguageContext`).
- **Theming:** Dark and Light mode support with automatic system preference detection.
- **Authentication:** Secure login with JWT token management and automatic refresh logic.

## Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Environment Configuration
Create a `.env` file in the root directory (refer to `.env` or ask for `VITE_API_BASE_URL`):
```env
VITE_API_BASE_URL=https://your-api-endpoint.com/api
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Development Conventions
- **TypeScript:** Rigorous typing for all API responses and component props.
- **Context API:** Prefer Context API for module-level state (e.g., `DashboardContext`) rather than passing props through many layers.
- **API Service:** Use the singleton `apiService` from `src/services/ApiService.ts` for all network requests to ensure consistent header and token management.
- **Styling:** Use Tailwind CSS utility classes. Prefer the `brand-primary` color for main actions and highlights.
- **Naming:** Follow standard React naming conventions (PascalCase for components, camelCase for variables/functions).
