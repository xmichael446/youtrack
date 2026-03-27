import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, AlertCircle } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';
import type { ProfileData } from '../../services/apiTypes';
import { getInitials, getAvatarBg } from './profileHelpers';

const ProfileEdit: React.FC<{
  profile: ProfileData;
  enrollmentId: number | null;
  onSave: (bio: string, avatar?: File) => Promise<void>;
  onBack: () => void;
  saving: boolean;
}> = ({ profile, enrollmentId, onSave, onBack, saving }) => {
  const { t } = useLanguage();
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(profile.avatar ? `${baseUrl}${profile.avatar}` : null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const id = enrollmentId ?? 0;

  useEffect(() => {
    return () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setFileError(t('avatarTooBig')); return; }
    setFileError(null);
    setAvatar(file);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreview(url);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-normal">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="flex items-center gap-1 text-text-theme-secondary dark:text-text-theme-dark-secondary hover:text-brand-primary transition-colors text-caption">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
        <h2 className="text-h3 text-brand-dark dark:text-text-theme-dark-primary">{t('editProfile')}</h2>
      </div>

      <form onSubmit={async e => { e.preventDefault(); await onSave(bio, avatar ?? undefined); }}
        className="bg-surface-primary dark:bg-surface-dark-primary rounded-card border border-surface-secondary dark:border-surface-dark-elevated shadow-sm p-4 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button type="button" aria-label={t('uploadPhoto')} className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            {preview ? (
              <img src={preview} alt="avatar" className="w-24 h-24 rounded-card object-cover ring-2 ring-surface-secondary dark:ring-surface-dark-elevated" />
            ) : (
              <div className="w-24 h-24 rounded-card flex items-center justify-center text-white text-h1 ring-2 ring-surface-secondary dark:ring-surface-dark-elevated"
                style={{ backgroundColor: getAvatarBg(id) }}>
                {getInitials(profile.full_name)}
              </div>
            )}
            <div className="absolute inset-0 rounded-card flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="text-caption text-brand-primary hover:text-brand-primary/80 transition-colors">
            {t('uploadPhoto')}
          </button>
          {fileError && (
            <div className="flex items-center gap-1 text-red-500 text-caption">
              <AlertCircle className="w-3.5 h-3.5" />{fileError}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Bio */}
        <div>
          <label className="block section-label mb-2">{t('bio')}</label>
          <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 280))} placeholder={t('bioPlaceholder')} rows={4}
            className="w-full px-4 py-3 bg-surface-secondary dark:bg-surface-dark-secondary border border-surface-secondary dark:border-surface-dark-elevated rounded-input text-body text-brand-dark dark:text-text-theme-dark-primary placeholder-text-theme-muted dark:placeholder-text-theme-dark-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary resize-none font-sans transition-all" />
          <p className="text-right text-caption text-text-theme-muted dark:text-text-theme-dark-muted mt-1">{bio.length} / 280</p>
        </div>

        <button type="submit" disabled={saving}
          className="w-full h-12 rounded-input bg-brand-primary text-white font-bold text-body hover:bg-brand-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20">
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {t('saveChanges')}
        </button>
      </form>
    </div>
  );
};

export default ProfileEdit;
