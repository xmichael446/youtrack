# Codebase Structure

**Analysis Date:** 2026-03-27

## Directory Layout

```
YouTrack/
├── public/               # Static assets (favicons, logos, manifests)
├── src/
│   ├── App.tsx           # Root authenticated layout (sidebar, nav, main content area)
│   ├── index.tsx         # Application entry point
│   ├── types.ts          # Global type definitions (ViewState, User, etc.)
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Primitive UI components (buttons, badges, loaders)
│   │   ├── Header.tsx    # Top navigation bar with user menu, theme toggle
│   │   ├── Footer.tsx    # Sidebar footer with settings/logout
│   │   ├── Curriculum.tsx # Course curriculum display
│   │   ├── CoinsHistory.tsx # User coin transaction history
│   │   └── LoadingScreen.tsx # Full-page loading spinner
│   ├── pages/            # Full-page view components (pages in ViewState)
│   │   ├── Login.tsx     # Telegram authentication flow
│   │   ├── Dashboard.tsx # Home page with next event, progress, quick actions
│   │   ├── Lessons.tsx   # Lesson wrapper (delegates to LessonsProvider + LessonsContent)
│   │   ├── Leaderboard.tsx # Global/group rankings
│   │   ├── Rewards.tsx   # Gift shop rewards catalog
│   │   ├── Profile.tsx   # User profile view (own or peer, deep-linkable via :id)
│   │   └── Contests.tsx  # Contest hub with list, detail, play, review views
│   ├── features/         # Feature-specific component modules
│   │   ├── lessons/      # Lesson-related features
│   │   │   ├── LessonsContent.tsx       # Main lessons layout
│   │   │   ├── CurrentAssignmentSection.tsx # Active assignment card
│   │   │   ├── ActiveAttendanceCard.tsx # Attendance marking
│   │   │   ├── AssignmentHistoryCard.tsx # Past submissions
│   │   │   ├── QuizSection.tsx          # Quiz play/review
│   │   │   ├── SubmissionModal.tsx      # File upload form
│   │   │   └── lessonTypes.ts           # Feature-specific types
│   │   ├── profile/      # Profile-related features
│   │   │   ├── ProfileHero.tsx          # Header section (name, avatar, bio)
│   │   │   ├── ProfileEdit.tsx          # Edit avatar/bio modal
│   │   │   ├── AchievementShowcase.tsx # Badges and achievements
│   │   │   ├── ActivityFeed.tsx         # Paginated activity log
│   │   │   ├── ActivityHeatmap.tsx      # 30-day contribution heatmap
│   │   │   ├── PrivacySettings.tsx      # Hide balance/activity toggles
│   │   │   ├── profileHelpers.ts        # Shared profile utilities
│   │   │   └── index.ts                 # Barrel export
│   │   └── contests/     # Contest-related features
│   │       ├── ContestListView.tsx      # Browse all contests
│   │       ├── ContestDetailView.tsx    # Contest info, prizes, winners
│   │       ├── ContestCard.tsx          # List item component
│   │       ├── ContestActionButton.tsx # Register/Start/Review button
│   │       ├── ContestPlayView.tsx      # Quiz questions + timer
│   │       ├── ContestReviewView.tsx    # Review attempt + leaderboard
│   │       ├── ContestSkeletons.tsx     # Loading skeletons
│   │       └── contestTypes.ts          # Feature-specific types
│   ├── context/          # React Context providers for state management
│   │   ├── LanguageContext.tsx          # i18n (en/uz) + t() translation function
│   │   ├── DashboardContext.tsx         # Enrollment, course, user, curriculum data
│   │   ├── NavigationContext.tsx        # Route params, navigate(), goBack()
│   │   ├── LessonsContext.tsx           # Attendance, assignments, quiz state
│   │   ├── LeaderboardContext.tsx       # Global/group rankings
│   │   ├── ShopContext.tsx              # Rewards catalog and claim state
│   │   ├── ContestContext.tsx           # Contest registration and attempt state
│   │   └── NotificationContext.tsx      # Notification polling
│   ├── router/           # Custom client-side router (no React Router)
│   │   ├── useRouter.ts  # Hook: manages ViewState + params, history integration
│   │   └── routes.ts     # Route patterns, URL parsing, path building
│   ├── services/         # API communication and data fetching
│   │   ├── ApiService.ts # Singleton: HTTP client, token refresh, error handling
│   │   ├── apiTypes.ts   # TypeScript interfaces for all API request/response shapes
│   │   ├── useApi.ts     # Custom hooks: useGet, usePost (wrapper around apiService)
│   │   └── examples.tsx  # Example API usage (reference code)
│   ├── hooks/            # Custom React hooks
│   │   ├── useBodyScrollLock.ts # Prevent page scroll when modal open
│   │   └── useCountdown.ts      # Countdown timer for contests
│   ├── utils/            # Utility functions and helpers
│   │   ├── formatDateTime.ts    # Date/time formatting
│   │   ├── contestHelpers.ts    # Contest-related calculations
│   │   └── telegram.ts          # Open Telegram deep links
│   ├── constants/        # Application constants
│   │   └── translations/ # i18n translation strings
│   │       ├── en.ts     # English translations (key-value object)
│   │       ├── uz.ts     # Uzbek translations (key-value object)
│   │       └── index.ts  # Export barrel
│   └── types.ts          # Global type definitions
├── index.html            # Entry HTML (mounts #root element)
├── vite.config.ts        # Vite build config (React plugin)
├── tsconfig.json         # TypeScript config (React, DOM libs, @ alias)
├── tailwind.config.js    # Tailwind CSS config (brand-primary color)
├── package.json          # Dependencies, scripts (npm run dev, build, preview)
└── .env                  # Environment file (VITE_API_BASE_URL)
```

