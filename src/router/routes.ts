import { ViewState } from '../types';

const VIEW_PATH_MAP: Record<ViewState, string | null> = {
  login: null,
  dashboard: '/',
  leaderboard: '/leaderboard',
  lessons: '/lessons',
  rewards: '/rewards',
  profile: '/profile',
  contests: '/contests',
};

const PATH_VIEW_MAP = new Map<string, ViewState>();
for (const [view, path] of Object.entries(VIEW_PATH_MAP)) {
  if (path !== null) {
    PATH_VIEW_MAP.set(path, view as ViewState);
  }
}

export function viewToPath(view: ViewState): string | null {
  return VIEW_PATH_MAP[view];
}

export function pathToView(path: string): ViewState | null {
  return PATH_VIEW_MAP.get(path) ?? null;
}
