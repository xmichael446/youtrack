import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ContestProvider } from '../context/ContestContext';
import { useNavigation } from '../context/NavigationContext';
import ContestListView from '../features/contests/ContestListView';
import ContestDetailView from '../features/contests/ContestDetailView';
import ContestPlayView from '../features/contests/ContestPlayView';
import ContestReviewView from '../features/contests/ContestReviewView';
import type { ContestNav, ContestView } from '../features/contests/contestTypes';

function paramsToNav(params: Record<string, string>): ContestNav {
  const id = params.id ? Number(params.id) : null;
  const subview = params.subview as ContestView | undefined;

  if (id && subview === 'play') return { view: 'play', contestId: id };
  if (id && subview === 'review') return { view: 'review', contestId: id };
  if (id) return { view: 'detail', contestId: id };
  return { view: 'list', contestId: null };
}

function navToParams(nav: ContestNav): Record<string, string> {
  if (nav.view === 'list' || !nav.contestId) return {};
  if (nav.view === 'detail') return { id: String(nav.contestId) };
  return { id: String(nav.contestId), subview: nav.view };
}

const ContestsInner: React.FC = () => {
  const { params, navigateTo } = useNavigation();
  const [nav, setNav] = useState<ContestNav>(() => paramsToNav(params));
  const [answers, setAnswers] = useState<any[]>([]);

  // Keep internal state in sync when route params change (e.g. browser back/forward)
  const prevParamsRef = useRef(params);
  useEffect(() => {
    const prev = prevParamsRef.current;
    if (prev.id !== params.id || prev.subview !== params.subview) {
      prevParamsRef.current = params;
      setNav(paramsToNav(params));
    }
  }, [params]);

  const handleNavigate = useCallback((next: ContestNav) => {
    setNav(next);
    if (next.answers) setAnswers(next.answers);
    navigateTo('contests', navToParams(next));
  }, [navigateTo]);

  switch (nav.view) {
    case 'list':
      return <ContestListView onNavigate={handleNavigate} />;
    case 'detail':
      return <ContestDetailView contestId={nav.contestId!} onNavigate={handleNavigate} />;
    case 'play':
      return <ContestPlayView contestId={nav.contestId!} onNavigate={handleNavigate} />;
    case 'review':
      return <ContestReviewView contestId={nav.contestId!} onNavigate={handleNavigate} answers={nav.answers || answers} />;
    default:
      return <ContestListView onNavigate={handleNavigate} />;
  }
};

export const Contests: React.FC = () => (
  <ContestProvider>
    <ContestsInner />
  </ContestProvider>
);

export default Contests;