## Directory Purposes

**public/:**
- Purpose: Static assets served without transformation
- Contains: Favicon variants (light/dark), logo images, manifest files
- Key files: `/favicon/{light,dark}/favicon-32x32.png`, `/logo-{light,dark}.png`

**src/components/:**
- Purpose: Reusable UI building blocks
- Contains: Layout components (Header, Footer), data display (Curriculum, CoinsHistory), loading states
- Key files: `Header.tsx` (navigation + user menu), `Footer.tsx` (account settings), `LoadingScreen.tsx`

**src/components/ui/:**
- Purpose: Primitive, presentational components
- Contains: Badge, icon, button-like components with no data logic
- Key files: `RankBadge.tsx`, `StatusBadge.tsx`, `Shimmer.tsx` (skeleton), `PlaceIcon.tsx`

**src/pages/:**
- Purpose: Top-level view components corresponding to navigation items
- Contains: One component per ViewState (Login, Dashboard, Lessons, Leaderboard, Rewards, Profile, Contests)
- Pattern: Pages delegate to feature components or Context providers
- Key files: `Login.tsx` (auth flow), `Dashboard.tsx` (home), `Contests.tsx` (feature wrapper with internal routing)

**src/features/{feature}/:**
- Purpose: Cohesive feature-specific components and logic
- Contains: Sub-page views, modals, and feature-local types
- Pattern: `ContestListView`, `ContestDetailView`, `ContestPlayView`, `ContestReviewView` for contests feature
- Key files: Feature-specific types in `{feature}Types.ts`, helpers in `{feature}Helpers.ts`

**src/context/:**
- Purpose: React Context providers for application state
- Contains: One provider per major feature or cross-cutting concern
- Pattern: `createContext()` + provider component with `useState`, `useEffect`, custom hooks
- Key files:
  - `DashboardContext.tsx` - Core user/course data (loaded in App.tsx)
  - `NavigationContext.tsx` - Route params (loaded in App.tsx)
  - Feature contexts loaded in page components (e.g., LessonsProvider in Lessons.tsx)

**src/router/:**
- Purpose: Custom client-side routing without external router library
- Contains: URL pattern matching, parameter extraction, history state management
- Key files:
  - `useRouter.ts` - Hook that manages ViewState + params, handles history API
  - `routes.ts` - Route patterns array, pathToRoute(), buildPath() functions

**src/services/:**
- Purpose: API communication layer
- Contains: HTTP client, type definitions, custom hooks
- Key files:
  - `ApiService.ts` - Singleton with request/response interceptors, token refresh
  - `apiTypes.ts` - All API interface definitions (70+ types)
  - `useApi.ts` - Custom hooks useGet/usePost (wrap apiService + Context state)

**src/hooks/:**
- Purpose: Reusable React logic
- Contains: Custom hooks not tied to specific features
- Key files: `useCountdown.ts` (contest timer), `useBodyScrollLock.ts` (modal scroll prevention)

