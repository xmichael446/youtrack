import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';
import type { ProfileData } from '../../services/apiTypes';

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
  <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-50 dark:border-slate-800/70 last:border-0">
    <div className="flex-1">
      <p className="text-sm font-medium text-brand-dark dark:text-white">{label}</p>
      <p className="text-xs font-normal text-gray-400 dark:text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 mt-0.5 disabled:opacity-60 ${checked ? 'bg-brand-primary' : 'bg-gray-200 dark:bg-slate-700'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
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
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400 hover:text-brand-primary transition-colors text-xs font-medium">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        <h2 className="text-lg font-bold text-brand-dark dark:text-white">{t('privacySettings')}</h2>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm px-5">
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
      </div>
    </div>
  );
};

export default PrivacySettings;
