import { ViewState } from '../types';

export type RouteParams = Record<string, string>;

export interface RouteMatch {
  view: ViewState;
  params: RouteParams;
}

interface RoutePattern {
  view: ViewState;
  segments: string[];   // e.g. ['profile', ':id?']
  buildPath: (params: RouteParams) => string;
}

// Patterns are matched top-to-bottom; more-specific first.
const ROUTES: RoutePattern[] = [
  {
    view: 'contests',
    segments: ['contests', ':id', ':subview'],
    buildPath: (p) => `/contests/${p.id}/${p.subview}`,
  },
  {
    view: 'contests',
    segments: ['contests', ':id'],
    buildPath: (p) => `/contests/${p.id}`,
  },
  {
    view: 'contests',
    segments: ['contests'],
    buildPath: () => '/contests',
  },
  {
    view: 'profile',
    segments: ['profile', ':id'],
    buildPath: (p) => `/profile/${p.id}`,
  },
  {
    view: 'profile',
    segments: ['profile'],
    buildPath: () => '/profile',
  },
  {
    view: 'leaderboard',
    segments: ['leaderboard'],
    buildPath: () => '/leaderboard',
  },
  {
    view: 'lessons',
    segments: ['lessons'],
    buildPath: () => '/lessons',
  },
  {
    view: 'rewards',
    segments: ['rewards'],
    buildPath: () => '/rewards',
  },
  {
    view: 'dashboard',
    segments: [],             // root "/"
    buildPath: () => '/',
  },
];

export function pathToRoute(pathname: string): RouteMatch | null {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

  for (const route of ROUTES) {
    if (route.segments.length !== parts.length) continue;

    const params: RouteParams = {};
    let matched = true;

    for (let i = 0; i < route.segments.length; i++) {
      const seg = route.segments[i];
      if (seg.startsWith(':')) {
        params[seg.slice(1)] = parts[i];
      } else if (seg !== parts[i]) {
        matched = false;
        break;
      }
    }

    if (matched) return { view: route.view, params };
  }

  return null;
}

export function buildPath(view: ViewState, params: RouteParams = {}): string | null {
  if (view === 'login') return null;

  // Find the most specific route that can be satisfied by the given params.
  // Iterate in order (most-specific first) and pick the first whose required
  // params are all present.
  for (const route of ROUTES) {
    if (route.view !== view) continue;

    const requiredParams = route.segments
      .filter((s) => s.startsWith(':'))
      .map((s) => s.slice(1));

    if (requiredParams.every((p) => params[p] !== undefined)) {
      return route.buildPath(params);
    }
  }

  return null;
}