**src/utils/:**
- Purpose: Standalone helper functions
- Contains: Date formatting, contest calculations, Telegram deep link opening
- Key files: `formatDateTime.ts`, `contestHelpers.ts`, `telegram.ts`

**src/constants/:**
- Purpose: Application-wide constants and translations
- Contains: i18n translation objects (English, Uzbek)
- Key files: `translations/en.ts`, `translations/uz.ts`

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell with `<div id="root">` and Vite script injection
- `src/index.tsx`: React root, wraps App with LanguageProvider
- `src/App.tsx`: Authenticated layout, router initialization, provider nesting

**Configuration:**
- `vite.config.ts`: Vite build settings, React plugin
- `tsconfig.json`: TypeScript compiler options, path alias `@` → `src/`
- `tailwind.config.js`: Tailwind CSS customization, `brand-primary` color
- `package.json`: Dependencies (React, Tailwind, Lucide icons, Vite), scripts (dev, build, preview)

**Core Logic:**
- `src/services/ApiService.ts`: HTTP client with token refresh, error interception
- `src/router/useRouter.ts`: Navigation state and browser history management
- `src/context/DashboardContext.tsx`: Core user/course/enrollment data

**Testing:**
- No test framework configured in this project

## Naming Conventions

**Files:**
- Component files: PascalCase (e.g., `Header.tsx`, `ContestListView.tsx`)
- Utility files: camelCase (e.g., `formatDateTime.ts`, `useCountdown.ts`)
- Type definition files: filename ends with `Types.ts` (e.g., `lessonTypes.ts`, `contestTypes.ts`)
- Helper/utility files: filename ends with `Helpers.ts` (e.g., `profileHelpers.ts`, `contestHelpers.ts`)
- Barrel exports: `index.ts` (e.g., `src/features/profile/index.ts`)
- Context: `{Feature}Context.tsx` (e.g., `LessonsContext.tsx`)
- Custom hooks: `use{Feature}.ts` (e.g., `useRouter.ts`, `useCountdown.ts`)

**Directories:**
- Feature directories: lowercase (e.g., `features/lessons/`, `features/profile/`, `features/contests/`)
- API-related: `services/`
- UI layer: `pages/`, `components/`
- State: `context/`
- Routing: `router/`

## Where to Add New Code

**New Feature:**
- Create directory under `src/features/{featureName}/`
- Create types file: `src/features/{featureName}/{featureName}Types.ts`
- Create helper file if needed: `src/features/{featureName}/{featureName}Helpers.ts`
- Create Context if stateful: `src/context/{Feature}Context.tsx`
- Create page wrapper: `src/pages/{Feature}.tsx` (if top-level view)
- Create components: `src/features/{featureName}/*.tsx`
- Register route in `src/router/routes.ts` if adding new ViewState

**New Component/Module:**
- Reusable UI: `src/components/{ComponentName}.tsx`
- Primitive UI: `src/components/ui/{ComponentName}.tsx`
- Feature-specific: `src/features/{feature}/{ComponentName}.tsx`

**New API Endpoint:**
- Add type in `src/services/apiTypes.ts` (request + response interfaces)
- Add method in `src/services/ApiService.ts` (e.g., `async getContests(): Promise<ContestListResponse>`)
- Use in Context via custom hook from `src/services/useApi.ts` or directly via apiService

**Utilities:**
- Shared helpers: `src/utils/{featureName}Helpers.ts`
- General utilities: `src/utils/{utilityName}.ts`
- Formatting: `src/utils/format*.ts`
- Hooks: `src/hooks/use*.ts`

**Constants:**
- Translations: `src/constants/translations/{lang}.ts`
- Feature-specific constants: Define in types file or at top of context/component

## Special Directories

**node_modules/:**
- Purpose: Downloaded dependencies
- Generated: Yes (via npm install)
- Committed: No (.gitignore excludes)

**.planning/codebase/:**
- Purpose: Architecture documentation (this file and peers)
- Generated: No (hand-written by analysis)
- Committed: Yes (part of codebase reference)

**dist/:**
- Purpose: Production build output
- Generated: Yes (via npm run build)
- Committed: No (.gitignore excludes)

**public/:**
- Purpose: Static assets
- Generated: No (hand-maintained)
- Committed: Yes (favicon variants, logos)

---

*Structure analysis: 2026-03-27*
