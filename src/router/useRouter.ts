import { useState, useCallback, useEffect, useRef } from 'react';
import { ViewState } from '../types';
import { RouteParams, RouteMatch, pathToRoute, buildPath } from './routes';

export function viewFromUrl(): RouteMatch | null {
  return pathToRoute(window.location.pathname);
}

interface RouterState {
  view: ViewState;
  params: RouteParams;
}

export function useRouter(defaultView: ViewState = 'dashboard') {
  const [state, setState] = useState<RouterState>(() => {
    const match = viewFromUrl();
    return match ?? { view: defaultView, params: {} };
  });

  // Track how many pushState entries we own so goBack knows
  // whether history.back() will stay inside the app.
  const depth = useRef(0);

  const navigate = useCallback(
    (nextView: ViewState, params: RouteParams = {}, replace = false) => {
      setState({ view: nextView, params });
      const path = buildPath(nextView, params);
      if (path === null) return;

      const historyState = { view: nextView, params };
      if (replace) {
        window.history.replaceState(historyState, '', path);
      } else {
        depth.current++;
        window.history.pushState(historyState, '', path);
      }
    },
    [],
  );

  const goBack = useCallback(
    (fallbackView: ViewState = 'dashboard', fallbackParams: RouteParams = {}) => {
      if (depth.current > 0) {
        depth.current--;
        window.history.back();
      } else {
        // No app history to pop (deep-linked) — navigate to fallback
        navigate(fallbackView, fallbackParams, true);
      }
    },
    [navigate],
  );

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const histState = e.state as { view?: ViewState; params?: RouteParams } | null;
      if (histState?.view) {
        setState({ view: histState.view, params: histState.params ?? {} });
      } else {
        const match = viewFromUrl();
        setState(match ?? { view: defaultView, params: {} });
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [defaultView]);

  // Sync the initial URL on mount
  useEffect(() => {
    const path = buildPath(state.view, state.params);
    if (path !== null && window.location.pathname !== path) {
      window.history.replaceState({ view: state.view, params: state.params }, '', path);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { view: state.view, params: state.params, navigate, goBack } as const;
}
