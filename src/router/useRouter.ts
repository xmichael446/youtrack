import { useState, useCallback, useEffect, useRef } from 'react';
import { ViewState } from '../types';
import { viewToPath, pathToView } from './routes';

export function viewFromUrl(): ViewState | null {
  return pathToView(window.location.pathname);
}

export function useRouter(defaultView: ViewState = 'dashboard') {
  const [view, setView] = useState<ViewState>(() => viewFromUrl() ?? defaultView);
  const skipPopState = useRef(false);

  const navigate = useCallback((nextView: ViewState, replace = false) => {
    setView(nextView);
    const path = viewToPath(nextView);
    if (path === null) return;

    skipPopState.current = true;
    if (replace) {
      window.history.replaceState({ view: nextView }, '', path);
    } else {
      window.history.pushState({ view: nextView }, '', path);
    }
  }, []);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (skipPopState.current) {
        skipPopState.current = false;
        return;
      }
      const stateView = (e.state as { view?: ViewState } | null)?.view;
      const resolved = stateView ?? viewFromUrl() ?? defaultView;
      setView(resolved);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [defaultView]);

  // Sync the initial URL on mount (replace so we don't create a duplicate entry)
  useEffect(() => {
    const path = viewToPath(view);
    if (path !== null && window.location.pathname !== path) {
      window.history.replaceState({ view }, '', path);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { view, navigate } as const;
}
