import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';
import type { ProfileData } from '../../services/apiTypes';
import { Card } from '../../components/ui';

// ---------------------------------------------------------------------------
// ToggleRow
// ---------------------------------------------------------------------------

const ToggleRow: React.FC<{
  label: string;
  desc: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}> = ({ label, desc, checked, disabled, onToggle }) => (
  <div className="flex items-start justify-between gap-4 py-4 border-b border-surface-secondary/70 dark:border-surface-dark-elevated/70 last:border-0">
    <div className="flex-1">
      <p className="text-body text-brand-dark dark:text-text-theme-dark-primary">{label}</p>
      <p className="text-caption text-text-theme-muted dark:text-text-theme-dark-muted mt-0.5 leading-relaxed">{desc}</p>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-pill transition-colors duration-normal shrink-0 mt-0.5 disabled:opacity-60 ${checked ? 'bg-brand-primary' : 'bg-surface-secondary dark:bg-surface-dark-elevated'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-normal ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// PrivacySettings
// ---------------------------------------------------------------------------

const PrivacySettings: React.FC<{
  profile: ProfileData;
  onToggle: (field: 'hide_balance' | 'hide_activity', value: boolean) => Promise<void>;
  onBack: () => void;
}> = ({ profile, onToggle, onBack }) => {
  const { t } = useLanguage();
  const [pending, setPending] = useState<string | null>(null);
  const [localPrivacy, setLocalPrivacy] = useState(profile.privacy);

  const handleToggle = async (field: 'hide_balance' | 'hide_activity') => {
    const newVal = !localPrivacy[field];
    const prev = localPrivacy[field];
    setPending(field);
    setLocalPrivacy(p => ({ ...p, [field]: newVal }));
    try {
      await onToggle(field, newVal);
    } catch {
      setLocalPrivacy(p => ({ ...p, [field]: prev }));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-normal">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1 text-text-theme-secondary dark:text-text-theme-dark-secondary hover:text-brand-primary transition-colors text-caption">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        <h2 className="text-h3 text-brand-dark dark:text-text-theme-dark-primary">{t('privacySettings')}</h2>
      </div>
      <Card variant="default" padding="none" className="px-4">
        <ToggleRow
          label={t('hideBalance')} desc={t('hideBalanceDesc')}
          checked={localPrivacy.hide_balance} disabled={pending !== null}
          onToggle={() => handleToggle('hide_balance')}
        />
        <ToggleRow
          label={t('hideActivity')} desc={t('hideActivityDesc')}
          checked={localPrivacy.hide_activity} disabled={pending !== null}
          onToggle={() => handleToggle('hide_activity')}
        />
      </Card>
    </div>
  );
};

export default PrivacySettings;
