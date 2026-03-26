export type ContestView = 'list' | 'detail' | 'play' | 'review';

export interface ContestNav {
  view: ContestView;
  contestId: number | null;
  answers?: any[];
}
