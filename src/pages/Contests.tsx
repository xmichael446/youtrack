import React, { useState, useCallback } from 'react';
import { ContestProvider } from '../context/ContestContext';
import ContestListView from '../features/contests/ContestListView';
import ContestDetailView from '../features/contests/ContestDetailView';
import ContestPlayView from '../features/contests/ContestPlayView';
import ContestReviewView from '../features/contests/ContestReviewView';
import type { ContestNav } from '../features/contests/contestTypes';

let globalContestNav: ContestNav = { view: 'list', contestId: null };

const ContestsInner: React.FC = () => {
  const [nav, setNav] = useState<ContestNav>(globalContestNav);

  const handleNavigate = useCallback((next: ContestNav) => {
    globalContestNav = next;
    setNav(next);
  }, []);

  switch (nav.view) {
    case 'list':
      return <ContestListView onNavigate={handleNavigate} />;
    case 'detail':
      return <ContestDetailView contestId={nav.contestId!} onNavigate={handleNavigate} />;
    case 'play':
      return <ContestPlayView contestId={nav.contestId!} onNavigate={handleNavigate} />;
    case 'review':
      return <ContestReviewView contestId={nav.contestId!} onNavigate={handleNavigate} answers={nav.answers || []} />;
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
