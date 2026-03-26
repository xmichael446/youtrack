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
  const skipPopState = useRef(false);

  const navigate = useCallback(
    (nextView: ViewState, params: RouteParams = {}, replace = false) => {
      setState({ view: nextView, params });
      const path = buildPath(nextView, params);
      if (path === null) return;

      skipPopState.current = true;
      const historyState = { view: nextView, params };
      if (replace) {
        window.history.replaceState(historyState, '', path);
      } else {
        window.history.pushState(historyState, '', path);
      }
    },
    [],
  );

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (skipPopState.current) {
        skipPopState.current = false;
        return;
      }
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

  return { view: state.view, params: state.params, navigate } as const;
}
