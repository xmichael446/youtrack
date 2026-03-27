import React from 'react';
import {
  Swords,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { ContestDetailData } from '../../services/apiTypes';
import { Button } from '../../components/ui';

const ContestActionButton: React.FC<{
  detail: ContestDetailData;
  onAction: () => void;
  loading: boolean;
  t: (k: string) => string;
}> = ({ detail, onAction, loading, t }) => {
  if (detail.status === 'scheduled') {
    if (detail.is_registered) {
      return (
        <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-card bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-body font-bold font-mono">{t('contestRegistered')}</span>
        </div>
      );
    }
    return (
      <Button
        variant="primary"
        size="lg"
        fullWidth
        icon={<Users className="w-5 h-5" />}
        loading={loading}
        disabled={loading || detail.question_count === 0}
        onClick={onAction}
      >
        {detail.question_count === 0 ? t('contestBeingPrepared') : t('contestRegister')}
      </Button>
    );
  }
  if (detail.status === 'open' && detail.is_registered) {
    return (
      <Button
        variant="primary"
        size="lg"
        fullWidth
        icon={<Swords className="w-5 h-5" />}
        disabled={detail.question_count === 0}
        onClick={onAction}
        className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 from-emerald-500 to-emerald-600"
      >
        {t('contestEnter')}
      </Button>
    );
  }
  if (detail.status === 'open' && !detail.is_registered) {
    return (
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        disabled
        className="cursor-not-allowed"
      >
        {t('contestRegistrationClosed')}
      </Button>
    );
  }
  return null;
};

export default ContestActionButton;
